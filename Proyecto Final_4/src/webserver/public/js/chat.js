const socket = io();

function renderMessages(mensajes){
    const spinner = document.getElementById("spinner");
    spinner.style.display = 'none';
    document.getElementById("chat-btn").disabled = false;   
    let html = "<div><ul>"
    mensajes.map((element, index)=>{
        if (element.type == 'sistema'){
            html = html + `<li><strong>MarketPlace</strong><span style="color:red">[${element.date}]:</span>${element.msg}</li>`
        }else{
            html = html + `<li><strong>${element.username}</strong><span style="color:red">[${element.date}]:</span>${element.msg}</li>`
        }        
    })
    html = html + "</ul></div>"
    document.getElementById("chat").innerHTML = html;
}

function sendMessage(formulario){
    // Armo el mensajeDTO
    const mensaje = {
        msg: document.getElementById("msg").value
    }

    // Send by Socket
    const destination = document.getElementById("email");
    console.log(destination)

    if (destination){
        mensaje.destination = destination.value;
        socket.emit("message_to_client", mensaje);
        console.log('mensaje enviado!', mensaje)
    }else{        
        socket.emit("message_to_admin", mensaje);
        console.log('mensaje enviado!',mensaje)
    }

    // Limpiar InputBox
    document.getElementById("msg").value = "";
    return false;
}

socket.on('login', data=>{
    window.location.href = '/login';
})

window.onload = function(){
    document.getElementById("chat-btn").disabled = true;

    const destination = document.getElementById("email");
    if (destination){
        // Eventos del Admin
        socket.on('message_to_admin', mensajes=>{ 
            renderMessages(mensajes);
        });
    }else{
        // Eventos del Cliente
        socket.on('message_to_client', mensajes=>{
            renderMessages(mensajes);
        });
    }

}
