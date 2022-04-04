import axios from 'axios';
import Observable from './observable.js';
import { loggerFE as logger } from '../utils/logger.js';



class Business{
    constructor(persistence, config){
        axios.defaults.baseURL = config.url_base;
        this.persistence = persistence;
        this.observable = new Observable();
    }

    getUpload(){
        return this.persistence.getUpload();
    }

    async newConnection(access_token){
        try {
            return await axios.get('/api/productos', { headers: {"Authorization" : `Bearer ${access_token}`} });
        } catch (error) {
            return null;
        }
    }

    async getProduct(id, access_token){
        try {
            const product = await axios.get(`/api/productos/${id}`, { headers: {"Authorization" : `Bearer ${access_token}`} });
            return product;
        } catch (error) {
            return null;
        }
    }

    async getAllProducts(access_token){
        try {
            const result = await axios.get('/api/productos', { headers: {"Authorization" : `Bearer ${access_token}`} });
            const all_products = result.data
            return all_products;
        } catch (error) {
            return null;
        }
    }

    async getAllCarritos(access_token){
        try {
            const result = await axios.get('/api/carritos', { headers: {"Authorization" : `Bearer ${access_token}`} });
            const all_carts = result.data
            return all_carts;
        } catch (error) {
            return null;
        }
    }

    async newProduct(dato, access_token){
        try {
            await axios.post('/api/productos', dato, { headers: {"Authorization" : `Bearer ${access_token}`} });
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async editProduct(dato, access_token){
        try {
            await axios.put(`/api/productos/${dato.id}/`, dato,  { headers: {"Authorization" : `Bearer ${access_token}`} });
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async removeProduct(id, access_token){
        try {
            await axios.delete(`/api/productos/${id}`, { headers: {"Authorization" : `Bearer ${access_token}`} });
            return await this.getAllProducts();
        } catch (error) {
            return null;
        }
    }

    async addProductIntoCart(username, product_id, access_token){

        // Obtengo el CartID correspontiente a este User.
        // Si el cartid existe, utiliza ese, sino debe crear uno nuevo y asignarlo al usuario.
        const res = await axios.get(`/api/users/${username}/carrito`, { headers: {"Authorization" : `Bearer ${access_token}`} });
        let carrito_id = res.data

        if (carrito_id == ""){
            const carrito = await axios.post(`/api/carritos`, {username}, { headers: {"Authorization" : `Bearer ${access_token}`} });
            carrito_id = carrito.data.id;
        }

        // Obtengo el producto
        const res1 = await axios.get(`/api/productos/${product_id}`, { headers: {"Authorization" : `Bearer ${access_token}`} });
        const producto = res1.data;

        // Agrego el producto al carrito
        const result2 = await axios.post(`/api/carritos/${carrito_id}/productos`,{product: producto}, { headers: {"Authorization" : `Bearer ${access_token}`} });

    }

    async getUserCartInfo(username, access_token){
        let data = {}
        try {
            const res1 = await axios.get(`/api/users/${username}`, { headers: {"Authorization" : `Bearer ${access_token}`} });
            let user = res1.data
            user.photo = "/uploads/" + user.photo
            const carrito_id = user.cart;
            if ((carrito_id == "") || (carrito_id == undefined)){
                data = {user, productos:[]}
            }else{
                const res2 = await axios.get(`/api/carritos/${carrito_id}/productos`, { headers: {"Authorization" : `Bearer ${access_token}`} });
                const productos = res2.data
                data = {user, productos}
            }
            return data;
        } catch (error) {
            logger.error(`Business;Error en getUserCartInfo\n${error}`);
            return null
        }    
    }

    async removeProductFromCart(username, product_idInCart, access_token){
        const data = await this.getUserCartInfo(username, access_token);
        const result = await axios.delete(`/api/carritos/${data.user.cart}/productos/${product_idInCart}`, { headers: {"Authorization" : `Bearer ${access_token}`} });
    }

    async buyCart(username, access_token){
        // Obtengo el CartID correspontiente a este User.
        const res = await axios.get(`/api/users/${username}/carrito`, { headers: {"Authorization" : `Bearer ${access_token}`} });
        let carrito_id = res.data

        if (carrito_id == ""){
            logger.error(`Business;Error en buyCart;carrito_id no disponible`);
            return
        }

        // Envio la orden de POST para la compra del carrito
        const response = await axios.post(`/api/carritos/${carrito_id}/buy`, {username}, { headers: {"Authorization" : `Bearer ${access_token}`} });
        const orden = response.data
        return(orden)
    }

    async userLogin(username, password){
        // Consulto al BE por el Login del Usuario
        const response = await axios.post(`/api/auth/login`, {username, password});
        const {err, user, access_token} = response.data;
        if(err){
            logger.warn(`Business;Login;\n${err}`);
        }
        return ({err, user, access_token});
    }

    async userRegister(userDTO){
        // Consulto al BE por el Resgiter del Usuario        
        const response = await axios.post(`/api/auth/register`, {user: userDTO});
        const {err, user} = response.data;
        if(err){
            logger.warn(`Business;Register;\n${err}`);
        }
        return ({err, user});
    }

    async userDeserialize(username){
        // Consulto al BE por el user correspondiente a un username
        const response = await axios.get(`/api/auth/${username}`);
        const user = response.data;
        return (user);
    }


}

export default Business;