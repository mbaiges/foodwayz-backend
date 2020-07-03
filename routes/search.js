const message = require('../interface').message;

module.exports = class SearchRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/search')
            .post(this.search.bind(this))
    }

    async search(req, res) {
        if (!this.restaurantRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restaurantRoute = new RestaurantRoute(this.server);
        }
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const {
            raw_input,
            filters
        } = req.body;

        const {
            a_type_name,
            a_ingr_name,
            a_char_name
        } = filters;

        let rests, foods;

        let input_pg_regex = "%" + raw_input.replace(/ /g,"%") + "%";

        rests = await this.db('t_restaurant').join('t_restaurant_chain', 'users.id', '=', 'contacts.user_id');
    }

}