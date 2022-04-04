import express from 'express';
import { urlencoded } from 'express';
import CreateRouterProductos from '../controllers/controllerProductos.js';
import CreateRouterCarritos from '../controllers/controllerCarritos.js';
import CreateRouterUsers from '../controllers/controllerUsers.js';
import CreateRouterAuth from '../controllers/controllerAuth.js';
import { loggerBE as logger } from '../utils/logger.js';
import { getAuthMiddleware } from './session.js';

// Inicializo Libreria Express
const app = express();
app.use(express.json());
app.use(urlencoded({extended: true}));

class API{
    constructor(){
        // Middleware comun para logger de rutas
        const myLogger = function (req, res, next) {
            logger.debug(req.protocol + '://' + req.get('host') + req.originalUrl);
            next();
        };
        app.use(myLogger);
    }

    async getApp(config){
        // Rutas de API
        const routerAuth = await CreateRouterAuth(config);
        const routerProductos = await CreateRouterProductos(config);
        const routerCarrito = await CreateRouterCarritos(config);
        const routerUsers = await CreateRouterUsers(config);

        // Ruta para login/register
        app.use('/api/auth', routerAuth);

        // Rutas protegidas
        app.use(getAuthMiddleware(config));
        app.use('/api/users', routerUsers);
        app.use('/api/productos',routerProductos);
        app.use('/api/carritos',routerCarrito);
        return app;
    }
}

export default API;