const message = require('../interface').message;
const FoodRoute = require('./food');
const CharacteristicRoute = require('./characteristic');

module.exports = class FoodCharacteristicRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.route('/food/:foodId/characteristic/:charId')
            .post(this.linkFoodAndChar.bind(this))
            .delete(this.unLinkfoodAndChar.bind(this));

        app.route('/food/:foodId/characteristic')
            .post(this.addCharacteristicsToFood.bind(this))
            .get(this.getCharsByFood.bind(this));

        app.get('/characteristic/:charId/food', this.getFoodsByChar.bind(this));
    }

    async addCharacteristicsToFood(req, res) {
        const { foodId } = req.params;

        const { a_chars } = req.body;
        if(!Array.isArray(a_chars)) {
            res.status(400).json(message.badRequest('food has characteristic', 'a_chars', 'not an array'));
            return;
        }

        try {
            for (let i = 0; i < a_chars.length; i++) {
                const link = await this.server.db('t_food_has_characteristic').where({a_food_id: foodId, a_char_id: a_chars[i].a_char_id});
                if (link.length != 0) {
                    return res.status(409).json(message.conflict('food has characteristic', 'already exists', link));
                }      
            }

            const added_links = await this.server.db('t_food_has_characteristic').insert(a_chars.map(c => Object.assign({a_food_id: parseInt(foodId), a_char_id: c.a_char_id}))).returning('*');
            res.status(200).json(message.post('food has characteristic', added_links));  

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async linkFoodAndChar(req, res) {
        const { foodId, charId } = req.params;

        try {
            const link = await this.server.db('t_food_has_characteristic').where({a_food_id: foodId, a_char_id: charId}).returning('*');
            if (link.length != 0) {
                res.status(409).json(message.conflict('foodHasCharacteristic', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_food_has_characteristic').insert({a_food_id: foodId, a_char_id: charId}).returning('*');
                res.status(200).json(message.post('food has charactersitic', added_link));
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
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
            res.status(500).json({message: error.message});
        }
    }

    async getCharsByFood(req, res) {
        const { foodId } = req.params;

        try {
            const chars = await this.getCharsByFoodObjects(foodId);
            res.status(200).json(message.fetch(`characteristics by food id ${foodId}`, chars));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getCharsByFoodObjects(foodId) {
        if (!this.charRoute) {
            const CharacteristicRoute = require('./characteristic');
            this.charRoute = new CharacteristicRoute(this.server);
        }

        let chars_ids = await this.server.db('t_food_has_characteristic').select("a_char_id").where({a_food_id: foodId});
        if (chars_ids && !Array.isArray(chars_ids))
            chars_ids = [chars_ids];
        if (chars_ids) {
            chars_ids = chars_ids.map(c => c.a_char_id);
        }
        return await this.charRoute.getCharacteristicsObjects({ filters: {a_char_id: chars_ids} });
    }

    async getFoodsByChar(req, res) {
        const { charId } = req.params;

        try {
            const foods = await this.getFoodsByCharObjects(charId);
            res.status(200).json(message.fetch(`food by characteristics id ${charId}`, foods));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getFoodsByCharObjects(charId) {
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        let foods_ids = await this.server.db('t_food_has_characteristic').select("a_food_id").where({a_char_id: charId});
        if (foods_ids && !Array.isArray(foods_ids))
            foods_ids = [foods_ids];
        if (foods_ids) {
            foods_ids = foods_ids.map(f => f.a_food_id);
        }
        return await this.foodRoute.getFoodsObjects({ filters: {a_food_id: foods_ids}, detailed: true });
    }

};

