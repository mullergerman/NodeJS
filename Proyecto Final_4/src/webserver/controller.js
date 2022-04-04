import { Server as HttpServer} from 'http';
import { Server as IOServer} from 'socket.io';
import { loggerFE as logger} from '../utils/logger.js'
import sharedsession from 'express-socket.io-session';

class Controller{
    constructor(app, business, sessionController, chat, config){

        const passport = sessionController.getPassport();
        const session = sessionController.getSession();

        // ---------------------------------------------------------------------------------------------------------
        // Funcion Privada para validar autenticacion
        // ---------------------------------------------------------------------------------------------------------
        function isAuth(req, res, next) {
            if (req.isAuthenticated()) {
                next()
            } else {
                res.redirect('/login')
            }
        }

        // ---------------------------------------------------------------------------------------------------------
        // Controladores de Control de Session
        // ---------------------------------------------------------------------------------------------------------
        
        // Middleware comun para logger de rutas
        const myLogger = function (req, res, next) {
            logger.debug(req.protocol + '://' + req.get('host') + req.originalUrl);
            next();
        };
        app.use(myLogger);
        
        // Root
        app.get('/', isAuth, (req,res)=>{
            res.redirect('/productos');
        });

        // Login
        app.get('/login', (req, res)=>{
            res.render('login', {layout: 'login', script: '/js/login.js'});
        });

        app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), (req, res) =>{
            req.session.access_token = req.user.access_token;
            res.redirect('/productos');
        })

        app.get('/faillogin', (req, res) => {
            res.render('loginerror', {layout: 'login'});
        })

        // Logout
        app.get('/logout', (req, res)=>{
            req.session.destroy(err =>{
                if(err) logger.error(err)
            });
            res.render('goodbye', {layout: 'login'});
        })

        // Register
        app.get('/register',(req,res)=>{
            res.render('register', {layout: 'login', script:'/js/register.js'});
        });

        app.post('/register', business.getUpload().single('image'),  passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))

        app.get('/failregister', (req, res) => {
            res.render('registererror',{layout: 'login', script:'/js/register.js'});
        });

        // ---------------------------------------------------------------------------------------------------------
        // Controladores de Vista de Usuario
        // ---------------------------------------------------------------------------------------------------------

        // Usuario - Catologo de Productos
        app.get('/productos', isAuth, async (req,res)=>{
            const username = req.user.username;
            const access_token = req.session.access_token;
            const productos = await business.getAllProducts(access_token);
            if (!productos){
                res.render('login', {layout: 'login', script: '/js/login.js'});
            }else{
                let listExists = false;
                if (productos.length > 0){
                    listExists = true;
                }
                let isAdmin = false;
                if (username == config.admin_username) isAdmin = true;
                res.render('productos', {username, script:'/js/productos.js', productos, listExists, isAdmin});
            }
        });

        app.post('/productos', isAuth, async (req,res)=>{
            const username = req.user.username;
            const product_id = req.body.product_id;
            const access_token = req.session.access_token;
            const data = await business.addProductIntoCart(username, product_id, access_token);
            res.redirect('/carrito')
        });

        // Usuario - Carrito Personal
        app.get('/carrito', isAuth, async (req,res)=>{
            const username = req.user.username;
            const access_token = req.session.access_token;
            let data = await business.getUserCartInfo(username, access_token);
            if (!data){
                data= {productos:[]}
            }
            let listExists = false;
            if (data.productos.length > 0){
                listExists = true;
            }
            data.listExists = listExists;
            let isAdmin = false;
            if (username == config.admin_username) isAdmin = true;
            res.render('carrito', {username, data, script:'/js/carrito.js', isAdmin});
        });

        // Usuario - Carrito - Remove Producto
        app.delete('/carrito/:product_idInCart', isAuth, async (req, res)=>{
            const username = req.user.username;
            const product_idInCart = req.params.product_idInCart;
            const access_token = req.session.access_token; 
            const data = await business.removeProductFromCart(username, product_idInCart, access_token);
            res.redirect('/productos')
        })

        // Usuario - Carrito - Comprar
        app.post('/carrito/buy',isAuth, async (req, res)=>{
            const username = req.user.username;
            const access_token = req.session.access_token; 
            const order = await business.buyCart(username, access_token);
            res.json(order)
        });

        // Usuario - Chat
        app.get('/chat', isAuth, (req, res)=>{
            const username = req.user.username;
            let isAdmin = false;
            if (username == config.admin_username) isAdmin = true;
            res.render('chat', { username , script:'/js/chat.js', isAdmin});
        })

        // ---------------------------------------------------------------------------------------------------------
        // Controladores de Vista de Administrador
        // ---------------------------------------------------------------------------------------------------------
        // Administrador - Control de Inventario
        app.get('/admin_inventario', isAuth, async (req,res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const isAdmin = true
                res.render('inventario', { username, script:'/js/admin_inventario.js', isAdmin });
            }else{
                res.redirect('/productos');
            }            
        });

        app.post('/admin_inventario/producto',isAuth , async (req, res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const dato = req.body.dato;
                const access_token = req.session.access_token; 
                await business.newProduct(dato, access_token);
                const productos = await business.getAllProducts(access_token);
                res.json(productos)
            }else{
                res.json({error:'unauthorized'})
            }
        })

        app.put('/admin_inventario/producto',isAuth , async (req, res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const dato = req.body.dato;
                const access_token = req.session.access_token; 
                await business.editProduct(dato, access_token);
                const productos = await business.getAllProducts(access_token);
                res.json(productos)
            }else{
                res.json({error:'unauthorized'})
            }
        })

        app.get('/admin_inventario/producto/',isAuth , async (req, res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const access_token = req.session.access_token; 
                const productos = await business.getAllProducts(access_token);
                res.json(productos)
            }else{
                res.json({error:'unauthorized'})
            }
        })

        app.get('/admin_inventario/producto/:id',isAuth , async (req, res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const product_id = req.params.id;
                const access_token = req.session.access_token; 
                const producto = await business.getProduct(product_id, access_token);
                res.json(producto);
            }else{
                res.json({error:'unauthorized'})
            }
        })

        app.delete('/admin_inventario/producto/:id',isAuth , async (req, res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const product_id = req.params.id;
                const access_token = req.session.access_token;
                await business.removeProduct(product_id, access_token);
                const productos = await business.getAllProducts(access_token);
                res.json(productos)
            }else{
                res.json({error:'unauthorized'})
            }
        })


        // ---------------------------------------------------------------------------------------------------------
        // Controlador Vista Información
        // ---------------------------------------------------------------------------------------------------------
        app.get('/info', isAuth, (req,res)=>{
            const username = req.user.username;
            if (username == config.admin_username){
                const info = {
                    portBE: config.portBE,
                    portFE: config.portFE,
                    database: config.mongo_server.url,
                    admin_email: config.admin_email,
                    expire_time: config.expire_time,
                    instances: config.instances,
                    args: process.argv.slice(2),
                    path: process.argv[0],
                    cwd: process.cwd(),
                    pid: process.pid,
                    version: process.version,
                    title: process.title,
                    platform: process.platform,
                    memUsage: process.memoryUsage(),
                    num_cpu: config.cpus.length
                }
                const username = req.user.username;
                let isAdmin = false;
                if (username == config.admin_username) isAdmin = true;
    
                res.render('info', { username, info , isAdmin});
            }else{
                res.json({error:'unauthorized'})
            }
        });
       

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion del WebSocket
        // ---------------------------------------------------------------------------------------------------------

        // Inicializo Libreria de Socket.IO
        this.httpserver = new HttpServer(app);
        this.io = new IOServer(this.httpserver);

        this.io.use(sharedsession(session, {
            autoSave:true
        })); 


        // DB de Sockets
        const SocketsDB = [];
        

        // Acceptar nuevas conexiones
        this.io.on('connection', async (socket)=>{
            try {
                // Obtengo el username del socket
                const username = socket.handshake.session.passport.user

                // =============================================================================
                // ---------------------------- WebSocket para Admin ---------------------------
                // =============================================================================
                if (username == config.admin_username){

                    // Almaceno el Socket del Admin
                    SocketsDB.push({username:'admin', socket});

                    // Obtener historial de Mensajes del admin y enviar al browser
                    const all_msgs = await chat.getAllMessages();
                    socket.emit('message_to_admin', all_msgs);

                    // Configurar evento para nuevos mensajes provenientes del Admin
                    socket.on('message_to_client', async data =>{

                        // Guardar mensajes en la persistencia
                        const msg = {
                            username: data.destination, 
                            msg: data.msg,
                            type: 'sistema'
                        }
                        const result = await chat.newMessage(msg);
        
                        // Reenviar al cliente (Update)
                        const mensajes = await chat.getMessages(data.destination)
                        const clientSocket = SocketsDB.filter(element => { return element.username == data.destination });
                        clientSocket.forEach( activeSocket =>{
                            activeSocket.socket.emit('message_to_client', mensajes);
                        })
                                                
                        // Reenviar al Admin
                        const all_msgs = await chat.getAllMessages();
                        socket.emit('message_to_admin', all_msgs);
                    });

                }else{
                // =============================================================================
                // --------------------------- WebSocket para Cliente --------------------------
                // =============================================================================
                    // Almaceno el Socket del Admin
                    SocketsDB.push({username, socket});

                    // Obtener historial de Mensajes del usuario y enviar al browser
                    const mensajes = await chat.getMessages(username)
                    socket.emit('message_to_client', mensajes);

                    // Configurar evento para nuevos mensajes provenientes del Cliente
                    socket.on('message_to_admin', async data =>{

                        // Obtener SessionData
                        const username = socket.handshake.session.passport.user
        
                        // Guardar mensajes en la persistencia
                        const msg = {
                            username,
                            msg: data.msg,
                            type: 'usuario'
                        }
                        const result = await chat.newMessage(msg);

                        // Actualizar mensajes en el chat del Admin
                        const all_msgs = await chat.getAllMessages();
                        const adminSocket = SocketsDB.filter(element => { return element.username == 'admin' });
                        adminSocket.forEach( activeSocket =>{
                            activeSocket.socket.emit('message_to_admin', all_msgs);
                        })                       
        
                        // Reenviar al cliente (Update)
                        const mensajes = await chat.getMessages(username)
                        socket.emit('message_to_client', mensajes);

                    });
                }

            } catch (error) {
                console.log(error)
                this.io.sockets.emit('login', '');
            }

        });

    }
}

export default Controller;
