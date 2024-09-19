import { Router } from 'express';
import { productManager as Prod} from '../dao/productManager.js';
import { upload } from '../utils.js';

const productManager = new Prod();

export const router = Router();

router.get('/', (req,res)=>{
    let productos;

    try {
        productos = productManager.getAll();
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`${error.message}`})
    }

res.setHeader('Content-Type','application/json');
return res.status(200).json({productos});
});

router.post('/', upload.single("prod"), (req,res)=>{
    let {name, description, price, stock} = req.body;
    if(!name){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Complete propiedad name`});
    }

     let existe = productManager.getByName(name);
    if(existe){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Ya existe ${name} en la base de datos`});
    }
    let nuevoProducto;
    try {
        nuevoProducto = productManager.create({
            name,
            description,
            price,
            stock,
            img: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`${error.message}`})
    }

    req.io.emit("nuevoProd", name);

res.setHeader('Content-Type','application/json');
return res.status(201).json({payload:"producto creado", nuevoProducto});
});

router.delete('/:id', (req,res)=>{
    let {id} = req.params;
    id = Number(id);
    if(isNaN(id)){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:'id debe ser numerico'})
    }
    let productoEliminado 
    try {
        productoEliminado = productManager.delete(id);
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`${error.message}`})
    }

    let productos = productManager.getAll();
    req.io.emit("productoBorrado", productos);

res.setHeader('Content-Type','application/json');
return res.status(200).json({productoEliminado});
});