const axios = require('axios')
const handlebars = require('express-handlebars');
const MsgDB = require('../services/msgdb.js');
const bCrypt = require('bcrypt');
const cpus = require('os').cpus();
const compression = require('compression');

const mongoose = require('mongoose')
const UsersDAO = mongoose.model('users', { 
    username:   { type: String, required: true },
    password:   { type: String, required: true }
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


function isValidPassword(user, password) {
    return bCrypt.compareSync(password, user.password);
}
  
function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

class WebServer{
    constructor(app, io, cfg_authors, cfg_msg, logger){

        // ---------------------------------------------------------------------------------------------------------
        // Mongo User Database
        // ---------------------------------------------------------------------------------------------------------
        mongoose.connect('mongodb+srv://mongodb+srv://[username]:[password]@[server]');
        

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion Passport Login
        // ---------------------------------------------------------------------------------------------------------
        passport.use('login', new LocalStrategy((username, password, done) => {
            UsersDAO.find({username})
            .then(users=>{
                const user = users[0];
                if (isValidPassword(user, password)){
                    return done(null, user)
                }else{
                    return done((null, false))
                }
            })
            .catch(err=>{
                return done((null, false))
            })
        }));

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion Passport Register
        // ---------------------------------------------------------------------------------------------------------
        passport.use('register', new LocalStrategy({passReqToCallback: true}, (req, username, password, done) => {

            // Busco si el usuario se encontraba registrado previamente.
            UsersDAO.countDocuments({username})
            .then(cantidad=>{
                if (cantidad>0){
                    return (done(null, false));
                }else{
                    const user = {
                        username,
                        password: createHash(password)
                    };  
                    UsersDAO.create(user)
                    .then((user)=>{
                        return (done(null, user));
                    })
                    .catch(err=>{
                        return (done(err, null));
                    })
                }
            })
            .catch(err=>{
                return (done(err, null));
            })

        }));

        passport.serializeUser(function (user, done) {
            done(null, user.username);
          });
          
        passport.deserializeUser(function (username, done) {
            UsersDAO.find({username})
            .then(user=>{
                done(null, user[0]);
            })            
        });

        // Instalo los middlewares de Express
        app.use(passport.initialize());
        app.use(passport.session());
        
        // Defino Middleware para validar autenticacion
        function isAuth(req, res, next) {
            if (req.isAuthenticated()) {
                next()
            } else {
                res.redirect('/login')
            }
        }

        // ---------------------------------------------------------------------------------------------------------
        // Render de vistas
        // ---------------------------------------------------------------------------------------------------------
        app.engine("hbs",
            handlebars({
                extname: ".hbs",
                defaultLayout: "index.hbs",
                layoutsDir: __dirname + "/views/layouts",   
                partialsDir: __dirname + "/views/partials",
                helpers: {
                    webTitle: function() {
                        return process.env.WEB_SERVER_TITLE;
                    },
                }
            })
        );
        
        app.set('views', './webserver/views');
        app.set('view engine', 'hbs');


        // ---------------------------------------------------------------------------------------------------------
        // Controladores
        // ---------------------------------------------------------------------------------------------------------
        
        // Root
        app.get('/', isAuth, (req,res)=>{
            res.redirect('/productos');
        });

        // Login
        app.get('/login', (req, res)=>{
            res.render('login', {layout: 'login'});
        });

        app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/productos' }))

        app.get('/faillogin', (req, res) => {
            res.render('loginerror', {layout: 'login'});
        })

        // Logout
        app.get('/logout', (req, res)=>{
            req.logout();
            res.render('goodbye', {layout: 'login'});
        })

        // Register
        app.get('/register',(req,res)=>{
            res.render('register', {layout: 'login'});
        });

        app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))

        app.get('/failregister', (req, res) => {
            res.render('registererror',{layout: 'login'});
        });

        // Main Productos
        app.get('/productos', isAuth, (req,res)=>{
            const username = req.user.username;
            res.render('formulario', {username});
        });

        //-----------------------------------------------------------------------------------------------------------
        // Mock Productos
        app.get('/test', (req,res)=>{
            res.render('test', { title: 'Test', layout: 'test' });
        });

        // Info
        app.get('/info', (req,res)=>{
            const info = {
                args: process.argv.slice(2),
                path: process.argv[0],
                cwd: process.cwd(),
                pid: process.pid,
                version: process.version,
                title: process.title,
                platform: process.platform,
                memUsage: process.memoryUsage(),
                num_cpu: cpus.length
            }
            res.render('info', { info, layout: 'info' });
        });

        app.get('/info_debug', (req,res)=>{
            const info = {
                args: process.argv.slice(2),
                path: process.argv[0],
                cwd: process.cwd(),
                pid: process.pid,
                version: process.version,
                title: process.title,
                platform: process.platform,
                memUsage: process.memoryUsage(),
                num_cpu: cpus.length
            }
            console.log(info);
            res.render('info', { info, layout: 'info' });
        });        

        app.get('/info_gzip', compression(), (req,res)=>{
            const info = {
                args: process.argv.slice(2),
                path: process.argv[0],
                cwd: process.cwd(),
                pid: process.pid,
                version: process.version,
                title: process.title,
                platform: process.platform,
                memUsage: process.memoryUsage(),
                num_cpu: cpus.length
            }
            res.render('info', { info, layout: 'info' });
        });

        // ---------------------------------------------------------------------------------------------------------
        // Cargar Mensajes previos desde archivo
        // ---------------------------------------------------------------------------------------------------------
        this.msgdb = new MsgDB(cfg_authors, cfg_msg,async (mensajes)=>{
            io.sockets.emit('mensajes', mensajes);
        })

        // Configuracion del WebSocket
        io.on('connection', async (socket)=>{
            logger.info(`Cliente conectado: ${socket.id}`);

            // WebSocket de Productos
            axios.get(process.env.WEB_SERVER_URL + 'api/productos')
            .then(res=>{
                const productos = res.data;
                socket.emit('productos', productos);
            })
            .catch(err=>{
                console.log("Error Axios Get /api/productos");
            })            
        
            socket.on('nuevo-producto', async (dato)=>{
                await axios.post(process.env.WEB_SERVER_URL + 'api/productos', dato);
                let array_productos = await axios.get(process.env.WEB_SERVER_URL + 'api/productos')
                io.sockets.emit("productos", array_productos.data);           
            })
            
            // WebSocket de Chat
            if (this.msgdb.isStarted()){
                const data = await this.msgdb.getAllMessages();
                socket.emit('mensajes', data);
            }

            socket.on('new-message', async mensaje=>{
                mensaje.time = new Date().toLocaleString();
                this.msgdb.addMsg(mensaje);
                const data = await this.msgdb.getAllMessages();
                io.sockets.emit('mensajes', data);
            })

        });
    }

}

module.exports = WebServer;