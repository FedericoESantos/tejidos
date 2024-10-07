import multer from "multer";
import bcrypt from "bcrypt";
import passport from "passport";
import nodemailer from "nodemailer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./src/public/img/prod-subidos");
    },

    filename: function (req, file, cb) {
        let tipo = file.mimetype.split("/")[0];
        if (tipo !== "image") {
            return cb(new Error("Solo se admiten imagenes...!"))
        }

        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const upload = multer({ storage: storage });

export const secret = "fede123";
export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validaPassword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash);

export const passportCall = (estrategia) => {
    return function (req, res, next) {
        passport.authenticate(estrategia, function (error, user, info) {
            if (error) { return next(error) }
            if (!user) {
                return res.redirect("/login?error=Debes iniciar sesión para acceder a este recurso");
            }
            req.user = user;

            return next();

        })(req, res, next);
    }
}

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        port:"587",
        auth: {
            user:"boomarts47@gmail.com",
            pass:"dicfdqdunpplfacl"
        }
    }
)

export const enviarMail = async(to, subject, message, attachments) => {
        return await transporter.sendMail(
                {
                    from:"Tejidos Punto Feliz | boomarts47@gmail.com",
                    to,
                    subject,
                    html:message,
                    attachments
                }
            )
}
