import mongoose from 'mongoose'
import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import { mongo_server , collection_users} from '../../../config/config.js'
import Error from '../../../config/errors.js'


const scheme = mongoose.model(collection_users, { 
    username:   { type: String, required: true },
    password:   { type: String, required: true },
    name:       { type: String },
    age:        { type: Number },
    phone:      { type: String },
    address:    { type: String },
    photo:      { type: String },
    cart:       { type: String }
});

class UsersDaoMongoDb extends ContenedorMongoDb{

    constructor(){
        super(mongo_server, scheme);
        this.error = new Error()        
    }

    async getByUsername(username){
        const user = await super.getBy('username', username);
        return (Error.Check(user, this.error.GetError, user)); 
    };

    async get(username){
        const user = await super.getBy('username', username);
        return (Error.Check(user, this.error.GetError, user)); 
    };

    async insert(userDTO){
        const user = await super.insert(userDTO);
        return (Error.Check(user, this.error.InsertError, user)); 
    };

    async update(username, user){
        const result = await super.updateBy('username',username,user);
        return (Error.Check(result, this.error.UpdateError, result))        
    };

}

export default UsersDaoMongoDb;