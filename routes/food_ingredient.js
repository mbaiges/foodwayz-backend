const FoodRoute = require('./food');

const message = require('../interface').message;

module.exports = class FoodIngredientRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.route('/food/:foodId/ingredient/:ingrId')
            .post(this.linkFoodAndIngr.bind(this))
            .delete(this.unLinkfoodAndIngr.bind(this));

        app.route('/food/:foodId/ingredient')
            .post(this.addIngredientsToFood.bind(this))
            .get(this.getIngrsByFood.bind(this));

        app.get('/ingredient/:ingrId/food', this.getFoodsByIngr.bind(this));
    }

    async addIngredientsToFood(req, res) {
        const { foodId } = req.params;

        const { a_ingrs } = req.body;

        try {
            for (ingr in a_ingrs) {
                const link = await this.server.db('t_food_has_ingredient').where({a_food_id: foodId, a_ingr_id: ingr.a_ingr_id});
                if (link.length != 0) {
                    return res.status(409).json(message.conflict('foodHasIngredient', 'already exists', link));
                }
            }    

        const added_links = await this.server.db('t_food_has_ingredient').insert(a_ingrs.map(i => Object.create({a_food_id: foodId, a_ingr_id: i.a_ingr_id}))).returning('*');
        res.status(200).json(message.post('food has ingredient', added_link));  

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async linkFoodAndIngr(req, res) {
        const { foodId, ingrId } = req.params;

        try {
            const link = await this.server.db('t_food_has_ingredient').where({a_food_id: foodId, a_ingr_id: ingrId});
            if (link.length != 0) {
                res.status(409).json(message.conflict('foodHasIngredient', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_food_has_ingredient').insert({a_food_id: foodId, a_ingr_id: ingrId}).returning('*');
                res.status(200).json(message.post('food has ingredient', added_link));
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async unLinkfoodAndIngr(req, res) {
        const { foodId, ingrId } = req.params;

        try {
            const unliked = await this.server.db('t_food_has_ingredient').where({a_food_id: foodId, a_ingr_id: ingrId}).del();

            if(unliked) 
                res.status(200).json(message.delete('food has ingredient', unliked));
            else
                res.status(404).json(message.notFound('food has ingredient', [foodId, ingrId]));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getIngrsByFood(req, res) {
        const { foodId } = req.params;

        try {
            const ingrs = await this.getIngrsByFoodObjects(foodId);
            res.status(200).json(message.fetch(`ingredients by food id ${foodId}`, ingrs));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getIngrsByFoodObjects(foodId) {
        if (!this.ingrRoute) {
            const IngredientRoute = require('./ingredient');
            this.ingrRoute = new IngredientRoute(this.server);
        }

        let ingrs_ids = await this.server.db('t_food_has_ingredient').select("a_ingr_id").where({a_food_id: foodId});
        if (ingrs_ids && !Array.isArray(ingrs_ids))
            ingrs_ids = [ingrs_ids];
        if (ingrs_ids) {
            ingrs_ids = ingrs_ids.map(i => i.a_ingr_id);
        }
        return await this.ingrRoute.getIngredientsObjects({ filters: {a_ingr_id: ingrs_ids} });
    }

    async getFoodsByIngr(req, res) {
        const { ingrId } = req.params;

        try {
            const foods = await this.getFoodsByIngrObjects(ingrId);
            res.status(200).json(message.fetch(`food by ingredients id ${ingrId}`, foods));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getFoodsByIngrObjects(ingrId) {
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = FoodRoute(this.server);
        }
        
        let foods_ids = await this.server.db('t_food_has_ingredient').select("a_food_id").where({a_ingr_id: ingrId});
        if (foods_ids && !Array.isArray(foods_ids))
            foods_ids = [foods_ids];
        if (foods_ids) {
            foods_ids = foods_ids.map(f => f.a_food_id);
        }
        return await this.foodRoute.getFoodsObjects({ filters: {a_food_id: foods_ids}, detailed: true });
    }

};

