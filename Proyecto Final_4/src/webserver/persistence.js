import multer from 'multer';
import fs from 'fs';

class Persistence{

    constructor(config){
        const storage = multer.diskStorage({
            destination: function(req, file, cb){
                cb(null, config.multer_pics)
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