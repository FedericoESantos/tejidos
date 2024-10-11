// paso 1 conectarse a la plataforma stripe
const stripe = Stripe("pk_test_51Q80KVFNLAgPyad8Urp2sF4SbUfSXy0BsEqXROMQoU8m34ELAYP2KdQnOEVebfxr42EZhO80Jk6ZPwP5WEBVkInu00fwmOGUg3");
let elements;

const cargarMedios = async() =>{
    let importe = Number(document.getElementById("importe").value);
    if(importe < 1 || isNaN(importe)){
        alert("error en el importe");
        return
    }

//paso 2 solicitar al back que genere un payment intent
const respuesta = await fetch("/create-payment-intent", {
    method: "post",
    headers: {
        "Content-Type":"application/json"
    },
    body: JSON.stringify({importe})
});

let datos = await respuesta.json();

//generar el elements con los medios de pago para completar

 // Generar el elements con el clientSecret correcto
  elements = stripe.elements({ clientSecret: datos.paymentIntent.client_secret });

  // Crear el elemento de pago y montarlo en el contenedor de tarjetas de pago
  const paymentElement = elements.create("payment");
  paymentElement.mount("#tarjetasDePago");

}

const pagar = async()=>{
    //enviar el metodo de pagos seleccionado a stripe
    const resultado = await stripe.confirmPayment(
       {
        elements,
        confirmParams: {
            return_url: "http://localhost:3000/pagos.html"
        }
       } 
    )

    // esto que sigue solo se ejecuta si existen errores
    console.log(resultado);
    document.getElementById("resultado").textContent = resultado.error.message;
}

// validar si existe el pago en los query params
const mostrarResultado = async(clientSecret)=>{
    // verificar el estado del pago y mostrarlo    
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);    
    console.log(paymentIntent);
    document.getElementById("resultado").textContent = paymentIntent.status;
}

let params = new URLSearchParams(location.search);
let clientsecret = params.get("payment_intent_client_secret");

if(clientsecret){
    mostrarResultado(clientsecret);
}