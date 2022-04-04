import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import Error from '../../../config/errors.js'
import scheme from '../../models/ordenes.js';

class OrdenesDaoMongoDb extends ContenedorMongoDb{
    constructor(config){
        super(config, scheme);
        this.error = new Error()        
    }

    async get(id){
        const orden = await super.get(id);
        return (Error.Check(orden, this.error.GetError, orden)); 
    };

    async getByUsername(username){
        const orden = await super.getBy('username', username);
        return (Error.Check(orden, this.error.GetError, orden)); 
    };

    async insert(ordenDTO){
        const orden = await super.insert(ordenDTO);
        return (Error.Check(orden, this.error.InsertError, orden)); 
    };

    async update(id, ordenDTO){
        const orden = await super.updateBy(id,ordenDTO);
        return (Error.Check(orden, this.error.UpdateError, orden))        
    };

    async updateByUsername(username, ordenDTO){
        const orden = await super.updateBy('username',username,ordenDTO);
        return (Error.Check(orden, this.error.UpdateError, orden))        
    };

}

export default OrdenesDaoMongoDb;