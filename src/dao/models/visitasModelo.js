import mongoose from 'mongoose';

const VisitasSchema = new mongoose.Schema({
    contador: {
        type: Number,
        default: 0
    }
});

export const Visitas = mongoose.model('Visitas', VisitasSchema);