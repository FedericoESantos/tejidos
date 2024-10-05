import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";

import { usuarioManagerMongo as UsuarioManager } from "../dao/usuarioManagerMongo.js";
import { generaHash, secret, validaPassword } from "../utils.js";

const usuarioManager = new UsuarioManager();

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
            async (req, usename, password, done) => {
                try {
                    let { nombre, last_name, email, password } = req.body;
                    if (!nombre) {
                        return done(null, false);
                    }

                    let existe = await usuarioManager.getBy({ email: usename });
                    if (existe) {
                        return done(null, false);
                    }

                    password = generaHash(password);

                    let nuevoUsuario = await usuarioManager.create({ name, last_name, email, password });
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
                        return done(null, false);
                    }

                    if (!validaPassword(password, usuario.password)) {
                        return done(null, false);
                    }

                    return done(null, usuario);

                }catch (error) {
                    return done(error);
                }
            }
        )
    )

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