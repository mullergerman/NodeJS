const faker = require('faker')
faker.locale = 'es';

class ProductosTest{
    static generate(cantidad){
        const array = []
        for (let i = 0; i<cantidad; i++){
            array.push({
                title: faker.commerce.productName(),
                price: faker.commerce.price(),
                thumbnail: faker.image.image()
            })
        }
        return(array);
    }
}


module.exports = ProductosTest;