import multer from 'multer';
import fs from 'fs';
import { multer_pics } from '../config/config.js'

class Persistence{

    constructor(){
        const storage = multer.diskStorage({
            destination: function(req, file, cb){
                cb(null, multer_pics)
            },
            filename: function(req, file, cb){
                cb(null, req.body.username + '_pic_profile.png');
            }
        });

        this.upload = multer({storage})
    }

    async rename(source, destination){
        try {
            await fs.promises.rename(source, destination)
        } catch (error) {
            return (done(error, null));
        }
    }

    getUpload(){
        return this.upload;
    }

}

export default Persistence;