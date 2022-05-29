const prodsOptions = require('../options/mariaDB');
const prodsKnex = require('knex')(prodsOptions);

const products = [{
        title: "Pokemon Legends Arceus",
        price: 12999.99,
        thumbnail: "https://http2.mlstatic.com/D_NQ_NP_844620-MLA48440757964_122021-O.webp"
    },
    {
        title: "Monitor Gamer 27' Samsung Curvo WQHD165Hz Odyssey G55",
        price: 69999.99,
        thumbnail: "https://mexx-img-2019.s3.amazonaws.com/tumb_monitor-gamer-samsung-165hz-27_42381_1.jpeg"
    },
    {
        title: "Notebook Gamer Gigabyte Aero i7 16Gb Ssd 1Tb RTX3070Q 8Gb",
        price: 417699.99,
        thumbnail: "https://mexx-img-2019.s3.amazonaws.com/40989_1.jpeg"
    }
];

function productsInsert() {
    return prodsKnex('products').insert(products)
        .then(() => console.log("Productos agregados"))
        .catch(e => {
            console.log(e)
        }).finally(() => {
            prodsKnex.destroy();
        });
}

module.exports = productsInsert;