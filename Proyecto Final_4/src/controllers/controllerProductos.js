import express from 'express';
import ApiProductosBO from '../business/ApiProductosBO.js'
import Error from '../config/errors.js'

const { Router } = express;

// Mapeo los errores de la capa de negocio a sus equivalentes para la capa de ruteo
function MapErrorCode(businessError){
    return ({error_id: Error.B2C(businessError), error_description: businessError})
}

// Validaciones internas de la capa de ruteo
function ValidateID(element){
    // En la implementacion actual se emplea un ID autogenerado con UUID.
    // Este campo posee un esquema del tipo String.
    return true
}

function ValidarPermisos(ruta, metodo, config, res, callback){
    if (config.permisos===false){
        res.json({ error:-1, descripcion: `ruta ${ruta} método ${metodo} no autorizada`})
    }else{
        callback();
    }
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

// Controlador de Productos
async function ControlerProductos(config){
    const controler = Router();
    const apiProductosBO = new ApiProductosBO();
    await apiProductosBO.initialize(config)

    controler.get('/', async (req, res)=>{
        const productos = await apiProductosBO.getAll()
        SendResponse(productos, res)
    });

    controler.get('/:id', async (req, res)=>{
        const product_id = req.params.id;
        if (!ValidateID(product_id)){
            res.status(400).json({error: 'ID invalido'});
        }else{
            const data = await apiProductosBO.get(product_id);
            SendResponse(data, res)
        }
    });

    controler.post('/', async (req, res)=>{
        ValidarPermisos('/', 'post', config, res, async()=>{
            const producto = req.body;
            const data = await apiProductosBO.insert(producto);
            SendResponse(data, res)
        });
    });

    controler.put('/:id',async (req, res)=>{
        const product_id = req.params.id;
        const producto = req.body;

        if (!ValidateID(product_id)){
            res.status(400).json({error: 'ID invalido'});
        }else{
            ValidarPermisos('/' + String(product_id), 'put', config, res, async()=>{
                const data = await apiProductosBO.update(product_id, producto);
                SendResponse(data, res)
            });
        }
    });

    controler.delete('/:id', async (req, res)=>{
        const product_id = req.params.id;
        if (!ValidateID(product_id)){
            res.status(400).json({error: 'ID invalido'});
        }else{
            ValidarPermisos('/' + String(product_id), 'delete', config, res,async()=>{
                const data = await apiProductosBO.remove(product_id);
                res.json(data);
            });
        }   
    });

    return controler;
}



export default ControlerProductos;
