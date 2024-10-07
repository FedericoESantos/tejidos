import fs from 'fs/promises'; // Usa la versión de fs con promesas
import path from 'path';
import { enviarMail } from '../utils.js';

export class ticketManagerFS {
    constructor() {
        this.ruta = path.resolve('./src/tickets/tickets.json');
    }

    async leerTickets() {
        try {
            await fs.access(this.ruta); 
            const data = await fs.readFile(this.ruta, 'utf8');

            if (!data.trim()) {
                return [];
            }
    
            const parsedData = JSON.parse(data);

            if (!Array.isArray(parsedData)) {
                throw new Error('El contenido de tickets.txt no es un array válido');
            }
    
            return parsedData;
    
        } catch (error) {
            console.error('Error leyendo los tickets:', error.message);
            return []; 
        }
    }
    

    async escribirTickets(tickets) {
        if (!tickets || tickets.length === 0) {
            throw new Error('No hay tickets para escribir');
        }
        await fs.writeFile(this.ruta, JSON.stringify(tickets, null, 2), 'utf8');
    }

    async obtenerNroComprobante() {
        const tickets = await this.leerTickets();

        if (tickets.length === 0) {
            return 1;
        }

        const nroComps = tickets.map(t => {
            const nro = t.nroComprobante.nroComp;
            return Number.isNaN(Number(nro)) ? 0 : Number(nro); // Si no es número, devolvemos 0
        });

        const maxNroComprobante = Math.max(...nroComps);
        return maxNroComprobante + 1;
    }
    
    async crearTicketLocal(nroComprobante, fecha, comprador, items, total) {
        const tickets = await this.leerTickets(); 

        const nuevoTicket = {
            nroComprobante,
            fecha,
            comprador,
            items,
            total
        };

        tickets.push(nuevoTicket); 

        await this.escribirTickets(tickets);
       
        return nuevoTicket;
    }
}
