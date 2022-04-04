import express from 'express';
import ApiUsersBO from '../business/ApiUsersBO.js';
import Error from '../config/errors.js'
import { loggerBE } from '../utils/logger.js';
import { generateToken } from '../routers/session.js';

const { Router } = express;

// Mapeo los errores de la capa de negocio a sus equivalentes para la capa de ruteo
function MapErrorCode(businessError){
    return ({error_id: Error.B2C(businessError), error_description: businessError})
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
async function ControllerAuth(config){
    const controller = Router();
    const apiUsersBO = new ApiUsersBO();
    await apiUsersBO.initialize(config);

    controller.post('/register',async (req, res)=>{
        const user = req.body.user;
        const data = await apiUsersBO.register(user);
        if (data.user){
            const access_token = generateToken(config, data.user);
            data.access_token = access_token;
        }
        SendResponse(data, res)
    });

    controller.post('/login',async (req, res)=>{
        const {username, password} = req.body;
        const data = await apiUsersBO.login(username, password);
        loggerBE.debug(data);
        if (data.user){
            const access_token = generateToken(config, data.user);
            data.access_token = access_token;
        }
        loggerBE.debug(data);
        SendResponse(data, res)
    });

    controller.get('/:username', async (req, res)=>{
        const username = req.params.username;
        const user = await apiUsersBO.getUserInfo(username);
        SendResponse(user, res);
    });

    return controller;
}

export default ControllerAuth;