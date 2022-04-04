import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import {mongo_server, collection_carritos} from '../../../config/config.js'
import mongoose from 'mongoose'
import Error from '../../../config/errors.js'

const scheme = mongoose.model(collection_carritos, {
    id:         { type: String, required: true, unique: true},
    idInCart:   { type: String},
    timestamp:  { type: Number},
    productos:  { type: Object},
    username:   { type: String}
});

class CarritosDaoMongoDb extends ContenedorMongoDb{
    constructor(){
        super(mongo_server, scheme);   
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