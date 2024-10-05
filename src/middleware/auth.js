import jwt from "jsonwebtoken";
import { secret } from "../utils.js";

export const auth = (permisos = [])=>{

    return (req,res,next)=>{
        permisos = permisos.map(perm => perm.toLowerCase());

        if(permisos.includes("public")){
            return next();
        }

        if(!req.user?._doc.rol){
            res.setHeader(`Content-Type`,`application/json`);
            return res.status(401).json({error:`No hay usuarios autenticados o problemas con el rol`});
        }

        if(!permisos.includes(req.user._doc.rol.toLowerCase())){
            return res.redirect("/perfil?error=Acceso denegado, solo administradores pueden ver esta página");
        }

        next();
    }




}
