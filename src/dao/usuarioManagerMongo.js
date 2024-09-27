import { usuariosModelo } from "./models/usuariosModelo.js";

export class usuarioManagerMongo{

    async getAll(){
        return await usuariosModelo.find();
    }

    async getAllPaginate(page=1){
        return await usuariosModelo.paginate({},{limit:10, page, lean:true});
    }

    async getBy(filtro){
        return await usuariosModelo.findOne(filtro);
    }

    async getByPopulate(filtro){
        return await usuariosModelo.findOne(filtro).populate("carrito").lean();
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