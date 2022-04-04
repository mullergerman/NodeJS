const axios = require('axios')
const handlebars = require('express-handlebars');
const MsgDB = require('../services/msgdb.js');


class WebServer{
    constructor(app, io, cfg_authors, cfg_msg){
        // Render de vistas
        app.engine("hbs",
            handlebars({
                extname: ".hbs",
                defaultLayout: "index.hbs",
                layoutsDir: __dirname + "/views/layouts",   
                partialsDir: __dirname + "/views/partials"
            })
        );
        
        app.set('views', './webserver/views');
        app.set('view engine', 'hbs');

        app.get('/', (req,res)=>{
            if (req.session.username){
                res.redirect('/productos');
            }else{
                res.redirect('/login');
            }
        });

        app.post('/productos', (req, res)=>{
            req.session.username = req.body.username;
            res.render('formulario', {user: req.session.username});
        })

        app.post('/logout', (req, res)=>{
            const user = req.session.username;
            req.session.destroy(err=>{
                if (!err){
                    res.render('goodbye', {user: user, layout: 'login'})
                }else{
                    res.send({status: 'Logout Error', body: err});
                } 
            })
        })

        app.get('/productos', (req,res)=>{
            if (req.session.username){
                res.render('formulario', {user: req.session.username});
            }else{
                res.redirect('/login');
            }
        });

        app.get('/test', (req,res)=>{
            res.render('test', { title: 'Test', layout: 'test' });
        });

        app.get('/login', (req,res)=>{
            res.render('login', {layout: 'login'});
        });

        // Cargar Mensajes previos desde archivo
        this.msgdb = new MsgDB(cfg_authors, cfg_msg,async (mensajes)=>{
            io.sockets.emit('mensajes', mensajes);
        })

        // Configuracion del WebSocket
        io.on('connection', async (socket)=>{
            console.log(`Cliente conectado: ${socket.id}`);

            // WebSocket de Productos
            axios.get('http://localhost:8080/api/productos')
            .then(res=>{
                const productos = res.data;
                socket.emit('productos', productos);
            })            
        
            socket.on('nuevo-producto', async (dato)=>{
                await axios.post('http://localhost:8080/api/productos', dato);
                let array_productos = await axios.get('http://localhost:8080/api/productos')
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