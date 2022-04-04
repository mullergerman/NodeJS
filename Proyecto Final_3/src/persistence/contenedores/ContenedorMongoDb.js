import mongoose from '../../node_modules/mongoose/index.js'
import { db_name } from '../../config/config.js';
import { loggerBE as logger } from '../../utils/logger.js'

class ContenedorMongoDb{
    constructor(config, scheme){
        this.config = config;
        this.scheme = scheme;
    }

    async init(){
        // Verifico si existe una conexion previa con MongoDB
        if (mongoose.connection.readyState != 0){
            return true;
        }

        // Establezco una nueva conexion
        const url = this.config.url + "/" + db_name;
        try {
            mongoose.connect(url);
            return true;
        } catch (error) {
            logger.error(`ContenedorMongoDB;Error en la conexion de Mongo\n${error}`);
            return ({error});
        }
    }

    async erase_all(){
        try {
            await this.scheme.collection.drop();
            return {result: true};
        } catch (error) {
            return ({error});
        }
    }

    async insert(data){
        try {
            await this.scheme.create(data)
            return {data};
        } catch (error) {
            return ({error});
        }

    }

    async getAll(){
        try {
            const data = await this.scheme.find({},{_id:0, __v:0});
            return {data};
        } catch (error) {
            return ({error});
        }
    }

    async get(id){
        try {
            const result = await this.scheme.find({id},{_id:0, __v:0});
            
            if (Array.isArray(result)){
                return {data: result[0]};
            }else{
                return {data: result};
            }   
        } catch (error) {
            return ({error});
        }
    }

    async getBy(parameter, value){
        try {
            const search = {}
            search[parameter] = value     
            const result = await this.scheme.find(search,{_id:0, __v:0});

            if (result.length>0){
                return {data: result[0]};
            }else{
                return {data: result};
            }            
        } catch (error) {
            return ({error});
        }
    }

    async update(id, new_data){
        try {
            await this.scheme.updateOne({id}, new_data);
            return {data: new_data};
        } catch (error) {
            return ({error});
        }
    }

    async updateBy(parameter, value, new_data){
        try {
            const search = {}
            search[parameter] = value
      
            const result = await this.scheme.updateOne(search, new_data);
            if (result.length>0){
                return {data: result[0]};
            }else{
                return {data: result};
            }            
        } catch (error) {
            return ({error});
        }
    }

    async remove(id){
        try {
            await this.scheme.deleteOne({id});
            return {Deleted: id};
        } catch (error) {
            return ({error});
        }
    }
}

export default ContenedorMongoDb;