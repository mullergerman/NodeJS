import express from 'express';
import ApiUsersBO from '../business/ApiUsersBO.js';
import Error from '../config/errors.js'
import { loggerBE } from '../utils/logger.js';

const { Router } = express;

// Mapeo los errores de la capa de negocio a sus equivalentes para la capa de ruteo
function MapErrorCode(businessError){
    return ({error_id: Error.B2C(businessError), error_description: businessError})
}

// Validaciones internas de la capa de ruteo
function ValidateID(lista){
    if (isNaN(element)){
        return false
    }
    return true
}


// Enviar Respuestas
function SendResponse(data, res){
    if ((typeof data === 'string') || (Array.isArray(data))){
        res.status(200).json(data)
    }else if('error' in data){
        const {error_id, error_description} = MapErrorCode(data.error)
        res.status(error_id).json(error_description)
    }else{
        res.status(200).json(data)
    }
}

// Controlador de Usuarios
async function ControllerUsers(config){
    const controller = Router();
    const apiUsersBO = new ApiUsersBO();
    await apiUsersBO.initialize(config)

    controller.get('/:username/carrito', async (req, res)=>{
        const username = req.params.username;
        const carrito_id = await apiUsersBO.getCartFromUser(username);
        SendResponse(carrito_id, res)
    });

    controller.post('/:username/carrito',async (req, res)=>{
        const username = req.params.username;
        const carrito_id = req.body.carrito_id;
        const data = await apiUsersBO.addCartToUser(username, carrito_id);
        SendResponse(data, res)
    });

    controller.get('/:username', async (req, res)=>{
        const username = req.params.username;
        const user = await apiUsersBO.getUserInfo(username);
        SendResponse(user, res);
    });


    return controller;
}

export default ControllerUsers;