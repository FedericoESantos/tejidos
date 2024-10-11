const mp = new MercadoPago("APP_USR-b352d7db-44fe-4d76-af3c-494634d782b5");
const bricksBuilder = mp.bricks();
let inputImporte = document.getElementById("importe");

const cargarMedios = async () => {
    let importe = inputImporte.value;
    if (!importe || importe <= 0) {
        alert("Plis, Complete importe a pagar!");
        return;
    }


    const respuesta = await fetch("/pagar", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ importe })
    })

    let datos = await respuesta.json();
    console.log(datos);

    mp.bricks().create("wallet", "tarjetasDePago", {
        initialization: {
            preferenceId: datos.id,
        },
        customization: {
            texts: {
                valuePropo: "smart-option"
            }
        },
        Callbacks: {
            onError: error => console.log(error.message),
            onReady: () => {

            }
        }
    })
}