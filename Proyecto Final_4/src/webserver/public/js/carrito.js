hideSpinner();
$("#alertok").hide();
$("#alerterror").hide();

function showSpinner(){
  $('#spinner').show();
}

function hideSpinner(){
  $('#spinner').hide();
}

function removeCard(id){
  $('#' + id).remove();
}

function goShopping(formulario){
    window.location.href = "/productos";
}

async function buy(formulario){
  try {
    // Mostrar el Spinner
    showSpinner();

    // Enviar consulta al WebServer
    const rawResponse = await fetch(`/carrito/buy`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    // Ocultar el Spinner
    hideSpinner();

    // Mostrar Notificacion
    if ('error' in rawResponse){

      // Mostrar Alert de Compra Error!
      $("#alerterror").show();
      $('body').scrollTop('#alerterror');

      // Borrar informacion del carrito
      $('#carritoproduct').html('<h1>Se ha producido un error!</h1>')
      
      // Deshabilitar boton de compra
      $('#btnBuy').prop('disabled', false);
      
    }else{

      // Mostrar Alert de Compra OK!
      $("#alertok").show();
      $('body').scrollTop('#alertok');

      // Borrar informacion del carrito
      $('#carritoproduct').html('<h1>Compra efectuada!</h1>')
      
      // Deshabilitar boton de compra
      $('#btnBuy').prop('disabled', true);
    }

  } catch (error) {
    console.log(error)
  }
}

async function deleteProducto(btn){
  try {
    showSpinner();
    const rawResponse = await fetch(`/carrito/${btn.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
      
    removeCard(btn.id);
    hideSpinner();
    
  } catch (error) {
    console.log(error)
  }

}