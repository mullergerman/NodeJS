import { getDaoProductos, DaoInit } from '../persistence/daos/index.js'
import Error from '../config/errors.js'
import { v4 as uuidv4 } from 'uuid';
import { loggerBE as logger } from '../utils/logger.js';

// Inicializar Capa de Persistencia
const daoProductos = getDaoProductos();
await DaoInit(daoProductos);

class ApiProductosBO{

    constructor(){
        this.error = new Error()
    }

    validateDTO(product){
        if ('nombre' in product && 
            'descripcion' in product &&
            'codigo' in product &&
            'foto' in product &&
            'precio' in product &&
            'stock' in product
            ){
            return true;
        }else{
            logger.warn(`ApiProductosBO;validateDTO;Producto Invalido`);
            return false;
        }
    };

    async getAll(){
        const result = await daoProductos.getAll();
        return result;
    }

    async get(num){
        const producto = await daoProductos.get(num)
        if (!producto){
            logger.error(`ApiProductosBO;get;Producto No Disponible`);
            return({error: this.error.ProductoNoDisponible})
        }
        return producto;
    }

    async insert(producto){
        // Verificar los datos del DTO
        if (!(this.validateDTO(producto))){
            return ({ error : this.error.ProductoIncorrecto });
        }

        // Configurar ID de Negocio
        producto.id = uuidv4();

        // Guardar objeto en la capa de Persistencia
        const resultado = await daoProductos.insert(producto)                    
        if (!resultado){
            logger.error(`ApiProductosBO;insert;Producto Incorrecto`);
            return ({ error : this.error.ProductoIncorrecto });
        }
        
        logger.info(`ApiProductosBO;insert;Producto agregado correctamente al inventario`);
        return resultado
   
    }

    async update(id, productoDto){

        // Verifico que exista el producto
        const producto = daoProductos.get(id)
        if (!producto){
            logger.error(`ApiProductosBO;update;Producto no disponible`);
            return({error: this.error.ProductoNoDisponible})
        }

        // Verifico que la informacion proveniente del FE sea correcta
        if (!this.validateDTO(productoDto)){
            return ({ error : this.error.ProductoIncorrecto }); 
        }

        // Completo el DTO proveniente del FE con la informacion de negocio
        const productoUpgrade = productoDto;
        productoUpgrade.id = producto.id;

        // Actualizo la informacion del producto
        const resultado = await daoProductos.update(id, productoUpgrade);
        if (!resultado){
            logger.error(`ApiProductosBO;update;Imposible Editar Producto`);
            return ({ error : this.error.ImposibleEditarProducto }); 
        }

        logger.info(`ApiProductosBO;update;Producto actualizado correctamente en el inventario`);
        return resultado;
        
    }

    async remove(id){
        // Verifico que exista el producto antes de eliminarlo
        const producto = this.get(id);
        if (!producto){
            logger.error(`ApiProductosBO;remove;Producto no disponible`);
            return ({error: this.error.ProductoNoDisponible})
        } 

        // Elimino el producto en la capa de Persistencia
        const resultado = await daoProductos.remove(id);
        if (!resultado){
            logger.error(`ApiProductosBO;remove;Imposible Eliminar Producto`);
            return ({error: this.error.ImposibleEliminarProducto})
        }
        return resultado;
    }

    async deduct(producto_id){
        // Obtener el producto
        let product = await daoProductos.get(producto_id);
        if (!product){
            logger.error(`ApiProductosBO;deduct;Producto no disponible`);
            return({error: this.error.ProductoNoDisponible})
        }

        // Disminuir el Stock
        if (product.stock>0){
            product.stock = product.stock - 1;
        }else{
            logger.error(`ApiProductosBO;deduct;Stock No Disponible`);
            return({error: this.error.StockNoDisponible})
        }

        // Remover producto del inventario si se acabaron. En caso contrario actualizar el nuevo stock restante.
        let resultado = {}
        if (product.stock == 0){
            resultado = await this.remove(product.id);
            if(!resultado){
                logger.error(`ApiProductosBO;deduct;Imposible Eliminar Producto`);
                return ({ error : this.error.ImposibleEliminarProducto }); 
            }
        }else{
            resultado = await daoProductos.update(product.id, product);
            if (!resultado){
                logger.error(`ApiProductosBO;deduct;Imposible Editar Producto`);
                return ({ error : this.error.ImposibleEditarProducto }); 
            }            
        }

        return resultado;

    }

}

export default ApiProductosBO;