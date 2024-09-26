export const auth = (req,res, next)=>{
    if(!req.session.usuario){
        res.setHeader(`Content-Type`,`application/json`);
        return res.redirect(`/login?error=No hay usuarios autenticados. Por favor, logueate si ya estas registrado o registrate y luego logueate!!!`);
    }

    next();
}