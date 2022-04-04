import ProductosDaoMem from './productos/ProductosDaoMem.js';
import ProductosDaoArchivo from './productos/ProductosDaoArchivo.js';
import ProductosDaoMongoDb from './productos/ProductosDaoMongoDb.js';
import ProductosDaoFirebase from './productos/ProductosDaoFirebase.js';

import CarritosDaoMem from './carritos/CarritosDaoMem.js';
import CarritosDaoArchivo from './carritos/CarritosDaoArchivo.js';
import CarritosDaoMongoDb from './carritos/CarritosDaoMongoDb.js';
import CarritosDaoFirebase from './carritos/CarritosDaoFirebase.js';

import UsersDaoMongoDb from './users/UsersDaoMongoDb.js';
import OrdenesDaoMongoDb from './ordenes/OrdenesDaoMongoDb.js';
import ChatsDaoMongoDb from './chats/ChatsDaoMongoDb.js';

function getDaoProductos(config){
    if (config.operation_mode == 0){
        return new ProductosDaoMem(config);

    }else if(config.operation_mode == 1){
        return new ProductosDaoArchivo(config);

    }else if(config.operation_mode == 2){
        return new ProductosDaoMongoDb(config);

    }else if(config.operation_mode == 3){
        return new ProductosDaoFirebase(config);
    }
}

function getDaoCarritos(config){
    if (config.operation_mode == 0){
        return  new CarritosDaoMem(config);

    }else if(config.operation_mode == 1){
        return  new CarritosDaoArchivo(config);

    }else if(config.operation_mode == 2){
        return  new CarritosDaoMongoDb(config);

    }else if(config.operation_mode == 3){
        return new CarritosDaoFirebase(config);
    }
}

function getDaoUsers(config){
    return new UsersDaoMongoDb(config);
}

function getDaoOrders(config){
    return new OrdenesDaoMongoDb(config);
}

function getDaoChats(config){
    return new ChatsDaoMongoDb(config);
}

async function DaoInit(dao){
    await dao.init();
}


export { 
    getDaoProductos, 
    getDaoCarritos,
    getDaoUsers,
    getDaoOrders,
    getDaoChats,
    DaoInit
}
