import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Visitas } from './dao/models/visitasModelo.js';

import { router as vistasRouter } from './router/vistasRouter.js';
import { router as productRouter } from './router/productRouter.js';
import { router as carritoRouter } from './router/cartRouter.js';
import { router as usuariosRouter } from './router/usuariosRouter.js';
import { router as sessionRouter} from './router/session.router.js';

const port = 3000;
const app = express();

let io;
let usuarios = [];
let mensajes = [];

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', ('./src/views'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static('./src/public'));
app.use(cookieParser());
app.use(session({
    secret: "Fede123",
    resave: true,
    saveUninitialized: true
}));

app.use("/api/carts", carritoRouter);
app.use("/api/products",(req,res,next)=>{
    req.io = io;    
    
    next();
} ,productRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/session", sessionRouter);
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

async function inicializarVisitas() {
    let visitas = await Visitas.findOne();
    if (!visitas) {
        visitas = new Visitas({ contador: 0 });
        await visitas.save();
    }
}

inicializarVisitas();