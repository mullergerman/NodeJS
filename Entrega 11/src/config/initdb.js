const createKnex = require('knex');
const { root, productos, chat_authors, chat_msg } = require('./config.js')

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

        const exists = await knex.schema.hasTable(config.table);
        if (!exists){
            await knex.schema.createTable(config.table, (table) => {
                console.log(config.table)
                if (config.table=='productos'){
                    table.increments('id').notNullable()
                    table.string('title',30).notNullable()
                    table.float('price').notNullable()
                    table.string('thumbnail',255).notNullable()
                }else if (config.table=='autores'){
                    table.string('id',255).unique().notNullable()
                    table.string('nombre',255)
                    table.string('apellido',255)
                    table.integer('edad',255)
                    table.string('alias', 255)
                    table.string('avatar', 255)
                }else if (config.table=='mensages'){
                    table.increments('id').unique().notNullable()
                    table.integer('author',255)
                    table.string('text',255)
                    table.string('time',255)
                }
            })
        }

        console.log(config.table + ": Base de datos Inicializada!")
        knex.destroy();

    } catch (error) {
        console.log("Error al inicializar tablas de la DB");
        console.log(error);
        process.exit(1);
    }
}

async function InitAll(pass){
    await InitDB(pass, productos);
    await InitDB(pass, chat_authors);
    await InitDB(pass, chat_msg);
    process.exit(0);
}

if (process.argv[2]==undefined){
    console.log("Proporcione el pass de root para MySQL")
}else{
    InitAll(process.argv[2]);
}



