import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import os from 'os';
import { loggerMain as logger } from '../utils/logger.js';

function getConfig(mode){

    // ===================================================================================================
    // Cargar configuracion segun el modo de operacion "development" o "production"
    // ===================================================================================================
    const config = {};
    if (mode == "production"){
        dotenv.config({path: 'config.env'})
        logger.info('Modo: Production');
    }
    if (mode == "development"){
        dotenv.config({path: 'development.env'})
        logger.info('Modo: Develpment');
    }

    // ====================================================================================================
    // --------------------------------------------- Servidor ---------------------------------------------
    // ====================================================================================================

    // Configuracion del Server
    config.portBE = process.env.API_SERVER_PORT || process.env.PORTBE || 8081;
    config.portFE = process.env.WEB_SERVER_PORT || process.env.PORT || 80;

    // WebServer Multer
    config.multer_pics = "./webserver/public/uploads";
    config.url_base = process.env.BASE_URL + ":" + config.portBE + "/";

    // WebServer Title
    config.webserver_title = "Proyecto Final";

    // JWT
    config.jwt_key = "Tester";
    config.expire_time = '24h';

    // Admin
    config.admin_username = process.env.ADMIN_EMAIL;

    // CPUs Disponibles
    config.cpus = os.cpus();

    // ====================================================================================================
    // ------------------------------------------- Persistencia -------------------------------------------
    // ====================================================================================================
    // operation_mode = 0 ==> Almacenamiento en Memoria
    // operation_mode = 1 ==> Almacenamiento en Archivo
    // operation_mode = 2 ==> Almacenamiento en MongoDB
    // operation_mode = 3 ==> Almacenamiento en Firebase

    // General
    config.operation_mode = 2

    // Configuraciones particulares del modo "Almacenamiento en Archivo"
    config.db_file_path_productos =  './db_productos.txt';
    config.db_file_path_carritos =  './db_carritos.txt';

    // Nombres de DB y Colecciones (para MongoDB y Firebase)
    config.db_name = "proyecto"
    config.collection_productos = 'productos';
    config.collection_carritos = 'carritos';
    config.collection_users = 'users';
    config.collection_ordenes = 'ordenes';
    config.collection_chats = 'mensajes';

    // Configuraciones particulares del modo "Almacenamiento en MongoDB"
    config.mongo_server = {
        url: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_SERVER}`
    }

    // Configuraciones particulares del modo "Almacenamiento en Firebase"
    config.firebase_server = null;
    if (config.operation_mode === 3){
        config.firebase_server = JSON.parse(readFileSync(process.env.FIREBASE_JSON_CONFIG, 'utf8'))
    }

    // ====================================================================================================
    // ------------------------------------------ Notificaciones ------------------------------------------
    // ====================================================================================================
    // Servicio EMAIL - SendGrip (with NodeMailer)
    config.admin_email = process.env.ADMIN_EMAIL;
    config.sendgrid_api = process.env.SENDGRIP_API;

    // Servicio SMS/Whatsapp - Twilio
    config.twilio_account = process.env.TWILIO_ACCOUNT;
    config.twilio_token = process.env.TWILIO_TOKEN;
    config.twilio_sms_source = process.env.TWILIO_SMS_SOURCE;
    config.admin_whatsapp = process.env.ADMIN_WHATSAPP;
    config.twilio_whatsapp_sandbox = process.env.TWILIO_WHATSAPP_SANDBOX;

    return(config);

}

export default getConfig;
