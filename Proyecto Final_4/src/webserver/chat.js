import { getDaoChats, DaoInit } from '../persistence/daos/index.js'
import Error from '../config/errors.js'


class Chats{
    constructor(){
        this.error = new Error()
    }

    async initialize(config){
        this.daoChats = getDaoChats(config);
        await DaoInit(this.daoChats);
    }

    async newMessage(msg){
        msg.date = new Date().toLocaleString();
        await this.daoChats.insert(msg);

        const all_msg = await this.getMessages(msg.username)
        return all_msg;
    }

    async getMessages(username){
        const data = await this.daoChats.get(username);
        if (Array.isArray(data)){
            return data;
        }else{
            return [data]
        }
    }

    async getAllMessages(){
        const data = await this.daoChats.getAll();
        if (Array.isArray(data)){
            return data;
        }else{
            return [data]
        }
    }

}


export default Chats