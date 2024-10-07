import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { initPassport } from './config/passportConfig.js';
import passport from 'passport';
import cors from 'cors';
import path from 'path';

import { router as vistasRouter } from './router/vistasRouter.js';
import { router as productRouter } from './router/productRouter.js';
import { router as carritoRouter } from './router/cartRouter.js';
import { router as usuariosRouter } from './router/usuariosRouter.js';
import { router as sessionRouter} from './router/session.router.js';
import { router as mensajesRouter} from './router/mensajesRouter.js';

const port = 3000;
const app = express();

let io;
let usuarios = [];
let mensajes = [];

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join('./src/views'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join('./src/public')));

initPassport();
app.use(passport.initialize());

app.use("/api/carts", carritoRouter);
app.use("/api/products",(req,res,next)=>{
    req.io = io;

    next();
} ,productRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/session", sessionRouter);
app.use("/api/mensajes", mensajesRouter);
app.use("/", vistasRouter);

const serverHTP = app.listen(port, ()=>{
console.log(`Server escuchando en puerto ${port}`);
});

io = new Server(serverHTP);

const connDB = async()=>{
    try {
        await mongoose.connect(
            "mongodb+srv://punto-feliz:chamu1979@cluster0.2ubgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
            {
                dbName:"punto-feliz"
            }
        )
        console.log('DB Online ... conectado a base de datos :D');
         } catch (error) {
        console.log('Error al conectar a base de datos', error.menssage);
    }
}

connDB();

io.on("connection", socket=>{
    console.log(`Se ha conectado un cliente con id ${socket.id}`);

    socket.on("id", nombre=>{
        usuarios.push({id:socket.id, nombre});
        socket.emit("mensajesPrevios", mensajes);
        socket.broadcast.emit("nuevoUsuario", nombre);
    })

    socket.on("mensaje", (nombre, mensaje)=>{
        mensajes.push({nombre, mensaje});
        io.emit("nuevoMensaje", nombre, mensaje);
    })

    socket.on("disconnect", ()=>{
        let usuario = usuarios.find(us=>us.id === socket.id);
        if(usuario){
            io.emit("saleUsuario", usuario.nombre);
        }
    })
})
