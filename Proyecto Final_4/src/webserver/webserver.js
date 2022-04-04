import express from 'express';
import { urlencoded } from 'express'
import SessionControl from './sessioncontrol.js';
import Persistence from './persistence.js';
import Renders from './renders.js';
import Controller from './controller.js';
import Business from './business.js';
import Chats from './chat.js';

class WebServer{
    constructor(){
        // Inicializo Express
        this.app = express();
        this.app.use(express.json());
        this.app.use(urlencoded({extended: true}));
        
        // Configuro el servidor estatico
        this.app.use(express.static('./webserver/public'));
        this.app.use(express.static('./node_modules'));

    }

    async initialize(config){
        // Inicializo Capa de Persistencia del FE
        const persistence = new Persistence(config);

        // Inicializo Capa de Negocio del FE
        const business = new Business(persistence, config);
        const session = new SessionControl(this.app, business, persistence, config);

        // Inicializo Capa de Presentacion del FW
        const renders = new Renders(this.app, config);
        const chat = new Chats();
        await chat.initialize(config);

        // Inicializo Capa de Ruteo/Controllers del FE
        const controller = new Controller(this.app, business, session, chat, config);
        this.httpserver = controller.httpserver;

        return this.httpserver;
    }

}

export default WebServer;