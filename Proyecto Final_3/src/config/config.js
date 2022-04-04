import dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config({path: 'config.env'})

// ====================================================================================================
// --------------------------------------------- Servidor ---------------------------------------------
// ====================================================================================================

// Configuracion del Server
const portBE = process.env.API_SERVER_PORT || process.env.PORT || 8081;
const portFE = process.env.WEB_SERVER_PORT || process.env.PORT || 8080;

// WebServer Multer
const multer_pics = "./webserver/public/uploads"
const url_base = process.env.BASE_URL + ":" + portBE + "/"

// WebServer Title
const webserver_title = "Proyecto V3"

// ====================================================================================================
// ------------------------------------------- Persistencia -------------------------------------------
// ====================================================================================================
// operation_mode = 0 ==> Almacenamiento en Memoria
// operation_mode = 1 ==> Almacenamiento en Archivo
// operation_mode = 2 ==> Almacenamiento en MongoDB
// operation_mode = 3 ==> Almacenamiento en Firebase

// General
const operation_mode = 2

// Configuraciones particulares del modo "Almacenamiento en Archivo"
const db_file_path_productos =  './db_productos.txt';
const db_file_path_carritos =  './db_carritos.txt';

// Nombres de DB y Colecciones (para MongoDB y Firebase)
const db_name = "proyecto"
const collection_productos = 'productos';
const collection_carritos = 'carritos';
const collection_users = 'users';
const collection_ordenes = 'ordenes';

// Configuraciones particulares del modo "Almacenamiento en MongoDB"
const mongo_server = {
    url: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_SERVER}`
}

// Configuraciones particulares del modo "Almacenamiento en Firebase"
let firebase_server = null;
if (operation_mode === 3){
    firebase_server = JSON.parse(readFileSync(process.env.FIREBASE_JSON_CONFIG, 'utf8'))
}

// ====================================================================================================
// ------------------------------------------ Notificaciones ------------------------------------------
// ====================================================================================================
// Servicio EMAIL - SendGrip (with NodeMailer)
const admin_email = process.env.ADMIN_EMAIL;
const sendgrid_api = process.env.SENDGRIP_API;

// Servicio SMS/Whatsapp - Twilio
const twilio_account = process.env.TWILIO_ACCOUNT;
const twilio_token = process.env.TWILIO_TOKEN;
const twilio_sms_source = process.env.TWILIO_SMS_SOURCE;
const admin_whatsapp = process.env.ADMIN_WHATSAPP;
const twilio_whatsapp_sandbox = process.env.TWILIO_WHATSAPP_SANDBOX;


export { 
    mongo_server, 
    firebase_server, 
    db_file_path_productos, 
    db_file_path_carritos, 
    operation_mode, 
    collection_productos, 
    collection_carritos,
    collection_users,
    collection_ordenes,
    db_name,
    multer_pics,
    webserver_title,
    url_base,
    admin_email,
    sendgrid_api,
    twilio_account,
    twilio_token,
    admin_whatsapp,
    twilio_whatsapp_sandbox,
    twilio_sms_source,
    portBE,
    portFE
};