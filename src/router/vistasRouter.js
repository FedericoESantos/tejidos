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
    if (!req.visitaRegistrada) {
        let visitas = await Visitas.findOne();

        visitas.contador++;
        await visitas.save();

        req.visitaRegistrada = true;
    }

    let visitas = await Visitas.findOne();
    let visitasTexto = `Visitas al Sitio: ${visitas.contador}`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("home", { 
        login,
        usuario: req.user,
        visitas: visitasTexto,
        title: "Punto Feliz" });
});

router.get('/stock', passportCall("jwt"), auth(["admin"]), async(req, res) => {
    let login = req.user;

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
        usuario: req.user,
        productos,
        title: "Punto Feliz" });
});

router.get('/productos', passport.authenticate("jwt", {session:false}), passportCall("jwt"), auth(["admin","user"]),async(req, res) => {
    let login = req.user;    
    let { error } = req.query;

    let carrito = {
        _id: req.user._doc.carrito
    }
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
        usuario: req.user,
        productos,
        error,
        carrito,
        title: "Punto Feliz"
    });
});

router.get('/carrito/:cid', passport.authenticate("jwt", {session:false}), passportCall("jwt"), auth(["admin","user"]), async(req, res) => {
    let login = req.user;
    let { cid } = req.params;

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

router.get('/usuarios', passportCall("jwt"), auth(["admin"]), async(req, res) => {

    let { pagina } = req.query;

    if (!pagina) {
        pagina = 1;
    }
    let { docs: usuarios, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = await userManager.getAllPaginate(pagina);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("usuarios", {
        usuario: req.user,
        usuarios,
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

router.get('/perfil', passportCall("jwt"), auth(["user","admin"]), async(req, res) => {
    let login = req.user;
    let usuario = req.user._doc;
    let { error } = req.query;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("perfil", { 
        error, 
        usuario,
        login,
        title: "Punto Feliz" });
});

router.get("/contacto", async(req,res)=>{
    let { mensaje, error } = req.query;

    res.setHeader(`Content-Type`,`text/html`);
    return res.status(200).render("contacto",{mensaje, error, title:"Punto Feliz"});
})

