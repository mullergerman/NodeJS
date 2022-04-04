
const db = {}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function insert(data){
    if (db.hasOwnProperty(data)){
        db[data] = db[data] + 1;
    }else{
        db[data] = 1;
    }
}

function generate(cant){
    const cantidad = cant;
    for (let i=0; i<cantidad; i++){
        insert(getRandomInt(0,1000))
    }
    return(db)
}

process.on('message', parametro =>{
    const cantidad = parametro.cantidad || 500000000;
    console.log("Start Task..", cantidad);
    const result = generate(cantidad)
    console.log("End");
    process.send({resultado: result});
    process.exit();
})

