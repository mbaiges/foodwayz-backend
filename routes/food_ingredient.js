const message = require('../interface').message;
const FoodRoute = require('./food.js');

module.exports = class FoodIngredientRoute {
    constructor(server) {
        this.server = server;
        this.foodRoute = new FoodRoute(this.server);
    }

    async initialize(app) {
        
        app.route('/food/:foodId/ingredient/:ingrId')
            .post(this.linkFoodAndIngr.bind(this))
            .delete(this.unLinkfoodAndIngr.bind(this));

        app.get('/food/:foodId/ingredient', this.getIngrsByFood.bind(this));
        app.get('/ingredient/:ingrId/foods', this.getFoodsByIngr.bind(this));
    }

    async linkFoodAndIngr(req, res) {
        const { foodId, ingrId } = req.params;

        try {
            const link = await this.server.db('t_food_has_ingredient').where({a_food_id: foodId, a_ingr_id: ingrId});
            if (link) {
                res.status(409).json(message.conflict('foodHasIngredient', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_food_has_ingredient').insert({a_food_id: foodId, a_ingr_id: ingrId});
                res.status(200).json(message.post('food has ingredient', added_link));
            }
        } catch (error) {
            console.log(error);
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
        }
    }

    async getIngrsByFood(req, res) {
        const { foodId } = req.params;

        try {
            const ingrs = await this.server.db('t_food_has_ingredient').joinRaw('natural full join t_ingredient').select("a_ingr_id", "a_ingr_name").where({a_food_id: foodId});
            res.status(200).json(message.fetch(`ingredients by food id ${foodId}`, ingrs));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getFoodsByIngr(req, res) {
        const { ingrId } = req.params;

        try {
            let foods = await this.server.db('t_food_has_ingredient').select("a_food_id").where({a_ingr_id: ingrId});
            let food;
            let aux = {};
            for (let i = 0; i < foods.length; i < 0) {
                await this.foodRoute.getFood({params: {id: foods[i].a_food_id}}, aux);
                if (aux.result) {
                    food = aux.result.first();
                    foods[i] = food;
                }
                aux = {};
            }
            res.status(200).json(message.fetch(`food by ingredients id ${ingrId}`, foods));

        } catch (error) {
            console.log(error);
        }
    }

};

