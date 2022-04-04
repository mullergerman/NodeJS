import mongoose from 'mongoose'
import getConfig from '../../config/config.js';

const config = getConfig();
const scheme = mongoose.model(config.collection_chats, { 
    username:   { type: String, required: true },
    type:       { type: String },
    date:       { type: String },
    msg:        { type: String }
});

export default scheme;