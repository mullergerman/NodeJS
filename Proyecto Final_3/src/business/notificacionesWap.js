import twilio from 'twilio'
import { twilio_account, twilio_token, twilio_whatsapp_sandbox, admin_whatsapp } from '../config/config.js'; 
import { loggerBE as logger } from '../utils/logger.js' 

class notificacionesWap{
    constructor(){
        this.client = twilio(twilio_account, twilio_token);
    }

    async sendWhatsapp(body){
        const options = {
            body,
            from: `whatsapp:${twilio_whatsapp_sandbox}`,
            to: `whatsapp:${admin_whatsapp}`,
          }
          
          try {
            const message = await this.client.messages.create(options)
            logger.debug(`NotificacionesWap;Whatsapp enviado a ${admin_whatsapp}`);
          } catch (error) {
            logger.error(`NotificacionesWap;Error al enviar Whatsapp\n${error}`);
          }
    }

    async notificarCompra(data){

        // Armar el cuerpo del mensaje
        let body = 
        `
        *Se ha registrado una nueva compra*
        - *Username:* ${data.user.username}
        - *Nombre:* ${data.user.name}
        - *Telefono:* ${data.user.phone}
        - *Direccion:* ${data.user.address}

        *Productos Adquiridos*
        `
        for (let producto of data.productos){
            body = body + 
            `
            *Nombre:* ${producto.nombre}
            *Codigo:* ${producto.codigo}
            *Precio:* ${producto.precio}
            `
        }

        // Enviar WhatsApp al administrador
        await this.sendWhatsapp(body)
    }   

}


export default notificacionesWap;


