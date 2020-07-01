const message = require('../interface').message;
const FoodRoute = require('./food.js');
const { restart } = require('nodemon');

module.exports = class FoodTypeRoute {
    constructor(server) {
        this.server = server;
        this.foodRoute = new FoodRoute(this.server);
    }

    async initialize(app) {
        app.get('/type/:typeId/food', this.getFoodsByType.bind(this));
    }

    async getFoodsByType(req, res) {
        const { typeId } = req.params;

        try {
            let foods = await this.foodRoute.getFoodsObjects({ filters: {a_type_id: typeId} });
            res.status(200).json(message.fetch(`food by type id ${typeId}`, foods));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }

};

