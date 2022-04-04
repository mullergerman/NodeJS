import mongoose from 'mongoose'
import getConfig from '../../config/config.js';

const config = getConfig();
const scheme = mongoose.model(config.collection_productos, { 
    nombre:     { type: String, required: true },
    descripcion:{ type: String, required: true },
    categoria:  { type: String, required: true },
    codigo:     { type: String, required: true },
    precio:     { type: Number, required: true },
    stock:      { type: Number, required: true },
    foto:       { type: String, required: true },
    id:         { type: String, required: true, unique: true},
    timestamp:  { type: Number}
});

export default scheme;