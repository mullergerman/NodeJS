import ContenedorFirebase from '../../contenedores/ContenedorFirebase.js'
import Error from '../../../config/errors.js'

const collection = 'carritos';

class CarritosDaoFirebase extends ContenedorFirebase{
    constructor(config){
        super(config.firebase_server, collection); 
        this.error = new Error();     
    }

    async getAll(){
        const data = await super.getAll();
        return data
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

export default CarritosDaoFirebase;