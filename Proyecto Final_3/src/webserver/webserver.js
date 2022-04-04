import express from 'express';
import { urlencoded } from 'express'
import SessionControl from './sessioncontrol.js';
import Persistence from './persistence.js';
import Renders from './renders.js';
import Controller from './controller.js';
import Business from './business.js';

class WebServer{
    constructor(){
        // Inicializo Express
        const app = express();
        app.use(express.json());
        app.use(urlencoded({extended: true}));
        
        // Configuro el servidor estatico
        app.use(express.static('./webserver/public'));
        app.use(express.static('./node_modules'));

        // Inicializo Capa de Persistencia del FE
        const persistence = new Persistence();

        // Inicializo Capa de Negocio del FE
        const business = new Business(persistence);
        const session = new SessionControl(app, business, persistence);

        // Inicializo Capa de Presentacion del FW
        const renders = new Renders(app);

        // Inicializo Capa de Ruteo/Controllers del FE
        const controller = new Controller(app, business, session.getPassport());
        this.httpserver = controller.httpserver;
    }

    getHttpServer(){
        return this.httpserver;
    }

}

export default WebServer;