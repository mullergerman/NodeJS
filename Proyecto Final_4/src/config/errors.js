 class Error{
    constructor (){
        // Errores de la capa de Negocio
        this.ProductoNoDisponible = "Producto no disponible"
        this.ProductoIncorrecto = "Producto incorrecto"
        this.ImposibleIncluirProducto = "Imposible incluir el producto"
        this.ImposibleEditarProducto = "Imposible editar el producto"
        this.ImposibleEliminarProducto = "Imposible eliminar el producto"
        
        this.CarritoNoDisponible = "Carrito no disponible"
        this.ImposibleEliminarCarrito = "Imposible eliminar el carrito"

        this.ImposibleAsignarCarrito = "Imposible asignar carrito"
        this.UserNoDisponible = "Usuario no disponible"
        this.StockNoDisponible = "Stock No Disponible"

        // Errores de la capa de Persistencia
        this.GetError = "Error durante metodo get()"
        this.InsertError = "Error durante metodo insert()"
        this.UpdateError = "Error durante metodo update()"
        this.RemoveError = "Error durante metodo remove()"

    }
    
    static B2C(BusinessError){
        const mapping = {
            ProductoNoDisponible: 404,
            ProductoIncorrecto: 400,
            CarritoNoDisponible: 404,
            ImposibleIncluirProducto: 406,
            ImposibleEditarProducto: 409,
            ImposibleEliminarProducto: 500,
            ImposibleAsignarCarrito: 500,
            UserNoDisponible: 500
        }

        if (BusinessError in mapping){
            return(mapping[BusinessError])
        }else{
            return 500
        }
    }

    static Check(input, responseError, responseOk){
        if (typeof input === 'object'){
            if ('error' in input){
                return (null);
            }
        }
        return (responseOk.data)
    }
}

export default Error;