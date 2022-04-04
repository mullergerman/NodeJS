import express from 'express';
import ApiCarritosBO from '../business/ApiCarritosBO.js'
import Error from '../config/errors.js'

const { Router } = express;

// Mapeo los errores de la capa de negocio a sus equivalentes para la capa de ruteo
function MapErrorCode(businessError){
    return ({error_id: Error.B2C(businessError), error_description: businessError})
}

// Validaciones internas de la capa de ruteo
function ValidateID(lista){
    // En la implementacion actual se emplea un ID autogenerado con UUID.
    // Este campo posee un esquema del tipo String.
    return true
}


// Enviar Respuestas
function SendResponse(data, res){
    if ((typeof data === 'string') || (Array.isArray(data))){
        res.status(200).json(data)
    }else if ('error' in data){
        const {error_id, error_description} = MapErrorCode(data.error)
        res.status(error_id).json(error_description)
    }else{
        res.status(200).json(data)
    }
}

// Controlador de Carritos
async function ControllerCarritos(config){
    const controller = Router();
    const apiCarritosBO = new ApiCarritosBO();
    await apiCarritosBO.initialize(config)

    controller.get('/',async (req, res)=>{
        const carritos = await apiCarritosBO.getCarritosAll();
        SendResponse(carritos, res)
    });

    controller.post('/', async (req, res)=>{
        const username = req.body.username;
        const carrito = await apiCarritosBO.newCarrito(username)
        SendResponse(carrito, res) /// Ojo aca deberia responder con el ID solamente!
    });

    controller.delete('/:id', async (req, res)=>{
        const carrito_id = req.params.id;

        // Validacion Intena de la capa de ruteo
        if (!ValidateID(carrito_id)){
            res.status(400).json({error: 'ID invalido'});
        }else{
            const result = await apiCarritosBO.removeCarrito(carrito_id);
            SendResponse(result, res);
        }           
    });

    controller.get('/:id/productos', async (req, res)=>{
        const carrito_id = req.params.id;

        // Validacion Intena de la capa de ruteo
        if (!ValidateID(carrito_id)){
            res.status(400).json({error: 'ID invalido'});
        }else{
            const products = await apiCarritosBO.getProductoInCarrito(carrito_id)
            SendResponse(products, res);
        }
    });

    controller.post('/:id/productos', async (req, res)=>{
        const carrito_id = req.params.id;
        const product = req.body.product;

        // Validacion Interna de la capa de ruteo
        if (!ValidateID(carrito_id)){
            res.status(400).json({error: 'ID invalido'})
        }else{
            const result = await apiCarritosBO.insertProductInCarrito(carrito_id, product);
            SendResponse(result,res); 
        }
    });


    controller.delete('/:id/productos/:id_prod', async (req, res)=>{
        const carrito_id = req.params.id;
        const product_id = req.params.id_prod;

        // Validacion Interna de la capa de ruteo
        if ((!ValidateID(carrito_id)) || (!ValidateID(product_id))){
            res.status(400).json({error: 'ID invalido'})
        }else{
            const result = await apiCarritosBO.deleteProductoInCarrito(carrito_id, product_id)
            SendResponse(result,res);
        }
    });

    controller.post('/:id/buy', async (req, res)=>{
        const carrito_id = req.params.id;
        const username = req.body.username;

        // Validacion Interna de la capa de ruteo
        if (!ValidateID(carrito_id)){
            res.status(400).json({error: 'ID invalido'})
        }else{
            const result = await apiCarritosBO.buyCart(username, carrito_id);
            SendResponse(result,res); 
        }
    });


    return controller;
}

export default ControllerCarritos;