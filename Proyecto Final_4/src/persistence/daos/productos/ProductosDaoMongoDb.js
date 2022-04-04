import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import Error from '../../../config/errors.js'
import scheme from '../../models/productos.js'

class ProductosDaoMongoDb extends ContenedorMongoDb{
    constructor(config){
        super(config, scheme);
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
        return (Error.Check(producto, this.error.RemoveError, { data : id }))        
    };

}

export default ProductosDaoMongoDb;