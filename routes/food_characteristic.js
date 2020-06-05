const message = require('../interface').message;

module.exports = class foodRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.route('/food/:foodId/characteristic/:charId')
            .post(this.linkFoodAndChar.bind(this))
            .delete(this.unLinkfoodAndChar.bind(this));

        app.get('/food/:foodId/characteristic', this.getCharsByfood.bind(this));
        app.get('/characteristic/:charId/foods', );
    }

    async linkFoodAndChar(req, res) {
        const { foodId, charId } = req.body;

        try {
            const link = await this.server.db('t_food_has_characteristic').where({a_food_id: foodId, a_char_id: charId});
            if (link) {
                res.status(409).json(message.conflict('foodHasCharacteristic', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_food_has_characteristic').insert({a_food_id: foodId, a_char_id: charId});
                res.status(200).json(message.post('food has charactersitic', added_link));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async unLinkfoodAndChar(req, res) {
        const { foodId, charId } = req.params;

        try {
            const unliked = await this.server.db('t_food_has_characteristic').where({a_food_id: foodId, a_char_id: charId}).del();

            if(unliked == 0) 
                res.status(404).json(message.notFound('food has charactersitic', [foodId, charId]));
            else
                res.status(200).json(message.delete('food has charactersitic', [unliked]));

        } catch (error) {
            console.log(error);
        }
    }

    async getCharsByfood(req, res) {
        const { foodId } = req.params;

        try {
            const chars = await this.server.db('t_food_has_characteristic').joinRaw('natural full join t_characteristic').select("a_char_id", "a_char_name").where({a_food_id: foodId});
            res.status(200).json(message.fetch(`characteristics by food id ${foodId}`, chars));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getFoodsByChar(req, res) {
        const { charId } = req.params;

        try {
            const foods = await this.server.db('t_food_has_characteristic').joinRaw('natural full join t_food')
                                .select("a_food_id", "a_description", "a_score", "a_type_id", "a_res_id").where({a_char_id: charId});
            res.status(200).json(message.fetch(`food by characteristics id ${charId}`, foods));

        } catch (error) {
            console.log(error);
        }
    }

};

