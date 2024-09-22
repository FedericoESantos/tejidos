
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const usuarioSchema = new mongoose.Schema({
    name: String,
    last_name : String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
    rol: {
        type: String,
        enum: ["admin", "user", "premium"],
        default: "user",
    },
    carrito: {
        type: mongoose.Types.ObjectId,
        ref: "carritos",
    },
},
{
    timestamps:true, strict: false
}
);

usuarioSchema.plugin(mongoosePaginate);

export const usuariosModelo = mongoose.model("usuarios", usuarioSchema);