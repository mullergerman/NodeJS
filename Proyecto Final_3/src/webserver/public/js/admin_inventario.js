class Observable {
    constructor() {
        this.observers = [];
    }

    subscribe(func) {
        this.observers.push(func);
    }

    unsubscribe(func) {
        this.observers = this.observers.filter(observer => observer !== func);
    }

    notify(data) {
        this.observers.forEach(observer => observer(data));
    }
}

class Productos{
    constructor(){
        this.productos = [];    
    }

    update(productos){
        this.productos = productos;
    }

    getById(id){
        const producto = this.productos.filter((element)=>{
            return element.id == id;
        })
        return producto[0];
    }
}

class DOM{

    constructor(){
        this.editing_product_id = null;
        this.vista_formulario = document.getElementById("vista-formulario");
        this.btn_formulario = document.getElementById("btn-formulario");
        this.nav = document.querySelector('.navbar');
        this.vista_formulario.style.display = 'none';
    }

    render(plantilla, data, dom){
        fetch(plantilla)
        .then((data)=>{
            return data.text();
        })
        .then(plantilla =>{
            const render = Handlebars.compile(plantilla);
            document.getElementById(dom).innerHTML = render(data);
        })
        .catch(e=>{
            console.log(e);
        })
    }

    refreshInventario(productos){
        let listExists = false;
        if (productos.length>0){
            listExists=true;
        }
        this.render('./views/productos-inventario-cards.hbs', { productos, listExists } , 'vista-productos')
    }

    showFormNew(){
        document.getElementById("nombre").value = ""
        document.getElementById("descripcion").value = ""
        document.getElementById("codigo").value = ""
        document.getElementById("precio").value = ""
        document.getElementById("stock").value = ""
        document.getElementById("foto").value = ""

        this.vista_formulario.style.display = 'inherit';
        this.vista_formulario.scrollIntoView();

        this.editing_product_id = null;
    }

    showFormEdit(btn){
        const product = db.getById(btn.id);
        document.getElementById("nombre").value = product.nombre;
        document.getElementById("descripcion").value = product.descripcion;
        document.getElementById("codigo").value = product.codigo;
        document.getElementById("precio").value = product.precio;
        document.getElementById("stock").value = product.stock;
        document.getElementById("foto").value = product.foto;
    
        this.vista_formulario.style.display = 'inherit';
        this.btn_formulario.textContent = "Editar";
        this.vista_formulario.scrollIntoView();

        this.editing_product_id = product.id;
    }

    hideForm(){
        this.vista_formulario.style.display = 'none';
        this.nav.scrollIntoView();
    }

    getEditingID(){
        return this.editing_product_id;
    }

}

const socket = io();
const observable = new Observable();
const db = new Productos()
const dom = new DOM();

observable.subscribe((data)=>{
    db.update(data)
})

observable.subscribe((data)=>{
    dom.refreshInventario(data)
})

window.onload = ()=>{
    socket.on('productos', (productos)=>{
        observable.notify(productos)
    })
}

function newProduct(formulario){
    dom.showFormNew();
}

function editProducto(btn){
    dom.showFormEdit(btn);
}

function cancelBtn(btn){
    dom.hideForm();
}

function addProduct(formulario){
    let mensaje = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        codigo: document.getElementById("codigo").value,
        precio: document.getElementById("precio").value,
        stock: document.getElementById("stock").value,
        foto: document.getElementById("foto").value        
    }

    if (!dom.getEditingID()){
        socket.emit("nuevo-producto", mensaje); 
    }else{
        mensaje.id = dom.getEditingID();
        socket.emit("update-producto", mensaje);
    }

    dom.hideForm();
    return false;
}

function deleteProducto(btn){
    socket.emit("remove-producto", btn.id)
}



