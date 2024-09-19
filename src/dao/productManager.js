export class productManager{
    constructor(){
        this.productos = [
            {   
                id: 1,
                img: "",
                name: "Boinas",
                description: "Boinas",
                price: "$1500",
                stock: 1
            },
            {   
                id: 2,
                img: "",
                name: "Bufandas Largas",
                description: "",
                price: "$1500",
                stock: 1
            },
            {   
                id: 3,
                img: "",
                name: "Bufandas Trenzadas",
                description: "",
                price: "$1500",
                stock: 1
            },
            {   
                id: 4,
                img: "",
                name: "Bufandas",
                description: "",
                price: "$1000",
                stock: 1
            },
            {   
                id: 5,
                img: "",
                name: "Cuellos Vincha",
                description: "",
                price: "$1000",
                stock: 1
            },
            {   
                id: 6,
                img: "",
                name: "Cuello",
                description: "",
                price: "$1000",
                stock: 1
            },
            {   
                id: 7,
                img: "",
                name: "Gorros Reversibles",
                description: "",
                price: "$1500",
                stock: 1
            },
            {   
                id: 8,
                img: "",
                name: "Gorros",
                description: "",
                price: "$1000",
                stock: 1
            },
            {   
                id: 9,
                img: "",
                name: "Mitones",
                description: "",
                price: "$800",
                stock: 1
            },
            {   
                id: 10,
                img: "",
                name: "Pantuflas",
                description: "",
                price: "$1000",
                stock: 1
            },
            {   
                id: 11,
                img: "",
                name: "Pantumedias",
                description: "",
                price: "$1500",
                stock: 1
            },{   
                id: 12,
                img: "",
                name: "Polainas",
                description: "",
                price: "$1500",
                stock: 1
            },
        ]
    }

    getAll(){
        return this.productos;
    }

    getByName(name){
        return this.productos.find(prod => prod.name.toLowerCase() === name.toLowerCase());
    }

    create(producto=[]){
        let id = 1;
        if(this.productos.length > 0){
        id = Math.max(...this.productos.map(dato => dato.id))+1
        }

        let nuevoProd = {
            id, ...producto
        }

        this.productos.push(nuevoProd);

        return nuevoProd;
    }

    delete(id) {
        let productoEliminado = this.productos.find(prod => prod.id === id);
        
        if (!productoEliminado) {
            return null;  
        }
    
        this.productos = this.productos.filter(prod => prod.id !== id);
        return productoEliminado;
    }

}