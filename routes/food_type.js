const message = require('../interface').message;
const FoodRoute = require('./food.js');

module.exports = class FoodTypeRoute {
    constructor(server) {
        this.server = server;
        this.foodRoute = new FoodRoute(this.server);
    }

    async initialize(app) {
        app.get('/type/:typeId/foods', this.getFoodsByType.bind(this));
    }

    async getFoodsByType(req, res) {
        const { typeId } = req.params;

        try {
            let foods = await this.server.db('t_food').select('a_food_id').where({a_type_id: typeId});
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
            res.status(200).json(message.fetch(`food by type id ${typeId}`, foods));

        } catch (error) {
            console.log(error);
        }
    }

};

