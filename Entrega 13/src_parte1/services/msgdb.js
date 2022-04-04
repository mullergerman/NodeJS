const DB = require('./database');
const {normalize , denormalize, schema} = require('normalizr');
const util = require('util');
const { strictEqual } = require('assert');

function print(objeto) {
    console.log(util.inspect(objeto,false,12,true))
}

class MsgDB{
    constructor(cfg_authors, cfg_msg, init_chat){
        this.database_author = new DB(cfg_authors.server, cfg_authors.table);  
        this.database_msg = new DB(cfg_msg.server, cfg_msg.table);  
        this.started = false;

        this.authorSchema = new schema.Entity('author');

        this.mensajesSchema = new schema.Entity('chats',{
            author: this.authorSchema
        });
        
        this.mensajesScheme = new schema.Entity('mensajes',{
            mensajes: [ this.mensajesSchema ]
        });

        //Simulo que el sistema tarda al comienzo 15 seg en obtener la informacion previa de mensajes.

        setTimeout(async()=>{
            const data = this.internalGetAll();
            init_chat(data);
            this.started = true;
        },1000);
     }

    async addMsg(mensaje){
        await this.database_author.create(mensaje.author);
        await this.database_msg.create({
            text: mensaje.text,
            author: mensaje.author.id,
            time: mensaje.time
        });
    }

    async internalGetAll(){
        // Genero el objeto raw con toda la informacion
        const rows_authors = await this.database_author.read('')
        const rows_messages = await this.database_msg.read('')

        // Obtengo un diccionario con todos los autores
        const data_authors = {};
        for (let row of rows_authors){
            data_authors[row.id] = {
                id: row.id,
                nombre: row.nombre,
                apellido: row.apellido,
                edad: row.edad,
                alias: row.alias,
                avatar: row.avatar
            }
        }

        // Armo el Objeto con los Mensajes deforma anidada con los autores
        let data = {
            id: "mensajes",
            mensajes: []
        }
        for (let row of rows_messages){
            data["mensajes"].push({
                id: row.id,
                author:{
                    id: data_authors[row.author].id,
                    nombre: data_authors[row.author].nombre,
                    apellido: data_authors[row.author].apellido,
                    edad: data_authors[row.author].edad,
                    alias: data_authors[row.author].alias,
                    avatar: data_authors[row.author].avatar
                },
                text: row.text,
                time: row.time
            });

        }

        // Normalizo el objeto antes de enviarlo
        const normalizedMsg = normalize(data, this.mensajesScheme);
        //print(normalizedMsg);

        return(normalizedMsg);
    }

    async getAllMessages(){
        const data = this.internalGetAll();
        return(data);
    }

    isStarted(){
        return (this.started);
    }
}

module.exports = MsgDB;
