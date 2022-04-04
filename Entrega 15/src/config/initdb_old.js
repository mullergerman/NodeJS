const e = require('cors');
const createKnex = require('knex');
const { root, productos, chat } = require('./config.js')

async function InitDB(root_password, config){
    // Creacion de Usuario y Database
    root.connection.password = root_password;
    try {
        let knex = createKnex(root)
        await knex.raw(`CREATE USER IF NOT EXISTS '${config.server.connection.user}'@'%' IDENTIFIED BY '${config.server.connection.password}';`);
        await knex.raw(`GRANT ALL PRIVILEGES ON *.* TO '${config.server.connection.user}'@'%' IDENTIFIED BY '${config.server.connection.password}';`);
        await knex.raw(`FLUSH PRIVILEGES;`);
        await knex.raw(`CREATE DATABASE IF NOT EXISTS ${config.server.connection.database}`);
    } catch (error) {
        console.log("Error al crear la DB");
        console.log(error);
        return null;
    }
    
    // Creacion de Tablas
    try {
        knex = createKnex(config.server)

        if ('table' in config){
            const exists = await knex.schema.hasTable(config.table);
            if (!exists){
                await knex.schema.createTable(config.table, (table) => {
                    if (config.table=='productos'){
                        table.increments('id').notNullable()
                        table.string('title',30).notNullable()
                        table.float('price').notNullable()
                        table.string('thumbnail',255).notNullable()
                    }
                });
            }

        }else if ('table_author' in config){
            console.log(config.table_author)
            const exists_author = await knex.schema.hasTable(config.table_author);
            if (!exists_author){
                await knex.schema.createTable(config.table_author, (table) => {
                    table.increments('id').notNullable()
                    table.string('nombre',255)
                    table.string('apellido',255)
                    table.integer('edad',255)
                    table.string('alias', 255)
                    table.string('avatar', 255)
                });
            }

            const exists_msg = await knex.schema.hasTable(config.table_msg);
            if (!exists_msg){
                await knex.schema.createTable(config.table_msg, (table) => {
                    table.increments('id').notNullable()
                    table.integer('author',255)
                    table.string('texto',255) 
                });
            }
        }

        console.log("Base de datos Inicializada!")
        knex.destroy();
        process.exit(0);

    } catch (error) {
        console.log("Error al inicializar tablas de la DB");
        console.log(error);
        process.exit(1);
    }
}


if (process.argv[2]==undefined){
    console.log("Proporcione el pass de root para MySQL")
}else{
    InitDB(process.argv[2], productos);
    InitDB(process.argv[2], chat);
}


