import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import {mongo_server, collection_productos} from '../../../config/config.js'
import mongoose from 'mongoose'
import Error from '../../../config/errors.js'


const scheme = mongoose.model(collection_productos, { 
    nombre:     { type: String, required: true },
    descripcion:{ type: String, required: true },
    codigo:     { type: String, required: true },
    precio:     { type: Number, required: true },
    stock:      { type: Number, required: true },
    foto:       { type: String, required: true },
    id:         { type: String, required: true, unique: true},
    timestamp:  { type: Number}
});

class ProductosDaoMongoDb extends ContenedorMongoDb{
    constructor(){
        super(mongo_server, scheme);
        this.error = new Error()        
    }

    async getAll(){
        const data = await super.getAll();
        return (Error.Check(data, this.error.GetError, data))
    };

    async get(id){
        const producto = await super.get(id);
        return (Error.Check(producto, this.error.GetError, producto))
    };

    async insert(product){
        const producto = await super.insert(product);
        return (Error.Check(producto, this.error.InsertError, producto))
    };

    async update(id, product){
        const producto = await super.update(id,product);
        return (Error.Check(producto, this.error.UpdateError, producto))        
    };

    async remove(id){
        const producto = await super.remove(id);
        return (Error.Check(producto, this.error.RemoveError, { resultado : id }))        
    };

}

export default ProductosDaoMongoDb;