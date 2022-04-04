import mongoose from 'mongoose'
import getConfig from '../../config/config.js';

const config = getConfig();
const scheme = mongoose.model(config.collection_users, { 
    username:   { type: String, required: true },
    password:   { type: String, required: true },
    name:       { type: String },
    age:        { type: Number },
    phone:      { type: String },
    address:    { type: String },
    photo:      { type: String },
    cart:       { type: String }
});

export default scheme;