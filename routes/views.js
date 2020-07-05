const message = require('../interface').message;

module.exports = class ViewsRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/views/food')
            .post(this.registerFoodView.bind(this));

        app.route('/view/restaurant')
            .post(this.registerRestaurantView.bind(this));
    }

    async registerFoodView(req, res) {
        const {
            a_user_id
        } = req.user;

        const {
            a_food_id
        } = req.body;

        try {
            if (!a_food_id) {
                return res.status(400).json(message.badRequest("a_food_id", a_food_id, undefined));
            }

            await this.server.db('t_food_views').insert({a_user_id, a_food_id});
            return res.status(200).json(message.post("food view registered", true));
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
            a_rest_id
        } = req.body;
        
        try {
            if(!a_rest_id) {
                return res.status(400).json(message.badRequest('a_rest_id', a_rest_id, undefined));
            }

            await this.server.db('t_food_views').insert({a_user_id, a_rest_id});
            return res.status(200).json(message.post("restaurant view registered", true));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }

    }

}