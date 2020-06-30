const message = require('../interface').message;
const FoodRoute = require('./food');
const CharacteristicRoute = require('./characteristic');

module.exports = class FoodCharacteristicRoute {
    constructor(server) {
        this.server = server;
        this.foodRoute = new FoodRoute(server);
        this.charRoute = new CharacteristicRoute(server);
    }

    async initialize(app) {
        
        app.route('/food/:foodId/characteristic/:charId')
            .post(this.linkFoodAndChar.bind(this))
            .delete(this.unLinkfoodAndChar.bind(this));

        app.get('/food/:foodId/characteristic', this.getCharsByFood.bind(this));
        app.get('/characteristic/:charId/food', this.getFoodsByChar.bind(this));
    }

    async linkFoodAndChar(req, res) {
        const { foodId, charId } = req.params;

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

            if(unliked) 
                res.status(200).json(message.delete('food has characteristic', unliked));
            else
                res.status(404).json(message.notFound('food has characteristic', [foodId, charId]));

        } catch (error) {
            console.log(error);
        }
    }

    async getCharsByFood(req, res) {
        const { foodId } = req.params;

        try {
            let chars_ids = await this.server.db('t_food_has_characteristic').select("a_char_id").where({a_food_id: foodId});
            if (chars_ids && !Array.isArray(chars_ids))
                chars_ids = [chars_ids];
            const chars = await this.charRoute.getIngredientsObjects({ filters: {a_char_id: chars_ids} });
            res.status(200).json(message.fetch(`characteristics by food id ${foodId}`, chars));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getFoodsByChar(req, res) {
        const { charId } = req.params;

        try {
            let foods_ids = await this.server.db('t_food_has_characteristic').select("a_food_id").where({a_char_id: charId});
            if (foods_ids && !Array.isArray(foods_ids))
                foods_ids = [foods_ids];
            const foods = await this.foodRoute.getFoodsObjects({ filters: {a_food_id: foods_ids} });
            res.status(200).json(message.fetch(`food by characteristics id ${charId}`, foods));

        } catch (error) {
            console.log(error);
        }
    }

};

