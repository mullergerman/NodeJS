import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import Error from '../../../config/errors.js'
import scheme from '../../models/carritos.js';

class CarritosDaoMongoDb extends ContenedorMongoDb{
    constructor(config){
        super(config, scheme);   
        this.error = new Error();      
    }

    async getAll(){
        const data = await super.getAll();
        return (Error.Check(data, this.error.GetError, data))
    };

    async get(id){
        const carrito = await super.get(id);
        return (Error.Check(carrito, this.error.GetError, carrito))
    };

    async insert(product){
        const carrito = await super.insert(product);
        return (Error.Check(carrito, this.error.InsertError, carrito))
    };

    async update(id, product){
        const carrito = await super.update(id,product);
        return (Error.Check(carrito, this.error.UpdateError, carrito))        
    };

    async remove(id){
        const carrito = await super.remove(id);
        return (Error.Check(carrito, this.error.RemoveError, { data : id }))        
    };
    
}

export default CarritosDaoMongoDb;