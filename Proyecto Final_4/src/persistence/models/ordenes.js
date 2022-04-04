import mongoose from 'mongoose'
import getConfig from '../../config/config.js';

const config = getConfig();
const scheme = mongoose.model(config.collection_ordenes, { 
    id:         { type: String, required: true },
    fecha:      { type: Date},
    user:       { type: Object},
    productos:  { type: Object}
});

export default scheme;