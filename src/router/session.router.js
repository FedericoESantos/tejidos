import { Router } from 'express';
import { usuarioManagerMongo as UsuariosManager } from '../dao/usuarioManagerMongo.js';
import { CarritoManagerMongo as CarritoManager } from '../dao/carritoManagerMongo.js';
import { secret } from '../utils.js';
import jwt from "jsonwebtoken";
import passport from 'passport';

const usuariosManager = new UsuariosManager();
const carritoManager = new CarritoManager();

export const router = Router();

router.get("/error", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(
        {
            error: `Error inesperado en el servidor - Intente más tarde`,
            detalle: `Fallo al autenticar...!!!`
        }
    )
})

router.post('/registro', passport.authenticate("registro", {  session: false, failureRedirect: ("/api/session/error") }), async (req, res) => {
    
    res.setHeader(`Content-Type`, `application/json`);
    return res.status(200).json({ payload: "registro exitoso" });

});

router.post('/login', passport.authenticate("login", {  session: false, failureRedirect: "/api/session/error" }), async (req, res) => {
    let { web } = req.body;

    let usuario = { ...req.user };
    delete usuario.password;

    let token = jwt.sign({ ...usuario, carrito: usuario._doc.carrito }, secret, { expiresIn: "1h" });

    res.cookie('fedeCookie', token, { httpOnly: true, secure: true });

    if (web) {
        res.redirect("/perfil")
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            message: "Login correctamente ...!!! :D",
            usuarioLogueado: usuario,
            token
        });
    }

});

router.get("/logout", (req, res) => {
    res.clearCookie("fedeCookie");
    return res.redirect("/login?ok=Logout Exitoso, esperamos tu regreso!!!");
})