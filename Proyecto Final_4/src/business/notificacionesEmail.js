import nodemailer from 'nodemailer'
import sgTransport from 'nodemailer-sendgrid-transport'
import { loggerBE as logger} from '../utils/logger.js'; 

class NotificationEmail{

    constructor(config){
        this.config = config;
        this.options = {
            auth: {
                api_key: this.config.sendgrid_api
            }
        }

        this.client = nodemailer.createTransport(sgTransport(this.options));
    }

    async sendEmail(subject, html, to = this.config.admin_email){
        // Conformar Correo
        const email = {
            from: this.config.admin_email,
            to,
            subject,
            html
        };
        
        // Enviar correo al Administrador
        await this.client.sendMail(email, function(err, info){
            if (err){
                logger.error(`NotificacionesEmail;Error al enviar email\n${err}`);
            }else{
                logger.debug(`NotificacionesEmail;Email enviado a ${to}`);
            }
        });
    }

    async notificarRegistro(user){

        // Construir cuerpo del Correo
        let html_data = 
        `
        <h1>Se ha registrado un nuevo usuario</h1>
        <h5>Datos del Usuario</h5>
        <ul>
            <li><strong>Username</strong>: ${user.username}</li>
            <li><strong>Nombre</strong>: ${user.name}</li>
            <li><strong>Numero de Telefono</strong>: ${user.phone}</li>
            <li><strong>Direccion</strong>: ${user.address}</li>                        
        </ul>
        `

        // Enviar por correo
        const subject = `Nuevo Registro`
        await this.sendEmail(subject, html_data)

    }

    async notificarCompra(data){
        
        // Construir cuerpo del Correo
        let html_data = 
        `
        <h1>Nueva Orden de Compra</h1>
        <h2>Datos del Usuario</h5>
        <ul>
            <li><strong>Username</strong>: ${data.user.username}</li>
            <li><strong>Nombre</strong>: ${data.user.name}</li>
            <li><strong>Numero de Telefono</strong>: ${data.user.phone}</li>
            <li><strong>Direccion</strong>: ${data.user.address}</li>                        
        </ul>
        <br>
        <h2>Productos adquiridos</h5>
        <table style="border: 1px solid black;border-collapse: collapse;">
            <tr style="border: 1px solid black;border-collapse: collapse;">
                <th style="border: 1px solid black;border-collapse: collapse;">Producto</th>
                <th style="border: 1px solid black;border-collapse: collapse;">Descripcion</th>
                <th style="border: 1px solid black;border-collapse: collapse;">Codigo</th>
                <th style="border: 1px solid black;border-collapse: collapse;">Precio</th>
            </tr>
        `

        for (let producto of data.productos){
            html_data = html_data + 
            `
            <tr style="border: 1px solid black;border-collapse: collapse;">
                <td style="border: 1px solid black;border-collapse: collapse;">${producto.nombre}</td>
                <td style="border: 1px solid black;border-collapse: collapse;">${producto.descripcion}</td>
                <td style="border: 1px solid black;border-collapse: collapse;">${producto.codigo}</td>                           
                <td style="border: 1px solid black;border-collapse: collapse;">${producto.precio}</td>
            </tr>
            `
        }

        html_data = html_data + 
        `
        </table>
        <br>
        `

        // Enviar por correo
        const subject = `Nuevo pedido de ${data.user.username}`
        await this.sendEmail(subject, html_data)

    }

}

export default NotificationEmail;