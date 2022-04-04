const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './config.env') })


// Configuracion General del Motor SQL
root = {
    client: 'pg',
    connection: {
      host: process.env.SQL_SERVER_HOST,
      port: process.env.SQL_SERVER_PORT,
      user: 'root'   
    }
}

// Configuracion para Productos
productos = {
    server: {
        client: 'pg',
        connection: {
          host: process.env.SQL_SERVER_HOST,
          port: process.env.SQL_SERVER_PORT,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB,
          ssl: { rejectUnauthorized: false } // Heroku
        }
    },
    table: "productos",
}    

// Configuracion para Chats
chat_authors = {
    server: {
        client: 'sqlite3',
        connection: { filename: './db/ecommerce.sqlite' },
        useNullAsDefault: true
    },    
    table: "autores",
}

chat_msg = {
    server: {
        client: 'sqlite3',
        connection: { filename: './db/ecommerce.sqlite' },
        useNullAsDefault: true
    },    
    table: "mensages",
}



module.exports = {
    root,
    productos,  
    chat_authors,
    chat_msg
} ;