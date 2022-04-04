window.onload = function(){
    Promise.all([
        fetch('./productos.hbs').then(value => value.text()),
        fetch('./api/productos-test').then(value => value.json())
    ]).then(([plantilla, productos]) => {
        const render = Handlebars.compile(plantilla);
        let listExists = false;
        if (productos.length>0){
            listExists=true;
        }
        document.getElementById("vista-productos").innerHTML = render({productos,listExists});
    }).catch((err) => {
        console.log(err);
    });
}
