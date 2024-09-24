import { Router } from 'express';
import { usuarioManagerMongo as UsuariosManager } from '../dao/usuarioManagerMongo.js';
import { isValidObjectId } from 'mongoose';
import { generaHash } from '../utils.js';

export const router = Router();

const usuariosManager = new UsuariosManager();

router.get('/', async (req, res) => {
    let usuarios;
    try {
        usuarios = await usuariosManager.getAll();
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ usuarios });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }
});

router.get('/:id', async (req, res) => {
    let { id } = req.params;
    if(!isValidObjectId){
        res.setHeader(`Content-Type`,`application/json`);
        return res.status(400).json({error: "Ingrese un ID valido de mongoose"});
    }
    let usuario;
    try {
        usuario = await usuariosManager.getBy({_id:id});
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ usuario });
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }
});

router.post('/', async (req, res) => {
    let { name, last_name, email, password } = req.body;
    if (!name || !last_name || !email || !password) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "Error: Faltan datos. Complete con nombre, email y password." });
    }

    let existe;
    try {
        existe = await usuariosManager.getByName(name);
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `${error.message}`
            }
        )
    }

    let nuevoUsuario;
    try {
        nuevoUsuario = usuariosManager.create({ name, last_name, email, password: generaHash(password) });
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ nuevoUsuario });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }
});

router.put('/:id', async (req, res) => {
    let { id } = req.params;
    if (!isValidObjectId) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "Ingrese un id valido de mongoose" });
    }

    let aModificiar = req.body;

    if (aModificiar) {
        delete aModificiar.id
    };

    if (aModificiar.email) {
        let existe;
        try {
            existe = await usuariosManager.getBy({ _id: { $ne: id }, email: aModificiar.email });
            if (existe) {
                res.setHeader(`Content-Type`, `application/json`);
                return res.status(400).json({ error: "Ya existe otro usuario en base de datos con ese email" });
            }
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde`,
                    detalle: `payload: ${error.message}`
                }
            )
        }
    }

    if(aModificiar.password){
        aModificiar.password = generaHash(aModificiar.password);
    }   

    let usuarioModificado;
    try {
        usuarioModificado = await usuariosManager.update(id, aModificiar);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ usuarioModificado });

    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }
});

router.delete('/:id', async (req, res) => {
    let { id } = req.params;
    if (!isValidObjectId) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "Ingrese un id valido de mongoose" });
    }

    let resultado;

    try {
        resultado = await usuariosManager.delete(id);
        if (resultado.deletedCount > 0) {
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(200).json({payload: `Usuario con ID ${id} eliminado`});
        }else{
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(400).json({error:`No existe usuarios con ID ${id}`});
        }
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }




});

