import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { CarritoManagerMongo as carrito } from '../dao/carritoManagerMongo.js';
import { productManagerMongo as prod } from '../dao/productManagerMongo.js';
import { auth } from '../middleware/auth.js';
import { ticketManagerFS as TicketManager } from '../dao/ticketManager.js';
import { passportCall } from '../utils.js';
import { client } from '../app.js';

import pkg from 'mercadopago';
const { Preference } = pkg;

export const router = Router();

const carritoManager = new carrito();
const productManager = new prod();
const ticketManager = new TicketManager();

let conStock = [];
let sinStock = [];
let total = 0;
let subtotal = 0;
let ticket= {};

router.get("/:cid", async (req, res) => {
    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "Ingrese cid valido" });
    }

    let carrito = await carritoManager.getByPopulate({ _id: cid });
    if (!carrito) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: `Carrito con ID ${cid} inexistente` });
    }

    res.setHeader(`Content-Type`, `application/json`);
    return res.status(200).json({ carrito });

})

router.get("/:cid/comprar", passportCall("jwt"), auth(["admin", "user"]), async (req, res) => {
    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: "Ingrese cid valido" });
    }

    let carrito = await carritoManager.getBy({ _id: cid });
    if (!carrito) {
        return res.status(400).json({ error: `Carrito con ID ${cid} inexistente` });
    }

    if (carrito.productos.length === 0) {
        return res.redirect(`/carrito/${cid}?error=El carrito no tiene items ... Todavía!!! :D`);
    }

    // let conStock = [];
    // let sinStock = [];
    // let total = 0;
    // let subtotal = 0;

    for (let i = 0; i < carrito.productos.length; i++) {
        let id = carrito.productos[i].producto;
        let cantidad = carrito.productos[i].cantidad;
        let producto = await productManager.getBy({ _id: id });

        if (!producto || producto.stock < cantidad) {
            sinStock.push(carrito.productos[i]);
        } else {
            let subtotalItem = cantidad * producto.price;
            conStock.push({
                id,
                descripcion: producto.description,
                precio: producto.price,
                stockPrevioCompra: producto.stock,
                stockPostCompra: producto.stock - cantidad,
                cantidad,
                subtotal: subtotalItem
            });
            total += subtotalItem;
            subtotal += subtotalItem;
            producto.stock -= cantidad;
            await productManager.update(id, producto);
        }
    }

    let productosFinales = carrito.productos.filter(prod => {
        let producto = productManager.getBy({ _id: prod.producto });
        return producto && producto.stock >= prod.cantidad;
    });

    carrito.productos = productosFinales;
    await carritoManager.update(cid, carrito);

    if (conStock.length === 0) {
        return res.redirect(`/carrito/${cid}?error=No existen items en condiciones de ser comprados`);
    }

    let nroComp = await ticketManager.obtenerNroComprobante();
    let fecha = new Date();
    let comprador = req.user?._doc.email;

    ticket = await ticketManager.crearTicketLocal({
        nroComp,
        fecha,
        comprador,
        conStock,
        total
    });

    // console.log(conStock);

    // let message = `
    //         Hola ${req.user?._doc.name || ""} <br>
    //         Ha registrado una compra con n° de ticket ${nroComp}, por un importe de $${total} <br>
    //         Detalle: <br>
    //         ${JSON.stringify(conStock)} <br>
    //         ${sinStock.length > 0 ? `Algunos items no pudieron comprarse... Por favor consulte` : ``} <br>
    //         Por favor contacte a: <a href="mailto:boomarts47@gmail.com"> Cobranzas </a> para finalizar la operación. <br>
    //         <hr>
    //         Muchas gracias por tu compra!!! <br>
    //         Saludos cordiales! <br>
    //         <hr>
    //         Punto Feliz - Tejidos
    //     `;

    //await enviarMail(comprador, "Tu compra está a un paso de concretarse", message);

    total = ticket.nroComprobante.total;
    
    //console.log("el total es",total);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).render("tickets", {
        title: "Punto Feliz",
        carrito,
        ticket,
        total
    });

});

router.post("/pagar", async (req, res) => {
    let { importe } = req.body;

    //console.log("El total del ticket es:", total);
    
    importe = Number(importe);
    if (isNaN(importe)) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(400).json({ error: "Error en el importe" });
    }

    const preference = new Preference(client);

    try {
        let resultado = await preference.create({
            body: {
                items: [
                    {
                        id: "001",
                        title: "Mi Producto",
                        quantity: 1,
                        unit_price: importe
                    }
                ],
                back_urls: {
                    success: "http://localhost:3000/success",
                    pending: "http://localhost:3000/pending",
                    failure: "http://localhost:3000/failure"
                },
                auto_return: "approved"
            }
        });

        res.setHeader(`Content-Type`, `application/json`);
        return res.status(200).json({
            id: resultado.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la preferencia de pago' });  // Devuelve JSON en caso de error
    }

});

router.post('/:cid/product/:pid', passportCall("jwt"), auth(["admin", "user"]), async (req, res, next) => {
    try {
        let { cid, pid } = req.params;
        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: "Ingrese cid / pid valido" });
        }

        let carrito = await carritoManager.getBy({ _id: cid });
        if (!carrito) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: `Carrito con ID ${cid} inexistente` });
        }

        let producto = await productManager.getBy({ _id: pid });
        if (!producto) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: `producto con ID ${pid} inexistente` });
        }

        if (producto.stock === 0) {
            res.setHeader(`Content-Type`, `application/json`);
            return res.status(400).json({ error: `No hay stock de ${producto.description}. Stock Actual: ${producto.stock}` });
        }

        let indiceProducto = carrito.productos.findIndex(prod => prod.producto.equals(pid));

        if (indiceProducto === -1) {
            carrito.productos.push({
                producto: pid,
                cantidad: 1
            });
        } else {
            carrito.productos[indiceProducto].cantidad++;
        }

        let resultado = await carritoManager.update(cid, carrito);

        if (resultado.modifiedCount === 0) {
            return res.status(500).json({ error: "No se pudo actualizar el carrito" });
        } else {
            return res.status(200).json({ message: "Producto agregado exitosamente", carrito });
        }

    } catch (error) {
        next(error);
    }

});