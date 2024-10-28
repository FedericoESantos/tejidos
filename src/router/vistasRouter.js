import { Router } from 'express';
import { productManagerMongo as Prod } from '../dao/productManagerMongo.js';
import { CarritoManagerMongo as carrito } from '../dao/carritoManagerMongo.js';
import { usuarioManagerMongo as user } from '../dao/usuarioManagerMongo.js';
import { Visitas } from '../dao/models/visitasModelo.js';
import { isValidObjectId } from 'mongoose';
import passport from 'passport';
import { passportCall } from '../utils.js';
import { auth } from '../middleware/auth.js';

let productManager = new Prod();
let cartManager = new carrito();
let userManager = new user();

export const router = Router();

router.get('/', async(req, res) => {

    let login = req.user;
    let ip = req.ip; 

    let visitas = await Visitas.findOne();

    if (!visitas) {
        // Si no existe, crea un nuevo documento de visitas
        visitas = new Visitas({
            contador: 1,
            ipAddresses: [ip]
        });
        await visitas.save();
    } else if (!visitas.ipAddresses.includes(ip)) {
        // Si el IP no está registrado, incrementa el contador y guarda el IP
        visitas.contador++;
        visitas.ipAddresses.push(ip);
        await visitas.save();
    }

    let visitasTexto = `Visitas al Sitio: ${visitas.contador}`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("home", {
        login,
        usuario: req.user,
        visitas: visitasTexto,
        title: "Punto Feliz" 
    });
 });

router.get('/stock', passportCall("jwt"), auth(["admin"]), async(req, res) => {
    let login = req.user;
    let carrito = await cartManager.getBy();
    let { error } = req.query;

    let productos;
    try {
        productos = await productManager.getAll();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("stock", {
        login,
        error,
        carrito,
        usuario: req.user,
        productos,
        title: "Punto Feliz" });
});

router.get('/productos', passport.authenticate("jwt", {session:false}), passportCall("jwt"), auth(["admin","user"]),async(req, res) => {
    let login = req.user;
    let { error } = req.query;
    let carrito = await cartManager.getBy();

    let productos;
        try {
        productos = await productManager.getAll();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("productos", {
        login,
        productos,
        error,
        carrito,
        title: "Punto Feliz"
    });
});

router.get('/carrito/:cid', passport.authenticate("jwt", {session:false}), passportCall("jwt"), auth(["admin","user"]), async(req, res) => {
    let login = req.user;
    let { cid } = req.params;
    let { error, ok } = req.query;

    if (!isValidObjectId(cid)) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "No es un objeto valido de mongoose" });
    }

    let carrito;
    try {
        carrito = await cartManager.getByPopulate({ _id: cid });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("carrito", {
        login,
        ok,
        error,
        carrito,
        usuario: req.user,
        title: "Punto Feliz"
    });
});

router.get('/chat', passport.authenticate("jwt", {session:false}), passportCall("jwt"), auth(["admin","user"]), async(req, res) => {
    let login = req.user;
    let carrito = await cartManager.getBy();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("chat", {
        login,
        carrito,
        usuario: req.user,
        title: "Punto Feliz" });
});

router.get('/usuarios', passportCall("jwt", {session:false}), auth(["admin"]), async(req, res) => {
    let login = req.user;
    let carrito = await cartManager.getBy();
    let { pagina } = req.query;

    if (!pagina) {
        pagina = 1;
    }
    let { docs: usuarios, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = await userManager.getAllPaginate(pagina);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("usuarios", {
        login, 
        usuario: req.user,
        usuarios,
        carrito,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        title: "Punto Feliz"
    });
});

router.get('/registro', async(req, res) => {
    let carrito = await cartManager.getBy();
    let { error } = req.query;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("registro", {
        error,
        carrito,
        title: "Punto Feliz" });
});

router.get('/login', async(req, res) => {
    let carrito = await cartManager.getBy();
    let { error, ok } = req.query;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("login", {
        error,
        ok,
        carrito,
        title: "Punto Feliz" });
});

router.get('/perfil', passportCall("jwt", {session:false}), auth(["user","admin"]), async(req, res) => {
    let login = req.user;
    let { error, ok } = req.query;
    let usuario = req.user._doc;
    let carrito = await cartManager.getBy();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("perfil", {
        error,
        ok,
        carrito,
        usuario,
        login,
        title: "Punto Feliz" });
});

router.get("/contacto", async(req,res)=>{
    let { mensaje, error } = req.query;
    let login = req.user;
    let carrito = await cartManager.getBy();

    res.setHeader(`Content-Type`,`text/html`);
    return res.status(200).render("contacto",{
        usuario: req.user,
        carrito,
        login,
        mensaje,
        error,
        title:"Punto Feliz"});
})

router.get("/empresa", async(req,res)=>{

    res.setHeader(`Content-Type`,`text/html`);
    return res.status(200).render("empresa",{
        title:"Punto Feliz"});
})

router.get("/servicios", async(req,res)=>{

    res.setHeader(`Content-Type`,`text/html`);
    return res.status(200).render("servicios",{
        title:"Punto Feliz"});
})