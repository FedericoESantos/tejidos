import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, "./src/uploads");
    },
    filename: function(req,file,cb){

        let tipo = file.mimetype.split("/")[0];
        if(tipo!=="image"){
            return cb(new Error("Solo se admiten imagenes...!"))
        }

        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const upload = multer({storage: storage});

const secret = "fede123";
export const generaHash = password => crypto.createHmac("sha256", secret).update(password).digest("hex");