import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { initPassport } from './config/passportConfig.js';
import passport from 'passport';
import cors from 'cors';
import stripe from 'stripe'; // libreria para cobros en dolares
import { MercadoPagoConfig } from "mercadopago";

import { router as vistasRouter } from './router/vistasRouter.js';
import { router as productRouter } from './router/productRouter.js';
import { router as carritoRouter } from './router/cartRouter.js';
import { router as usuariosRouter } from './router/usuariosRouter.js';
import { router as sessionRouter } from './router/session.router.js';
import { router as mensajesRouter } from './router/mensajesRouter.js';

const port = 3000;
const app = express();

//pasarela de pago con cobro en dolares
//const stripeInstance = stripe("sk_test_51Q80KVFNLAgPyad8SPH0ftdQjBepCZ1hc3CJo6HFrEEpQQlyvObPsqPBmDx5tTZrAGpsjmLhSxNP3OY83QsuStRD00MFTWmMWt");

export const client = new MercadoPagoConfig({
    accessToken: "APP_USR-5938451581096435-100920-7d216ebd8664920957063960aeb0572a-2029664870",
    locale: "es-AR"
}) //el token es la clave privada de la cuenta de prueba vendedora

let io;
let usuarios = [];
let mensajes = [];

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', ('./src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(express.static('./src/public/'));

initPassport();
app.use(passport.initialize());

app.use("/api/carts", carritoRouter);
app.use("/api/products", (req, res, next) => {
    req.io = io;

    next();
}, productRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/session", sessionRouter);
app.use("/api/mensajes", mensajesRouter);
app.use("/", vistasRouter);

// CONFIGURACION PARA PASARELA DE PAGO EN DOLARES
// app.post("/create-payment-intent", async (req, res) => {

//     let { importe } = req.body;
//     // validar redondear numero decimal y multiplicarlo por 100

//     const paymentIntent = await stripeInstance.paymentIntents.create(
//         {
//             amount: importe * 100,
//             currency: "usd"
//         }
//     );

//     res.setHeader(`Content-Type`, `application/json`);
//     return res.status(200).json({ paymentIntent });
// })

// app.post("/pagar", async (req, res) => {
//     let { importe } = req.body;

//     importe = Number(importe);
//     if (isNaN(importe)) {
//         res.setHeader(`Content-Type`, `application/json`);
//         return res.status(400).json({ error: "Error en el importe" });
//     }

//     const preference = new Preference(client);

//     try {
//         let resultado = await preference.create({
//             body: {
//                 items: [
//                     {
//                         id: "001",
//                         title: "Mi Producto",
//                         quantity: 1,
//                         unit_price: importe
//                     }
//                 ],
//                 back_urls: {
//                     success: "http://localhost:3000/success",
//                     pending: "http://localhost:3000/pending",
//                     failure: "http://localhost:3000/failure"
//                 },
//                 auto_return: "approved"
//             }
//         });

//         res.setHeader(`Content-Type`, `application/json`);
//         return res.status(200).json({
//             id: resultado.id
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error al crear la preferencia de pago' });  // Devuelve JSON en caso de error
//     }

// });

/// Respuestas de MP
app.get('/success', (req, res) => {
    console.log(req.query); // Esto te permitirá ver el detalle de la transacción
    return res.redirect("/perfil?ok=Pago Exitoso!!! ...Muchas Gracias por tu compra!");
});

app.get('/failure', (req, res) => {
    console.log(req.query); 
    return res.redirect("/perfil?error=Pago Fallido!!! Error en el pago!");
});

app.get('/pending', (req, res) => {
    console.log(req.query); 
    return res.redirect("/perfil?error=Pago Pendiente de ser aprobado!!!");
});

const serverHTP = app.listen(port, () => {
    console.log(`Server escuchando en puerto ${port}`);
});

io = new Server(serverHTP);

const connDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://punto-feliz:chamu1979@cluster0.2ubgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            {
                dbName: "punto-feliz"
            }
        )
        console.log('DB Online ... conectado a base de datos :D');
    } catch (error) {
        console.log('Error al conectar a base de datos', error.menssage);
    }
}

connDB();

io.on("connection", socket => {
    //console.log(`Se ha conectado un cliente con id ${socket.id}`);

    socket.on("id", nombre => {
        usuarios.push({ id: socket.id, nombre });
        socket.emit("mensajesPrevios", mensajes);
        socket.broadcast.emit("nuevoUsuario", nombre);
    })

    socket.on("mensaje", (nombre, mensaje) => {
        mensajes.push({ nombre, mensaje });
        io.emit("nuevoMensaje", nombre, mensaje);
    })

    socket.on("disconnect", () => {
        let usuario = usuarios.find(us => us.id === socket.id);
        if (usuario) {
            io.emit("saleUsuario", usuario.nombre);
        }
    })
})
