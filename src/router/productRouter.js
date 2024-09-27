import { Router } from 'express';
import { productManagerMongo as Prod } from '../dao/productManagerMongo.js';
import { upload } from '../utils.js';
import { auth } from '../middleware/auth.js';

const productManager = new Prod();

export const router = Router();

router.get('/', async (req, res) => {

    let productos;
    try {
        productos = await productManager.getAll();
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` })
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ productos });

});

router.post('/', upload.single("prod"), auth, async(req, res) => {
    let { name, description, price, image, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Complete las propiedades faltantes` });
    }

    if (req.file) {
        image = req.file;
    }

    let existe;
    try {
        existe = await productManager.getBy({ name });

        if (existe) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Ya existe ${name} en la base de datos` });
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
    let nuevoProducto;
    try {
        nuevoProducto = await productManager.create({
            name,
            description,
            category,
            price,
            stock,
            image: `./img/productos/${req.file.originalname}`
        });
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` })
    }
    req.io.emit("nuevoProd", name);

    res.setHeader('Content-Type', 'application/json');
    return res.redirect("/stock");
});

router.put('/', async(req, res) => {
    let { id } = req.params;
    let updates = req.body;

    if (!isValidObjectId(id)) {
        CustomError.createError("ID invalido", argumentosProductos(req.params), "ID invalido", Tipos_Error.Argumentos_invalidos);
    }

    let productoActualizado;
    try {
        productoActualizado = await productService.update({ _id: id }, updates);

        if (!productoActualizado) {
            CustomError.createError("Argumentos Inexistentes", argumentosProductos(req.params), "producto inexistente", Tipos_Error.Argumentos_invalidos);
        }
    } catch (error) {
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: error.message });
    }

    let productos = await productService.getAll();
    req.io.emit('productoActualizado', productos);

    res.setHeader(`Content-Type`, `application/json`);
    return res.status(200).json({ payload: 'Producto actualizado', productoActualizado });
});

router.delete('/:id', async(req, res) => {
    let { id } = req.params;
    id = Number(id);
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: 'id debe ser numerico' })
    }
    let productoEliminado
    try {
        productoEliminado = await productManager.delete(id);
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `${error.message}` })
    }

    let productos = productManager.getAll();
    req.io.emit("productoBorrado", productos);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ productoEliminado });
});