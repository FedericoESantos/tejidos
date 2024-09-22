import { usuariosModelo } from "./models/usuariosModelo.js";

export class usuarioManagerMongo{

    async getAll(){
        return await usuariosModelo.find();
    }

    async getBy(filtro){
        return await usuariosModelo.findOne(filtro);
    }

    async getByName(name){
        return await usuariosModelo.findOne({name});
    }

    async create(user){ 
        return await usuariosModelo.create(user);
    }

    async update(id,usuario){
        return await usuariosModelo.findByIdAndUpdate(id,usuario,{runValidators:true});
    }

    async delete(id) {
        return await usuariosModelo.deleteOne({_id:id});
    }

}