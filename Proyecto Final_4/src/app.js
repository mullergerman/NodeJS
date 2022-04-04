import cluster from 'cluster';
import os from 'os';
import minimist from 'minimist';

import ApiRouters from './routers/routers.js';
import WebServer from './webserver/webserver.js';
import {loggerMain as logger} from './utils/logger.js';
import getConfig from './config/config.js';


// Procesar opciones de CLI
const args = minimist(process.argv.slice(2));
const mode = args['m'] || "cluster";
const run_mode = args['dev'] || "production";
const config = getConfig(run_mode);

// Funcion para Start Back End
async function StartBackEnd(){
    // Inicializar BackEnd
    const app = await new ApiRouters().getApp(config);

    // Inicializar el Server
    const server = app.listen(config.portBE,()=>{
        logger.info(`BackEnd escuchando en el puerto ${server.address().port}`)
    });

    server.on("error", (error)=>{
        logger.error(`No es posible inicializar el servidor BackEnd. ${error}`)
    })
}

// Funcion para Start Front End
async function StartFrontEnd(){
    // Inicializar FrontEnd
    const webserver = new WebServer();
    const httpserver = await webserver.initialize(config);

    // Inicializar el Server
    const server = httpserver.listen(config.portFE,()=>{
        logger.info(`FrontEnd escuchando en el puerto ${server.address().port}`)
    });

    server.on("error", (error)=>{
        logger.error(`No es posible inicializar el servidor FrontEnd. ${error}`)
    })
}

// Inicilizar Servers
if (mode == "fork"){
    config.instances = "fork";
    logger.info("Se iniciara el server en modo Fork");
    await StartBackEnd();
    await StartFrontEnd();
}else{
    config.instances = "cluster";
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
        await StartFrontEnd();

    }else{
        logger.info(`Proceso de BackEnd Inicializado: ${process.pid}`);
        await StartBackEnd();
    }
}



