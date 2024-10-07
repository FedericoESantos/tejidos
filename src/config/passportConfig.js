import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";

import { usuarioManagerMongo as UsuarioManager } from "../dao/usuarioManagerMongo.js";
import { generaHash, secret, validaPassword } from "../utils.js";
import { CarritoManagerMongo as CarritoManager} from "../dao/carritoManagerMongo.js";

const usuarioManager = new UsuarioManager();
let carritoManager = new CarritoManager();

export const initPassport = () => {

const buscaToken=(req)=>{
    let token = null;

    if(req.cookies["fedeCookie"]){
        token = req.cookies["fedeCookie"];
    }

    return token;
}

    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true
            },
            async (req, username, password, done) => {
                try {
                    let { name, last_name, email, password } = req.body;
                    if (!name || !last_name || !email || !password){
                        return done(null, false);
                    }

                    let existe = await usuarioManager.getBy({ email: username });
                    if (existe) {
                        return done(null, false, { message: 'El usuario ya existe en la base de datos' });
                    }

                    let carrito = await carritoManager.create({});
                    if (!carrito) {
                        return done(null, false, { message: 'No se pudo asignar un carrito al usuario' });
                    }
                    password = generaHash(password);

                    let nuevoUsuario = await usuarioManager.create({
                        name,
                        last_name,
                        email,
                        password,
                        carrito: carrito._id
                     });
                    return done(null, nuevoUsuario);

                } catch (error) {
                    done(error);
                }
            }
        )
    )

    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField: "email"
            },
            async (username, password, done) => {
                try {
                    let usuario = await usuarioManager.getBy({ email: username });
                    if (!usuario) {
                        return done(null, false, {message: "Login : No existe usuario"});
                    }
    
                    if (!validaPassword(password, usuario.password)) {
                        return done(null, false, { message: "Login: Credenciales Invalidas"});
                    }

                    let carrito = await carritoManager.getByPopulate({ _id: usuario._doc.carrito._id });                    
                    //console.log(carrito._id);
                    if(!carrito) {
                        let carritoNuevo = await carritoManager.create();
                        usuario.carrito = carrito.carritoNuevo._id;
                        await usuarioManager.update(usuario._id, usuario);
                    }
    
                    return done(null, usuario, { message: "Carrito nuevo creado y asociado al usuario" });
    
                }catch (error) {
                    return done(error);
                }
            }
        )
    );
    
    passport.use(
        "jwt",
        new passportJWT.Strategy(
            {
                secretOrKey: secret,
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscaToken])
            },
            async(contenidoToken, done)=>{
                try {
                    return done(null, contenidoToken);
                } catch (error) {
                    return done(error);
                }

            }
        )
    ) 

}