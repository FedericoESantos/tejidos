import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';

import { router as vistasRouter } from './router/vistasRouter.js';
import { router as productRouter } from './router/productRouter.js';

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

app.use("/api/products",(req,res,next)=>{
    req.io = io;    
    
    next();
} ,productRouter);
app.use("/", vistasRouter);

const serverHTP = app.listen(port, ()=>{
console.log(`Server escuchando en puerto ${port}`);
});

io = new Server(serverHTP);

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