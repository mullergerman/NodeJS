const express = require('express');
const cluster = require('cluster');
const { urlencoded } = require('express');
const parseArgs = require('minimist');
const { Router } = express;
const { fork } = require('child_process');
const cpus = require('os').cpus()

// Procesar argumentos cli
const args = parseArgs(process.argv.slice(2));
const port = args['p'] || 8081;

// Funcion Main

function StartServer(){
    // Config Middlewares
    const app = express();
    app.use(express.json());
    app.use(urlencoded({extended: true}));
    
    // Configuracion de controladores
    const routerForkTest = Router();
    
    routerForkTest.get('/', (req, res)=>{
        const cantidad = req.body.cant;
        const forked = fork('./api/random.js')
    
        forked.on('message', data => {
            res.json(data);
        });
    
        forked.send({cantidad});
    })
    app.use('/api/randoms',routerForkTest);
    
    // Start Server
    const server = app.listen(port,()=>{
        console.log(`Servidor escuchando en el puerto ${server.address().port}`);
    });
    
    server.on("error", (error)=>{
        console.log(error);
    })
}

// Fork de procesos mediante modulo Cluster
if (cluster.isMaster){

    for (let i=0; i<cpus.length; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal)=>{
        console.log(`Finalizado Worker: ${worker.process.pid}`);
    })
}else{
    StartServer()
}




