import { getDaoUsers, DaoInit } from '../persistence/daos/index.js'
import NotificationEmail from './notificacionesEmail.js'
import Error from '../config/errors.js'
import { v4 as uuidv4 } from 'uuid';
import { loggerBE as logger } from '../utils/logger.js';
import { validateHash } from '../utils/hash.js';


// Clase Users en la capa de Negocio
class ApiUsersBO{

    constructor(){
        this.error = new Error();
    }

    async initialize(config){
        // Inicializar vinculo con la capa de Persistencia
        this.email = new NotificationEmail(config);
        this.daoUsers = getDaoUsers(config);
        await DaoInit(this.daoUsers);
    }

    async register(userDTO){
        // Verificar si el usuario ha sido registrado previamente
        const users = await this.daoUsers.getByUsername(userDTO.username)
        if ((!(Array.isArray(users))) || (users.length > 0)){
            return ({err: null, user: false})
        }

        // Ingresar en la DB
        userDTO.photo = uuidv4() + '_pic_profile.png';
        userDTO.cart = "";
        const resultado = await this.daoUsers.insert(userDTO);
        if (!resultado){
            logger.warn(`ApiUsersBO;register;Usuario Existente: ${userDTO.username}`);
            return ({err: resultado.error, user: null});
        }

        // Enviar notificacion al Administrador
        await this.email.notificarRegistro(userDTO)

        // Devolver respuesta a PassPort Middleware
        logger.debug(`ApiUsersBO;register;Nuevo Usuario Registrado: ${userDTO.username}`);
        return ({err: null, user: resultado})        
    }

    serialize(user){
        return user.username;
    }

    async deserialize(username){
        const user = await this.daoUsers.get(username);
        if (!user){
            return null
        }else{
            return user
        }
    }

    async login(username, password){
        // Obtener el Usuario de la DB
        const user = await this.daoUsers.get(username);

        // Verificar que exista en usuario
        if (!user || user.length==0){
            return ({err: user.error, user: null})
        }

        // Validar el password
        if (validateHash(user.password, password)){
            logger.debug(`ApiUsersBO;login;Login ok: ${user.username}`)
            return ({err: null, user: user})
        }else{
            logger.warn(`ApiUsersBO;login;Login fail: ${user.username}`)
            return ({err: null, user: false})
        }
    }

    async getPhotoFilename(username){
        // Obtener el Usuario de la DB
        const user = await this.daoUsers.get(username);
        if (!user){
            return ({err: user.error, user: null})
        }

        // Enviar el Filename
        return user.photo;
    }

    async addCartToUser(username, carrito_id){
        const user = await this.daoUsers.get(username);
        // Verificar que el User no posea un carrito asignado previamente
        if (user.cart!=undefined){
            logger.error(`ApiUsersBO;addCartToUser;Imposible Asignar Carrito`);
            return ({err: this.error.ImposibleAsignarCarrito, user: null});
        }

        // Genero el objeto del usuario completo, incluyendo el ID del Carrito.
        user.cart = carrito_id;
        const result = await this.daoUsers.update(username, user);
        if (!result){
            logger.error(`ApiUsersBO;addCartToUser;Imposible Asignar Carrito`);
            return ({err: this.error.ImposibleAsignarCarrito, user: null})
        }
        return user;
    }

    async getCartFromUser(username){
        const user = await this.daoUsers.get(username);
        let cart = user.cart
        if (cart){
            return cart;
        }else{
            return ("");
        }        
    }

    async getUserInfo(username){
        const user = await this.daoUsers.get(username);
        if (!user){
            logger.error(`ApiUsersBO;getUserInfo;Usuario no disponible`);
            return ({err: this.error.UserNoDisponible, user: null})
        }
        return user;
    }
    
    async setUserCart(username, carrito_id){
        let user = this.daoUsers.get(username);
        user.cart = carrito_id;
        const result = await this.daoUsers.update(username, user);
        if (!result){
            logger.error(`ApiUsersBO;setUserCart;Imposible Asignar Carrito`);
            return ({error: this.error.ImposibleAsignarCarrito});
        }
        return ({result: "ok!"})
    }

    async removeUserCart(username){
        let user = await this.daoUsers.get(username);
        user.cart = "";
        const result = await this.daoUsers.update(username, user);
        if (!result){
            logger.error(`ApiUsersBO;removeUserCart;Imposible Eliminar Carrito`);
            return ({error: this.error.ImposibleEliminarCarrito})
        }
        return ({result: "ok!"})
    }

    

}



export default ApiUsersBO;