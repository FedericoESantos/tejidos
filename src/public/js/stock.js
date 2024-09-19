const socket = io();

let ulProductos = document.getElementById("productos");

socket.on("nuevoProd", producto=>{
    ulProductos.innerHTML += `<li>${producto}</li>`;
})

socket.on("productoBorrado", producto =>{
    ulProductos.innerHTML = "";
    producto.forEach(prod => {
        ulProductos.innerHTML += `<li>${prod.name}</li>`;
    });
})