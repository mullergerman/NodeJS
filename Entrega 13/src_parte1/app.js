const cluster = require('cluster');
const cpus = require('os').cpus()

const express = require('express');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const { urlencoded } = require('express');
const parseArgs = require('minimist');

const ApiController = require('./api/api')
const WebServer = require('./webserver/webserver')
const Store = require('./services/store.js');
const { productos:cfg_productos, chat_authors:cfg_authors, chat_msg:cfg_msg} = require('./config/config.js');

// Procesar argumentos cli
const args = parseArgs(process.argv.slice(2));
const port = args['p'] || 8080;
const mode = args['m'] || "fork";


// Funcion Main del Server
function StartServer(){
    // Inicializo Libreria Express
    const app = express();
    app.use(express.json());
    app.use(urlencoded({extended: true}));


    // Middleware para manejo de sesiones
    app.use(session({
        store: MongoStore.create({mongoUrl: 'mongodb://localhost/sesiones'}),
        secret: "secreto",
        resave: true,
        saveUninitialized: true,
        cookie:{maxAge:60000}
    }));

    // Inicializo Libreria de Socket.IO
    const { Server: HttpServer} = require('http');
    const { Server: IOServer} = require('socket.io');
    const httpserver = new HttpServer(app);
    const io = new IOServer(httpserver);

    // Inicializar Capa de servicio
    const store = new Store(cfg_productos);

    // Inicializar Capa de Controladores API
    const api = new ApiController(app, store);

    // Inicializar Capa de Controladores Web
    app.use(express.static(__dirname + '/webserver/public'));
    app.use(express.static(__dirname + '/node_modules'));
    const webserver = new WebServer(app, io, cfg_authors, cfg_msg);

    // Inicializar el Server
    const server = httpserver.listen(port,()=>{
        console.log(`Servidor escuchando en el puerto ${server.address().port}`);
    });

    server.on("error", (error)=>{
        console.log(error);
    })
}

// Fork de procesos
if (mode == "fork"){
    console.log("Se iniciara el server en modo Fork");
    StartServer();

}else{
    console.log("Se iniciara el server en modo Cluster");
    if (cluster.isMaster){
        for (let i=0; i< cpus.length; i++){
            cluster.fork();
        }

        cluster.on('exit',(worker, code, signal)=>{
            console.log(`Worker ${worker.process.pid} finalizado`);
        })
    }else{
        StartServer();
    }
}



