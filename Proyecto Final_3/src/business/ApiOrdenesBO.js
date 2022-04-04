import { v4 as uuidv4 } from 'uuid';
import { getDaoOrders, DaoInit } from '../persistence/daos/index.js';
import Error from '../config/errors.js';
import NotificationEmail from './notificacionesEmail.js';
import NotificacionesWap from './notificacionesWap.js';
import NotificacionesSMS from './notificacionesSMS.js';
import apiProductosBO from './ApiProductosBO.js'
import { loggerBE as logger } from '../utils/logger.js'

// Inicializar Capa de Persistencia
const daoOrders = getDaoOrders();
DaoInit(daoOrders);


class ApiOrdenesBO{

    constructor(){
        this.error = new Error();
        this.apiProductos = new apiProductosBO();
        this.email = new NotificationEmail();
        this.whatsapp = new NotificacionesWap();
        this.sms = new NotificacionesSMS();
    }

    async Create(user, productos){

        // Log de Información 
        logger.debug(`
            ApiOrdenesBO;Create;(user, productos)
            ${JSON.stringify(user)}
            ${JSON.stringify(productos)}
        `)

        // Actualizar Stock
        for (let producto of productos){
            const response = await this.apiProductos.deduct(producto.id)
            if ('error' in response){
                logger.error("ApiOrdenesBO;Create;No hay stock disponible");
                return { error: "No hay stock disponible"}
            }
        }
        
        // Almacenar en persistencia la orden
        const order = {
            id: uuidv4(),
            fecha: new Date().toLocaleDateString(),
            user: {
                username: user.username,
                name: user.name,
                phone: user.phone,
                address: user.address,
                photo: user.photo
            },
            productos
        }
        daoOrders.insert(order);

        // Enviar notificacion por email al admin
        await this.email.notificarCompra({user, productos})

        // Enviar notificacion por whatsapp al admin
        await this.whatsapp.notificarCompra({user, productos})

        // Enviar notificacion por SMS al cliente
        await this.sms.notificarCompra({user, productos})

        // Devolver order creada
        logger.debug(`ApiOrdenesBO;Create; Orden de Compra creada correctamente!`);
        return order
    }



}


export default ApiOrdenesBO;