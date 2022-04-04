import { operation_mode } from '../../config/config.js';

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

function getDaoProductos(){
    if (operation_mode == 0){
        return new ProductosDaoMem();

    }else if(operation_mode == 1){
        return new ProductosDaoArchivo();

    }else if(operation_mode == 2){
        return new ProductosDaoMongoDb();

    }else if(operation_mode == 3){
        return new ProductosDaoFirebase();
    }
}

function getDaoCarritos(){
    if (operation_mode == 0){
        return  new CarritosDaoMem();

    }else if(operation_mode == 1){
        return  new CarritosDaoArchivo();

    }else if(operation_mode == 2){
        return  new CarritosDaoMongoDb();

    }else if(operation_mode == 3){
        return new CarritosDaoFirebase();
    }
}

function getDaoUsers(){
    return new UsersDaoMongoDb();
}

function getDaoOrders(){
    return new OrdenesDaoMongoDb();
}

async function DaoInit(dao){
    await dao.init();
}


export { 
    getDaoProductos, 
    getDaoCarritos,
    getDaoUsers,
    getDaoOrders,
    DaoInit
}
