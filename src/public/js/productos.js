const comprar = async (pid) => {
    let inputCarrito = document.getElementById("carrito");
    let cid = inputCarrito.value;

    console.log(`Codigo producto ${pid}, codigo carrito ${cid}`);

    try {
        let respuesta = await fetch(`/api/carts/${cid}/product/${pid}`, {
            method: "POST"
        });

        if (respuesta.ok) {
            let datos = await respuesta.json();
            console.log(datos);
            alert("Producto Agregado!!!...:D");
        } else {
            let datos = await respuesta.json();
            alert(datos.error);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Hubo un problema con la conexión. Inténtalo más tarde.');
    }
}
