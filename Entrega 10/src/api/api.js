const express = require('express');
const { Router } = express;
const ProductosTest = require('../mock/ProductosTest.js');

class API{
    constructor(app, store){
        const routerProductos = Router();
        const routerProductosTest = Router();

        routerProductos.get('/', async (req, res)=>{
            const productos = await store.getAll()
            res.json(productos);
        });
        
        
        routerProductos.get('/:id', async (req, res)=>{
            const num = parseInt(req.params.id);
            if (isNaN(num)){
                res.status(404).json({error: 'id incorrecto'});
            }else{
                const data = await store.get(num);
                res.json(data);
            }
        });
        
        routerProductos.post('/', async (req, res)=>{
            const producto = req.body;
            const data = await store.insert(producto)
            res.json(data);
        });
        
        routerProductos.put('/:id', async (req, res)=>{
            const num = parseInt(req.params.id);
            const producto = req.body;
            if (isNaN(num)){
                res.status(404).json({error: 'id incorrecto'});
            }else{
                const data = await store.update(num, producto)
                res.json(data);
            }
        });
        
        routerProductos.delete('/:id', async (req, res)=>{
            const num = parseInt(req.params.id);
            if (isNaN(num)){
                res.status(404).json({error: 'id incorrecto'});
            }else{
                const data = await store.remove(num)
                res.json(data);
            }
        });

        routerProductosTest.get('/', (req, res)=>{
            const data = ProductosTest.generate(5);
            res.json(data);
        })


        app.use('/api/productos',routerProductos);
        app.use('/api/productos-test',routerProductosTest);
        

    }
}

module.exports = API;