import { Router } from 'express';
import { usuarioManagerMongo as UsuariosManager } from '../dao/usuarioManagerMongo.js';
import { generaHash } from '../utils.js';

const usuariosManager = new UsuariosManager();

export const router = Router();

router.post('/registro', async (req, res) => {
    let { name, last_name, email, password, web } = req.body;

    if (!name || !last_name || !email || !password) {
        if(web){
            return res.redirect("/registro?error= Complete datos... (Nombre, Apellido, Email y Password)");
        }else{
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: 'Complete datos... (Nombre, Apellido, Email y Password)' });
        }
    }

    let existe;
    try {
        existe = await usuariosManager.getBy({ email });
        if (existe) {
            if(web){
                return res.redirect("/registro?error= Ya existe email");
            }else{
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'Ya existe email' });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Error inesperado en el servidor - Intente más tarde',
            detalle: `payload: ${error.message}`
        });
    }

    password = generaHash(password);

    let nuevoUsuario;

    try {
        if(web){
            return res.redirect("/login?ok= Registro Correctamente. Ahora logueese sin problemas :D");
        }else{

            nuevoUsuario = await usuariosManager.create({ name, last_name, email, password});
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({
                message: "Registro correctamente ...!!! :D",
                nuevoUsuario
            });
        }
    } catch (error) {
        console.log(error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Error inesperado en el servidor - Intente más tarde',
            detalle: `payload: ${error.message}`
        });
    }
});

router.post('/login', async (req, res) => {
    let { email, password, web } = req.body;

    if (!email || !password) {
        if(web){
            return res.redirect("/login?error=Complete datos... (Email y Password)");
        }else{
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: 'Complete datos... (Email y Password)' });
        }
    }

    let usuario;
    try {
        usuario = await usuariosManager.getBy({ email, password:generaHash(password)});
        if(!usuario){
            if(web){
                return res.redirect("/login?error=Credenciales Invalidas o Datos Incorrectos");
            }else{
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: 'Credenciales invalidas' });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: 'Error inesperado en el servidor - Intente más tarde',
            detalle: `payload: ${error.message}`
        });
    }

    usuario = { ...usuario};
    delete usuario.password;
    req.session.usuario = usuario;

    if(web){
        res.redirect("/perfil")
    }else{
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            message: "Login correctamente ...!!! :D",
            usuario
        });
    }
    
});

router.get("/logout", (req, res) => {
    let usuario = req.session.usuario;
    req.session.destroy(error => {
        if(error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde`,
                    detalle: `${error.message}`
                }
            )
        }
    });

    if(usuario){
        return res.redirect("/login?ok=Logout Exitoso, esperamos tu regreso!!!");
    }else{
        return res.redirect("/login?error=No hay Seciones Abiertas");
    }
})