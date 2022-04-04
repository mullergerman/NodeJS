import bCrypt from 'bcrypt';

function validateHash(plane, hash) {
    return bCrypt.compareSync(hash, plane);
}
  
function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

export { validateHash, createHash} 