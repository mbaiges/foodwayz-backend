const message = require('../interface').message;
const { restart } = require('nodemon');

module.exports = class FoodTypeRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.get('/type/:typeId/food', this.getFoodsByType.bind(this));
    }

    async getFoodsByType(req, res) {
        if (!this.foodRoute) {
            const FoodRoute = require('./food.js');
            this.foodRoute = new FoodRoute(this.server);
        }

        const { typeId } = req.params;

        try {
            let foods = await this.foodRoute.getFoodsObjects({ filters: {a_type_id: typeId} });
            res.status(200).json(message.fetch(`food by type id ${typeId}`, foods));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

};

