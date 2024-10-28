import { Router } from 'express';
import { enviarMail, upload } from '../utils.js';
import fs from "fs";

export const router = Router();

router.post('/', upload.array("contacto"), async (req, res) => {
    let { subject, message } = req.body;
    let to = 'boomartsfs@gmail.com';
    if (!subject || !message) {
        res.setHeader(`Content-Type`, `application/json`);
        return res.status(200).json({ error: "Complete los datos" });
    }

    let adjuntos = [];

    req.files.forEach(file => {
        adjuntos.push(
            {
                path: file.path,
                filename: file.filename
            },
        )
    });

    try {
        let resultado = await enviarMail(to, subject, message, adjuntos);
        
        req.files.forEach(file => {
            fs.unlinkSync(file.path); 
        })

        if(resultado.accepted.length > 0 && resultado.rejected.length === 0){
            res.setHeader('Content-Type','application/json');
            return res.status(200).redirect("/contacto?mensaje=Mensaje enviado correctamente, a la brevedad te responderemos!!!");
        }else{
            return res.status(400).redirect("/contacto?error=Problemas con la cuenta de destino!!!");
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