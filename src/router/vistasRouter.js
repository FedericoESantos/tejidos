import { Router } from 'express';
import { productManager as Prod } from '../dao/productManager.js';

let productManager = new Prod();

export const router = Router();

router.get('/', (req, res) => {

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("home", { title: "Punto Feliz" });
});

router.get('/stock', (req, res) => {
    let productos; 
    try {
        productos = productManager.getAll(); 
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`${error.message}`});
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("stock", { productos, title: "Punto Feliz" });
});

router.get('/productos', (req, res) => {
    let productos; 
    try {
        productos = productManager.getAll(); 
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`${error.message}`});
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("productos", { productos, title: "Punto Feliz" });
});

router.get('/chat', (req, res) => {

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("chat", { title: "Punto Feliz" });
});