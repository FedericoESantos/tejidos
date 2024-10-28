Swal.fire({
    title: "Identifiquese",
    input: "text",
    text: "Ingrese su nickname",
    inputValidator: (value) => {
        return !value && "Debe ingresar un nombre...!!!";
    },
    allowOutsideClick: false
}).then(datos => {
    let nombre = datos.value;
    document.title = nombre;

    let inputMensaje = document.getElementById("mensaje");
    let divMensajes = document.getElementById("mensajes");
    let botonEnviar = document.getElementById("enviarMensaje"); // Botón de enviar
    inputMensaje.focus();

    const socket = io();
    
    socket.emit("id", nombre);

    socket.on("nuevoUsuario", nombre => {
        Swal.fire({
            text: `${nombre} se ha conectado ... :D`,
            toast: true,
            position: "top-right"
        });
    });

    socket.on("mensajesPrevios", mensajes => {
        mensajes.forEach(mens => {
            divMensajes.innerHTML += `<span class="mensaje"> <strong>${mens.nombre}</strong> dice <i>${mens.mensaje}</i></span><br>`;
            divMensajes.scrollTop = divMensajes.scrollHeight;
        });
    });

    socket.on("saleUsuario", nombre => {
        divMensajes.innerHTML += `<span class="mensaje"> <strong>${nombre}</strong> <i> ha salido del chat </i></span><br>`;
        divMensajes.scrollTop = divMensajes.scrollHeight;
    });

    // Evento para enviar mensaje con tecla Enter
    inputMensaje.addEventListener("keyup", evento => {
        if (evento.key === "Enter" && inputMensaje.value.trim().length > 0) {
            enviarMensaje(nombre, inputMensaje, socket); // Llama a la función enviarMensaje
        }
    });

    // Evento para enviar mensaje con el botón de envío
    botonEnviar.addEventListener("click", () => {
        if (inputMensaje.value.trim().length > 0) {
            enviarMensaje(nombre, inputMensaje, socket); // Llama a la función enviarMensaje
        }
    });

    // Escucha nuevos mensajes del servidor
    socket.on("nuevoMensaje", (nombre, mensaje) => {
        divMensajes.innerHTML += `<span class="mensaje"> <strong>${nombre}</strong> dice <i>${mensaje}</i></span><br>`;
        divMensajes.scrollTop = divMensajes.scrollHeight;
    });
});

// Función para enviar mensaje
function enviarMensaje(nombre, inputMensaje, socket) {
    socket.emit("mensaje", nombre, inputMensaje.value.trim());
    inputMensaje.value = "";
    inputMensaje.focus();
}
