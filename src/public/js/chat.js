Swal.fire({
    title:"Identifiquese",
    input:"text",
    text:"Ingrese su nickname",
    inputValidator: (value)=>{
        return !value && "Debe ingresar un nombre...!!!"
    },
    allowOutsideClick: false
}).then(datos =>{
    let nombre = datos.value;
    document.title = nombre;

    let inputMensaje = document.getElementById("mensaje");
    let divMensajes = document.getElementById("mensajes");
    inputMensaje.focus();

    const socket = io();
    
    socket.emit("id", nombre)

    socket.on("nuevoUsuario", nombre=>{
        Swal.fire({
            text:`${nombre} se ha conectado ... :D`,
            toast:true,
            position: "top-right"
        })
    })

    socket.on("mensajesPrevios", mensajes=>{
        mensajes.forEach(mens => {
            divMensajes.innerHTML += `<span class="mensaje"> <strong>${mens.nombre}<strong> dice <i>${mens.mensaje}</i></span><br>`
            divMensajes.scrollTop = divMensajes.scrollHeight;
        });
    })

    socket.on("saleUsuario", nombre =>{
        divMensajes.innerHTML += `<span class="mensaje"> <strong>${nombre}<strong> <i> ha salido del chat </i></span><br>`
        divMensajes.scrollTop = divMensajes.scrollHeight;
    })

    inputMensaje.addEventListener("keyup", evento =>{
        evento.preventDefault();
        if(evento.code === "Enter" && evento.target.value.trim().length > 0){
            socket.emit("mensaje", nombre, evento.target.value.trim()); 
            evento.target.value = "";
            evento.target.focus();
        }        
    })

    socket.on("nuevoMensaje", (nombre, mensaje)=>{
        divMensajes.innerHTML += `<span class="mensaje"> <strong>${nombre}<strong> dice <i>${mensaje}</i></span><br>`
        divMensajes.scrollTop = divMensajes.scrollHeight;
    })



})





