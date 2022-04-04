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
        this.nav = document.querySelector('.navbar');
        this.spinner = document.getElementById("spinner");
        this.hideSpinner();
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
        this.render('./views/productos-cards.hbs', { productos, listExists } , 'vista-productos')
    }


    hideForm(){
        this.vista_formulario.style.display = 'none';
        this.nav.scrollIntoView();
    }

    getEditingID(){
        return this.editing_product_id;
    }

    showSpinner(){
        this.spinner.style.display = 'block';
    }

    hideSpinner(){
        this.spinner.style.display = 'none';
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

function AddProductIntoCart(btn){

    dom.showSpinner();

    fetch('productos', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({product_id: btn.id})
    })
    .then(response =>{
        if (response.redirected) {
            dom.hideSpinner();
            window.location.href = response.url;
        }
    })
    .catch(err =>{
        console.log(err)
    })    
}





