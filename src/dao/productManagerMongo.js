import { productosModelo } from "./models/productoModelo.js";

export class productManagerMongo{

    async getAll(){
        return await productosModelo.find().lean();
    }

    async getByEmail(email){
        return await productosModelo.findOne({email});
    }

    async getBy(filtro){
        return await productosModelo.findOne(filtro).lean();
    }

    async create(filtro){
        let nuevoProducto = await productosModelo.create(filtro);
        return nuevoProducto.toJSON();
    }

    async update(id, producto){
        return productosModelo.updateOne({_id:id}, producto);
    }

    async delete(id) {
        return await productosModelo.deleteOne({_id:id});
    }

}