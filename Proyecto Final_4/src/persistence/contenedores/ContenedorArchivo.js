import { promises as fs} from 'fs'

class ContenedorArchivo{

    constructor(path){
        this.path = path;
        this.started = false;
    }


    LoadVector(data){
        const vector = [];
        const data_vector = data.split('\n');
        for (let entry of data_vector){
            if (entry.length>1){
                vector.push(JSON.parse(entry))
            }
        }
        return(vector);
    }

    async init(){
        return true;
    }

    async erase_all(){
        try {
            await fs.unlink(this.path);
            return true;
        } catch (error) {
            return ({error});
        }
    }

    async insert(data){
        try {
            await fs.appendFile(this.path, JSON.stringify(data) + '\n')
            return(data);
        } catch (error) {
            return ({error});
        }

    }

    async getAll(){
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            const data_vector = this.LoadVector(data);
            return data_vector;
        } catch (error) {
            return ({error});
        }
    }

    async get(id){
        try {
            const db = await this.getAll();
            for (let contenido of db){
                if (contenido.id == id){
                    return contenido
                }
            }
            return ({error: 'Not found'})
        } catch (error) {
            return ({error});
        }
    }

    async getBy(parameter, value){
        try {
            const db = await this.getAll();
            for (let contenido of db){
                if (contenido[parameter] == value){
                    return contenido
                }
            }
            return ({error: 'Not found'})
        } catch (error) {
            return ({error});
        }
    }

    async update(id, data){
        const db = await this.getAll();
        await fs.writeFile(this.path, '');
        let retorno = null;
        for (const contenido of db){
            if (contenido.id == id){    
                await fs.appendFile(this.path, JSON.stringify(data) + '\n');
                retorno = data;
            }else{
                await fs.appendFile(this.path, JSON.stringify(contenido) + '\n');
            }
        }
        if (!retorno){
            return retorno;
        }else{
            return({error: 'Not found'})
        }        
    }

    async remove(id){
        const db = await this.getAll();
        let removed = false;
        await fs.writeFile(this.path, '');
        for (const contenido of db){
            if (contenido.id != id){
                await fs.appendFile(this.path, JSON.stringify(contenido) + '\n');
            }else{
                removed = true;
            }
        }
        if (removed){
            return removed;
        }else{
            return({error: 'Not found'})
        }
                
    }

}

export default ContenedorArchivo;