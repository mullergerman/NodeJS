import cluster from 'cluster';
import os from 'os';
import minimist from 'minimist';

import ApiRouters from './routers/routers.js';
import WebServer from './webserver/webserver.js';
import {loggerMain as logger} from './utils/logger.js';
import { portFE, portBE } from './config/config.js';

// Configuracion del Sistema
const config = {
    permisos: true,
}

// Procesar opciones de CLI
const args = minimist(process.argv.slice(2));
const mode = args['m'] || "fork";

// Funcion para Start Back End
function StartBackEnd(){
    // Inicializar BackEnd
    const app = new ApiRouters(config).getApp();

    // Inicializar el Server
    const server = app.listen(portBE,()=>{
        logger.info(`BackEnd escuchando en el puerto ${server.address().port}`)
    });

    server.on("error", (error)=>{
        logger.error(`No es posible inicializar el servidor BackEnd. ${error}`)
    })
}

// Funcion para Start Front End
function StartFrontEnd(){
    // Inicializar FrontEnd
    const httpserver = new WebServer().getHttpServer();

    // Inicializar el Server
    const server = httpserver.listen(portFE,()=>{
        logger.info(`FrontEnd escuchando en el puerto ${server.address().port}`)
    });

    server.on("error", (error)=>{
        logger.error(`No es posible inicializar el servidor FrontEnd. ${error}`)
    })
}

// Inicilizar Servers
if (mode == "fork"){
    logger.info("Se iniciara el server en modo Fork");
    StartBackEnd();
    StartFrontEnd();
}else{
    if (cluster.isPrimary){
        logger.info("Se iniciara el server en modo Cluster");
        // El BackEnd se inicializa en modo Cluster 
        const cpus = os.cpus();
        for (let i=0; i< cpus.length; i++){
            cluster.fork();
        }

        cluster.on('exit',(worker, code, signal)=>{
            logger.info(`Proceso de BackEnd finalizado: ${worker.process.pid}`);
        })

        // Se Inicializa el FrontEnd solo 1 instancia.
        // Esto se realiza para evitar problemas con WebSockets
        StartFrontEnd();

    }else{
        logger.info(`Proceso de BackEnd Inicializado: ${process.pid}`);
        StartBackEnd();
    }
}



