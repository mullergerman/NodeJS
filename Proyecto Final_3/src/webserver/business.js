import axios from 'axios';
import { url_base } from '../config/config.js';
import Observable from './observable.js';
import { loggerFE as logger } from '../utils/logger.js';

axios.defaults.baseURL = url_base;

class Business{
    constructor(persistence){
        this.persistence = persistence;
        this.observable = new Observable();
    }

    getUpload(){
        return this.persistence.getUpload();
    }

    async newConnection(){
        try {
            return await axios.get('/api/productos');
        } catch (error) {
            return null;
        }
    }

    async getProduct(id){
        try {
            const product = await axios.get(`/api/productos/${id}`);
            return product;
        } catch (error) {
            return null;
        }
    }

    async getAllProducts(){
        try {
            const result = await axios.get('/api/productos');
            const all_products = result.data
            return all_products;
        } catch (error) {
            return null;
        }
    }

    async getAllCarritos(){
        try {
            const result = await axios.get('/api/carritos');
            const all_carts = result.data
            return all_carts;
        } catch (error) {
            return null;
        }
    }

    async newProduct(dato){
        try {
            await axios.post('/api/productos', dato);
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async editProduct(dato){
        try {
            await axios.put(`/api/productos/${dato.id}/`,dato);
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async removeProduct(id){
        try {
            await axios.delete(`/api/productos/${id}`);
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async addProductIntoCart(username, product_id){

        // Obtengo el CartID correspontiente a este User.
        // Si el cartid existe, utiliza ese, sino debe crear uno nuevo y asignarlo al usuario.
        const res = await axios.get(`/api/users/${username}/carrito`);
        let carrito_id = res.data

        if (carrito_id == ""){
            const carrito = await axios.post(`/api/carritos`, {username});
            carrito_id = carrito.data.id;
        }

        // Obtengo el producto
        const res1 = await axios.get(`/api/productos/${product_id}`);
        const producto = res1.data;

        // Agrego el producto al carrito
        const result2 = await axios.post(`/api/carritos/${carrito_id}/productos`,{product: producto});

    }

    async getUserCartInfo(username){
        let data = {}
        try {
            const res1 = await axios.get(`/api/users/${username}`);
            let user = res1.data
            user.photo = "/uploads/" + user.photo
            const carrito_id = user.cart;
            if ((carrito_id == "") || (carrito_id == undefined)){
                data = {user, productos:[]}
            }else{
                const res2 = await axios.get(`/api/carritos/${carrito_id}/productos`);
                const productos = res2.data
                data = {user, productos}
            }
            return data;
        } catch (error) {
            logger.error(`Business;Error en getUserCartInfo\n${error}`);
            return null
        }    
    }

    async removeProductFromCart(username, product_idInCart){
        const data = await this.getUserCartInfo(username);
        const result = await axios.delete(`/api/carritos/${data.user.cart}/productos/${product_idInCart}`);
    }

    async buyCart(username){
        // Obtengo el CartID correspontiente a este User.
        const res = await axios.get(`/api/users/${username}/carrito`);
        let carrito_id = res.data

        if (carrito_id == ""){
            logger.error(`Business;Error en buyCart;carrito_id no disponible`);
            return
        }

        // Envio la orden de POST para la compra del carrito
        const response = await axios.post(`/api/carritos/${carrito_id}/buy`, {username});
        const orden = response.data
        return(orden)
    }

    async userLogin(username, password){

        // Consulto al BE por el Login del Usuario
        const response = await axios.post(`/api/users/login`, {username, password});
        const {err, user} = response.data;
        if(err){
            logger.warn(`Business;Login;\n${err}`);
        }
        return ({err, user});
    }

    async userRegister(userDTO){
        // Consulto al BE por el Resgiter del Usuario
        const response = await axios.post(`/api/users/register`, {user: userDTO});
        const {err, user} = response.data;
        if(err){
            logger.warn(`Business;Register;\n${err}`);
        }
        return ({err, user});
    }

    async userDeserialize(username){

        // Consulto al BE por el user correspondiente a un username
        const response = await axios.get(`/api/users/${username}`);
        const user = response.data;
        return (user);
    }


}

export default Business;