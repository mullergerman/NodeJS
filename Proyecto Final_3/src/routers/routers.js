import express from 'express';
import { urlencoded } from 'express'
import CreateRouterProductos from '../controllers/controllerProductos.js'
import CreateRouterCarritos from '../controllers/controllerCarritos.js'
import CreateRouterUsers from '../controllers/controllerUsers.js'
import { loggerBE as logger } from '../utils/logger.js';

// Inicializo Libreria Express
const app = express();
app.use(express.json());
app.use(urlencoded({extended: true}));

class API{
    constructor(config){

        // Middleware comun para logger de rutas
        const myLogger = function (req, res, next) {
            logger.debug(req.protocol + '://' + req.get('host') + req.originalUrl);
            next();
        };
        app.use(myLogger);

        // Rutas de API
        const routerProductos = CreateRouterProductos(config);
        const routerCarrito = CreateRouterCarritos(config);
        const routerUsers = CreateRouterUsers(config);

        app.use('/api/productos',routerProductos);
        app.use('/api/carritos',routerCarrito);
        app.use('/api/users', routerUsers);

    }

    getApp(){
        return app;
    }
}

export default API;