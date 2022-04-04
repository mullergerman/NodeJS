import admin from '../../node_modules/firebase-admin/lib/index.js'

class ContenedorFirebase{
    constructor(firebase_server, collection){
        this.collection = collection;
        this.db = "";
        this.query = "";
        this.firebase_server = firebase_server;
    }

    async init(){
        try {
            admin.initializeApp({
                credential: admin.credential.cert(this.firebase_server)          
              });
              
              this.db = admin.firestore();
              this.query = this.db.collection(this.collection);
              return true;
        } catch (error) {
            return ({error});
        }

    }

    async erase_all(){
        try {
            await this.deleteCollection(this.db, this.collection, 100);
            return true;
        } catch (error) {
            return ({error});
        }
    }

    async insert(data){
        try {
            let doc = this.query.doc(`${this.nextid}`);
            await doc.create(data);
            return data;
        } catch (error) {
            return ({error});
        }

    }

    async getAll(){
        try {
            const queryAll = await this.query.get();
            let docs = queryAll.docs;
            const response = docs.map((doc)=>({
                contenido: doc.data()
            }));
            return (response);

        } catch (error) {
            return ({error});
        }
    }


    async get(id){
        try {
            const doc = this.query.doc(`${id}`);
            const contenido = await doc.get();
            const response = contenido.data();
            return response;
        } catch (error) {
            return ({error});
        }
    }

    async getBy(parameter, value){
        try {
            const doc = this.query.where(parameter, '==', value);
            const contenido = await doc.get();
            const response = contenido.data();
            return response;
        } catch (error) {
            return ({error});
        }
    }

    async update(id, data){
        try {
            const doc = this.query.doc(`${id}`);
            await doc.update(data)
            return data;
        } catch (error) {
            return ({error});
        }     
    }


    async remove(id){
        try {
            const doc = this.query.doc(`${id}`);
            await doc.delete();
            return true;
        } catch (error) {
            return ({error});
        }
    }

    async deleteCollection(db, collectionPath, batchSize) {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('__name__').limit(batchSize);
      
        return new Promise((resolve, reject) => {
          this.deleteQueryBatch(db, query, resolve).catch(reject);
        });
      }
      

    async deleteQueryBatch(db, query, resolve) {
        const snapshot = await query.get();
      
        const batchSize = snapshot.size;
        if (batchSize === 0) {
          // When there are no documents left, we are done
          resolve();
          return;
        }
      
        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          this.deleteQueryBatch(db, query, resolve);
        });
      }

     
    
}

export default ContenedorFirebase;