import handlebars from 'express-handlebars';
import {  webserver_title } from '../config/config.js';

class Renders{
    constructor(app){
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
                        return webserver_title;
                    },
                }
            })
        );
        
        app.set('views', './webserver/views');
        app.set('view engine', 'hbs');
    }
}

export default Renders;