import { getDaoCarritos, DaoInit } from '../persistence/daos/index.js'
import Error from '../config/errors.js'
import { v4 as uuidv4 } from 'uuid';
import ApiUsersBO from './ApiUsersBO.js';
import ApiOrdenesBO from './ApiOrdenesBO.js';
import { loggerBE as logger } from '../utils/logger.js';


class ApiCarritosBO{

    constructor(){
        this.error = new Error()
    }

    async initialize(config){
        this.apiUsers = new ApiUsersBO()
        this.apiUsers.initialize(config)

        this.apiOrdenes = new ApiOrdenesBO()
        this.apiOrdenes.initialize(config)

        // Inicializar Capa de Persistencia
        this.daoCarritos = getDaoCarritos(config);
        await DaoInit(this.daoCarritos);
    }

    async getCarritosAll(){
        return await this.daoCarritos.getAll();
    }

    async newCarrito(username){
        // Creo el Carrito
        const carrito = {
            username,
            id: uuidv4(),
            timestamp: Date.now(),
            productos: [],
        }
        const result = await this.daoCarritos.insert(carrito);

        // Asocio el carrito al User
        const carrito_id = result.id;
        await this.apiUsers.setUserCart(username, carrito_id)

        //Log
        logger.debug(`ApiCarritosBO;Nuevo Carrito Creado! ${carrito_id}`);

        return result;
    }

    async removeCarrito(carrito_id, username){
        // Verifico que Carrito exista antes de intentar borrarlo
        const carrito = this.daoCarritos.get(carrito_id);
        if (!carrito){
            logger.error(`ApiCarritosBO;removeCarrito; Carrito No Disponible}`);
            return ({error: this.error.CarritoNoDisponible});
        }

        // Borrar el Carrito y actualizar el dato en la capa de Persistencia.
        const resultado = await this.daoCarritos.remove(carrito_id);
        if (!resultado){
            logger.error(`ApiCarritosBO;removeCarrito; Imposible Eliminar Carrito}`);
            return ({error: this.error.ImposibleEliminarCarrito});
        }

        // Si es necesario se consulta al usuario
        if (username == undefined){
            username = carrito.username
        }

        // Remover asociacion con el usuario
        const resultado2 = await this.apiUsers.removeUserCart(username)
        if (!resultado2){
            logger.error(`ApiCarritosBO;removeCarrito; Imposible Eliminar Carrito}`);
            return ({error: this.error.ImposibleEliminarCarrito});
        }

        logger.debug(`ApiCarritosBO;removeCarrito;Carrito eliminado correctamente`)
        return resultado;
    }

    async getProductoInCarrito(carrito_id){
        const carrito = await this.daoCarritos.get(carrito_id);
        if (!carrito){
            return ({error: "CarritoNoDisponible"})
        }
        return carrito.productos
    }

    async insertProductInCarrito(carrito_id,producto){
        const carrito = await this.daoCarritos.get(carrito_id)

        if(!producto){
            return  ({error: this.error.ProductoNoDisponible})
        }
        if(!carrito){
            return  ({error: this.error.CarritoNoDisponible})
        }

        // Asigno un ID interno del producto dentro del carrito
        producto.idInCart = uuidv4();        
        carrito.productos.push(producto)
        const result = await this.daoCarritos.update(carrito_id,carrito)

        if (!result){
            logger.error(`ApiCarritosBO;insertProductInCarrito; Imposible Incluir Producto}`);
            return ({error: this.error.ImposibleIncluirProducto})
        }

        logger.debug(`ApiCarritosBO; Producto agreado correctamente en el Carrito`);        
        return result;
    }

    async deleteProductoInCarrito(carrito_id, product_idInCart){
        const carrito = await this.daoCarritos.get(carrito_id)

        // Verificar que exista el Carrito
        if(!carrito){
            logger.error(`ApiCarritosBO;deleteProductoInCarrito; Carrito No Disponible}`);
            return  ({error: this.error.CarritoNoDisponible})
        }

        // Obtener el usuario que posee asociado dicho carrito
        const username = carrito.username;

        // Verificar que el Producto se encuentre dentro del Carrito.
        let finded = false;
        carrito.productos.map((item)=>{
            if (item.idInCart === product_idInCart){
                finded = true;
            }
        })

        if (!finded){
            logger.error(`ApiCarritosBO;deleteProductoInCarrito; Producto No Disponible}`);
            return  ({error: this.error.ProductoNoDisponible})
        }

        // Eliminar el Producto del Carrito
        let new_carrito = []
        let flag = false;
        carrito.productos.map((item) =>{
            if (flag) {
                new_carrito.push(JSON.parse(JSON.stringify(item)))  
                return
            }
            if (item.idInCart === product_idInCart){
                flag=true
                return
            } 
            new_carrito.push(JSON.parse(JSON.stringify(item)))  
        })

        carrito.productos = new_carrito

        const result = await this.daoCarritos.update(carrito_id,carrito)
        if (!result){
            logger.error(`ApiCarritosBO;deleteProductoInCarrito; Imposible Incluir Producto}`);
            return ({error: this.error.ImposibleIncluirProducto})
        }

        // Si es el último producto del carrito, eliminar el carrito; y eliminar asociacion con el usuario
        if (carrito.productos.length == 0){

            // Remover carrito y la asociacion con el usuario
            await this.removeCarrito(carrito_id, username)
            
        }

        logger.debug(`ApiCarritosBO;deleteProductoInCarrito; Producto eliminado del carrito de forma exitosa}`);
        return result;
    }

    async buyCart(username, carrito_id){

        // Obtener informacion del User
        const user = await this.apiUsers.getUserInfo(username)
        
        // Obtener el Carrito (y verificar que exista)
        const carrito = await this.daoCarritos.get(carrito_id)
        if(!carrito){
            logger.error(`ApiCarritosBO;buyCart;Carrito no disponible`);
            return  ({error: this.error.CarritoNoDisponible})
        }

        // Crear orden de compra
        const order = await this.apiOrdenes.Create(user, carrito.productos);

        // Elimino el carrito
        await this.removeCarrito(carrito_id, username)

        logger.debug(`ApiCarritosBO;buyCart;Compra Exitosa`)
        return (order)
    }

}

export default ApiCarritosBO;