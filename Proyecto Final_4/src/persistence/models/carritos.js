import mongoose from 'mongoose'
import getConfig from '../../config/config.js';

const config = getConfig();
const scheme = mongoose.model(config.collection_carritos, {
    id:         { type: String, required: true, unique: true},
    idInCart:   { type: String},
    timestamp:  { type: Number},
    productos:  { type: Object},
    username:   { type: String}
});

export default scheme;