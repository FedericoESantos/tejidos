import mongoose from "mongoose";

export const productosModelo = mongoose.model(
    "productos",
    new mongoose.Schema(
        {
            image: String,
            name:String,
            description: String,
            price: Number,
            category:String,
            owner: String,
            stock: {
                type: Number, default: 0
            }
        },
        {
            timestamps: true,
            strict:true
        }
    )
)