import { Server as HttpServer} from 'http';
import { Server as IOServer} from 'socket.io';
import { loggerFE as logger} from '../utils/logger.js'

class Controller{
    constructor(app, business, passport){

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
            res.render('login', {layout: 'login'});
        });

        app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/productos' }))

        app.get('/faillogin', (req, res) => {
            res.render('loginerror', {layout: 'login'});
        })

        // Logout
        app.get('/logout', (req, res)=>{            
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
        app.get('/productos', isAuth, (req,res)=>{
            const username = req.user.username;
            res.render('productos', {username, script:'/js/productos.js'});
        });

        app.post('/productos', isAuth, async (req,res)=>{
            const username = req.user.username;
            const product_id = req.body.product_id;
            const data = await business.addProductIntoCart(username, product_id);
            res.redirect('/carrito')
        });

        // Usuario - Carrito Personal
        app.get('/carrito', isAuth, async (req,res)=>{
            const username = req.user.username;
            let data = await business.getUserCartInfo(username);
            if (!data){
                data= {productos:[]}
            }
            let listExists = false;
            if (data.productos.length > 0){
                listExists = true;
            }
            data.listExists = listExists;
            res.render('carrito', {data, script:'/js/carrito.js'});
        });

        // Usuario - Carrito - Remove Producto
        app.delete('/carrito/:product_idInCart', async (req, res)=>{
            const username = req.user.username;
            const product_idInCart = req.params.product_idInCart;
            const data = await business.removeProductFromCart(username, product_idInCart);
            res.redirect('/productos')
        })

        // Usuario - Carrito - Comprar
        app.post('/carrito/buy', async (req, res)=>{
            const username = req.user.username;
            const order = await business.buyCart(username);
            res.json(order)
        });

        // ---------------------------------------------------------------------------------------------------------
        // Controladores de Vista de Administrador
        // ---------------------------------------------------------------------------------------------------------
        // Administrador - Control de Inventario
        app.get('/admin_inventario', isAuth, async (req,res)=>{
            const productos = await business.getAllProducts();
            let listExists = false;
            if (productos.length > 0) listExists = true;

            const data_template = {
                username: req.user.username,
                script:'/js/admin_inventario.js',
                productos,
                listExists
            }

            res.render('inventario', data_template);
        });

        // Administrador - Control de Carritos
        app.get('/admin_carritos', isAuth, (req,res)=>{
            const username = req.user.username;
            res.render('carritos', {username, script:'/js/admin_carritos.js'});
        });

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion del WebSocket
        // ---------------------------------------------------------------------------------------------------------

        // Inicializo Libreria de Socket.IO
        this.httpserver = new HttpServer(app);
        this.io = new IOServer(this.httpserver);

        // Acceptar nuevas conexiones
        this.io.on('connection', async (socket)=>{

            // -------------------------------------------------------------------------------
            // Ante una nueva conexión, envió la última información de productos, para su render en el cliente.
            // -------------------------------------------------------------------------------
            const productos = await business.getAllProducts();
            socket.emit('productos', productos);

            // -------------------------------------------------------------------------------
            // Configuracion de Eventos
            // -------------------------------------------------------------------------------            
            // Evento 1: Nuevo Producto
            socket.on('nuevo-producto', async (dato)=>{
                const data = await business.newProduct(dato);
                this.io.sockets.emit("productos", data);           
            })

            // Evento 2: Editar Producto
            socket.on('update-producto', async (dato)=>{
                const data = await business.editProduct(dato);
                this.io.sockets.emit("productos", data);        
            })

            // Evento 3: Obtener datos de un producto
            socket.on('get-producto', async (id)=>{
                const data = await business.getProduct(id);
                this.io.sockets.emit("productos", data);            
            })

            // Evento 4: Obtener todos los Productos
            socket.on('get-all-productos', async ()=>{
                const data = business.getAllProducts(dato);
                this.io.sockets.emit("productos", data);            
            })

            // Evento 5: Obtener todos los Productos
            socket.on('remove-producto', async (id)=>{
                const data = await business.removeProduct(id);
                this.io.sockets.emit("productos", data);            
            })

            // Evento 6: Obtener todos los Carritos (ADMIN View)
            socket.on('refresh-carritos', async ()=>{
                const data = await business.getAllCarritos(dato);
                this.io.sockets.emit("carritos", data);      
            })

        });

    }
}

export default Controller;