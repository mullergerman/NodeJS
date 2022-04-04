import twilio from 'twilio'
import { twilio_account, twilio_token, twilio_sms_source } from '../config/config.js'; 
import { loggerBE as logger } from '../utils/logger.js';

class notificacionesSMS{
    constructor(){
        this.client = twilio(twilio_account, twilio_token);
    }

    async sendSMS(body, destination){
        const options = {
            body,
            from: twilio_sms_source,
            to: destination,
          }
          
          try {
            const message = await this.client.messages.create(options)
            logger.debug(`NotificacionesSMS;Mensaje enviado a ${destination}`);
          } catch (error) {
            logger.error(`NotificacionesSMS;Error al enviar SMS\n${error}`);
          }
    }

    async notificarCompra(data){

        // Armar el cuerpo del mensaje
        let body = `Su compra esta siendo procesada!`

        // Enviar WhatsApp al administrador
        await this.sendSMS(body, data.user.phone);
    }   

}


export default notificacionesSMS;


