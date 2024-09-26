import { Router } from 'express';
import { productManagerMongo as Prod } from '../dao/productManagerMongo.js';
import { CarritoManagerMongo as carrito } from '../dao/carritoManagerMongo.js';
import { usuarioManagerMongo as user } from '../dao/usuarioManagerMongo.js';
import { auth } from '../middleware/auth.js';
import { Visitas } from '../dao/models/visitasModelo.js';

let productManager = new Prod();
let cartManager = new carrito();
let userManager = new user();


export const router = Router();

router.get('/', async (req, res) => {
    let carrito = await cartManager.getBy();

    if (!req.session.visitaRegistrada) {
        let visitas = await Visitas.findOne();

        visitas.contador++;
        await visitas.save(); 

        req.session.visitaRegistrada = true;
    }

    let visitas = await Visitas.findOne();
    let visitasTexto = `Visitas al Sitio: ${visitas.contador}`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("home", { visitas: visitasTexto, carrito, title: "Punto Feliz" });
});

router.get('/stock', async (req, res) => {
    let carrito = await cartManager.getBy();
    let productos;
    try {
        productos = await productManager.getAll();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("stock", { carrito, productos, title: "Punto Feliz" });
});

router.get('/productos', auth, async (req, res) => {
    let { error } = req.query;
    let carrito = await cartManager.getBy();
    if(!carrito) {
        carrito = await cartManager.create();
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
        productos,
        error,
        carrito,
        title: "Punto Feliz" });
});

router.get('/carrito/:cid', async (req, res) => {
    let { cid } = req.params;

    let carrito;
    try {
        carrito = await cartManager.getByPopulate({ _id: cid });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` });
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("carrito", { carrito, title: "Punto Feliz" });
});

router.get('/chat', auth, async (req, res) => {
    let carrito = await cartManager.getBy();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("chat", { carrito, title: "Punto Feliz" });
});

router.get('/usuarios', async (req, res) => {
    let carrito = await cartManager.getBy();

    let { pagina } = req.query;
    if (!pagina) {
        pagina = 1;
    }
    let { docs: usuarios, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = await userManager.getAllPaginate(pagina);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("usuarios", {
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

router.get('/registro', async (req, res) => {
    let carrito = await cartManager.getBy();
    let { error } = req.query; 
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("registro", { error, carrito, title: "Punto Feliz" });
});

router.get('/login', async (req, res) => {
    let carrito = await cartManager.getBy();
    let { error, ok } = req.query;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("login", { error, ok, carrito, title: "Punto Feliz" });
});

router.get('/perfil',auth, async(req, res) => {
    let carrito = await cartManager.getBy();
    let usuario = req.session.usuario;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("perfil", { usuario, carrito, title: "Punto Feliz" });
});

