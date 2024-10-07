import { carritoModelo } from "./models/carritosModelo.js"

export class CarritoManagerMongo{

    async getAll(){
        return await carritoModelo.find().lean();
    }

    async getBy(filtro={}){
        return await carritoModelo.findOne(filtro).lean();
    }

    async getByPopulate(filtro={}){
        return await carritoModelo.findOne(filtro).populate("productos.producto").lean();
    }

    async create(){
        let carrito = await carritoModelo.create({productos:[]});
        return carrito.toJSON();
    }

    async update(id, carrito){
        return await carritoModelo.updateOne({_id:id}, carrito);
    }

}