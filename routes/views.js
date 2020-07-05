const message = require('../interface').message;

module.exports = class ViewsRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/view/food/:foodId')
            .post(this.registerFoodView.bind(this));

        app.route('/view/restaurant/:restId')
            .post(this.registerRestaurantView.bind(this));
    }

    async registerFoodView(req, res) {
        const {
            a_user_id
        } = req.user;

        const {
            foodId
        } = req.params;

        try {
            await this.server.db('t_food_view').insert({a_user_id, a_food_id: foodId});
            return res.status(200).json(message.post("food view", true));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }

    }

    async registerRestaurantView(req, res) {
        const {
            a_user_id
        } = req.user;

        const {
            restId
        } = req.params;
        
        try {
            await this.server.db('t_restaurant_view').insert({a_user_id, a_rest_id:restId});
            return res.status(200).json(message.post("restaurant view", true));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }

    }

}