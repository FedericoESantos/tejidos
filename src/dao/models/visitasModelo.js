import mongoose from 'mongoose';

const VisitasSchema = new mongoose.Schema({
    contador: {
        type: Number,
        default: 0
    },
    ipAddresses: {
        type: [String], 
        default: []
    }
});

export const Visitas = mongoose.model('Visitas', VisitasSchema);