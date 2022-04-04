import ContenedorMongoDb from '../../contenedores/ContenedorMongoDb.js'
import Error from '../../../config/errors.js'
import scheme from '../../models/users.js'

class UsersDaoMongoDb extends ContenedorMongoDb{

    constructor(config){
        super(config, scheme);
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