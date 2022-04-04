import handlebars from 'express-handlebars';

class Renders{
    constructor(app, config){
        // ---------------------------------------------------------------------------------------------------------
        // Render de vistas
        // ---------------------------------------------------------------------------------------------------------
        app.engine("hbs",
            handlebars({
                extname: ".hbs",
                defaultLayout: "index.hbs",
                layoutsDir: "./webserver/views/layouts",   
                partialsDir: "./webserver/views/partials",
                helpers: {
                    webTitle: function() {
                        return (config.webserver_title);
                    },
                }
            })
        );
        
        app.set('views', './webserver/views');
        app.set('view engine', 'hbs');
    }
}

export default Renders;