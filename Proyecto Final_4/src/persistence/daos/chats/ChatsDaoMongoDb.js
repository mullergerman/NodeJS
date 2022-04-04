import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import Error from '../../../config/errors.js'
import scheme from '../../models/chats.js';

class ChatsDaoMongoDb extends ContenedorMongoDb{

    constructor(config){
        super(config, scheme);
        this.error = new Error()        
    }

    async get(username){
        const mensajes = {};
        mensajes.data = await super.getAllBy('username', username);
        return (Error.Check(mensajes, this.error.GetError, mensajes)); 
    };

    async getAll(){
        let mensajes = {};
        mensajes = await super.getAll();
        return (Error.Check(mensajes, this.error.GetError, mensajes)); 
    };

    async insert(chatDTO){
        const user = await super.insert(chatDTO);
        return (Error.Check(user, this.error.InsertError, user)); 
    };

}

export default ChatsDaoMongoDb;