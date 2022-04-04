// Configuracion General del Motor SQL
root = {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root'    
    }
}

// Configuracion para Productos
productos = {
    server: {
        client: 'mysql',
        connection: {
          host: '127.0.0.1',
          user: 'german',
          password: 'german',
          database: 'ecommerce'
        },
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