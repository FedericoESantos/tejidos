import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { CarritoManagerMongo as carrito } from '../dao/carritoManagerMongo.js';
import { productManagerMongo as prod } from '../dao/productManagerMongo.js';

export const router = Router();

const carritoManager = new carrito();
const productManager = new prod();


router.post('/:cid/product/:pid', async (req, res) => {

    let { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: " Ingrese CID  PID validos" });
    }

    let carrito;
    try {
        carrito = await carritoManager.getBy({ _id: cid });
        if (!carrito) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: "Carrito inexistente " });
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }

    let producto;
    try {
        producto = await productManager.getBy({ _id: pid });
        if (!producto) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: "Producto inexistente " });
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `payload: ${error.message}`
            }
        )
    }

    let indiceProducto = carrito.productos.findIndex(prod => prod.producto == pid);
    if (indiceProducto === -1) {
        carrito.productos.push({
            producto: pid,
            cantidad: 1
        });
    } else {
        carrito.productos[indiceProducto].cantidad++;
    }

    let resultado = await carritoManager.update(cid, carrito);
    if (resultado.modifiedCount > 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "carrito actualizado", carrito });
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde`,
                detalle: `No se pudo realizar la actualizacion`
            }
        )
    }

});