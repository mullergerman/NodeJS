import twilio from 'twilio'
import { loggerBE as logger } from '../utils/logger.js' 

class notificacionesWap{
    constructor(config){
        this.config = config;
        this.client = twilio(this.config.twilio_account, this.config.twilio_token);
    }

    async sendWhatsapp(body){
        const options = {
            body,
            from: `whatsapp:${this.config.twilio_whatsapp_sandbox}`,
            to: `whatsapp:${this.config.admin_whatsapp}`,
          }
          
          try {
            const message = await this.client.messages.create(options)
            logger.debug(`NotificacionesWap;Whatsapp enviado a ${this.config.admin_whatsapp}`);
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


