const socket = io();

function addProduct(formulario){
    const mensaje = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    }
    socket.emit("nuevo-producto", mensaje);
    document.getElementById("title").value = ""
    document.getElementById("price").value = ""
    document.getElementById("thumbnail").value = ""
    return false;
}

socket.on('productos', productos=>{
    fetch('./productos.hbs')
    .then((data)=>{
        return data.text();
    })
    .then(plantilla =>{
        const render = Handlebars.compile(plantilla);
        let listExists = false;
        if (productos.length>0){
            listExists=true;
        }
        document.getElementById("vista-productos").innerHTML = render({productos,listExists});
    })
    .catch(e=>{
        console.log(e);
    })
})

function renderMessages(normalizedMsg){
    console.log(normalizedMsg)
    authorSchema = new normalizr.schema.Entity('author');

    mensajesSchema = new normalizr.schema.Entity('chats',{
        author: this.authorSchema
    });
    
    mensajesScheme = new normalizr.schema.Entity('mensajes',{
        mensajes: [ this.mensajesSchema ]
    });

    denormalizedMsg = normalizr.denormalize(normalizedMsg.result, mensajesScheme, normalizedMsg.entities);
    console.log(denormalizedMsg)

    mensajes = denormalizedMsg["mensajes"];

    let html = "<div><ul>"
    mensajes.map((element, index)=>{
        html = html + `<li><strong>${element.author.id}</strong><span style="color:red">[${element.time}]:</span>${element.text}</li>`
    })
    html = html + "</ul></div>"
    document.getElementById("chat").innerHTML = html;

    normalize_len = JSON.stringify(normalizedMsg).length
    denormalize_len = JSON.stringify(denormalizedMsg).length
    porcentaje = ((denormalize_len-normalize_len)/normalize_len)*100;

    let compresion_banner = `<p>Compresion del ${porcentaje} %</p>`
    document.getElementById("compresion").innerHTML = compresion_banner;

}

function sendMessage(formulario){
    const mensaje = {
        author:{
            id: document.getElementById("email").value,
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            edad: document.getElementById("edad").value,
            alias: document.getElementById("alias").value,
            avatar: document.getElementById("avatar").value,
        },
        text: document.getElementById("msg").value
    }
    socket.emit("new-message", mensaje);
    document.getElementById("msg").value = "";
    return false;
}

socket.on('mensajes', mensajes=>{
    const spinner = document.getElementById("spinner");
    spinner.style.display = 'none';
    document.getElementById("chat-btn").disabled = false;
    renderMessages(mensajes);
});

window.onload = function(){
    document.getElementById("chat-btn").disabled = true;
}
