const crypto = require('crypto');
const connection_db = require('../database/connection_db');

module.exports = {
    async create(request, response){
        let {additional_name, additional_value, additional,  fk_products_id} = request.body;

        const additional_id = crypto.randomBytes(4).toString('HEX');
        
        additional = JSON.stringify(additional) 
        
        console.log(additional);

        try {
            await connection_db('additional').insert({additional_id, additional, fk_products_id});

            return response.status(201).json({mensagem: 'Adicional criado com sucesso!'});
        } catch(err){
            return response.status(500).json({error: err})
        }
    },

    async getAdditional(request, response){
        
        const [result] = await connection_db('additional').select('additional');
        
        // console.log(Object.keys(add).length);
        
        return response.json(result);
    },

    async addObj(request, response){
        const {product_id} = request.body;

        const additional_id = crypto.randomBytes(4).toString('HEX');

        const obj = {
                        "additionalId": additional_id, 
                        "additionalName": "Tomate",
                        "additionalValue" : 1,
                        "checked": false,
                    }
                    

        let objArray = await connection_db('products')
                            .where({product_id: product_id})
                            .select('product_additional');
        
        if(objArray[0].product_additional == null){
            objArray[0] = obj;
            console.log('dentro do for', objArray[0]);
        } else {
            console.log('chega a cair aqui?')
            let newArray = objArray[0].product_additional
            newArray.push(obj)
           objArray = newArray;
        }

        await connection_db('products')
             .update({product_additional: JSON.stringify(objArray)})
             .where({product_id: product_id})
        
        return response.json('e ae');
    },

}