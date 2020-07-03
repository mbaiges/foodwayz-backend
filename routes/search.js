const message = require('../interface').message;

module.exports = class SearchRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/search/food')
            .post(this.searchFoods.bind(this));

        app.route('/search/restaurant')
            .post(this.searchRestaurants.bind(this));
    }

    async searchRestaurants(req, res) {
        if (!this.restaurantRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restaurantRoute = new RestaurantRoute(this.server);
        }

        const {
            raw_input
        } = req.body;

        let rests;

        let input_pg_regex = "%" + raw_input.replace(/ /g,"%") + "%";

        rests = await this.server.db.select('a_rest_id').from('t_restaurant')
            .join('t_restaurant_chain', 't_restaurant.a_rest_chain_id', '=', 't_restaurant_chain.a_rest_chain_id')
            .where('t_restaurant.a_name', 'ilike', input_pg_regex)
            .orWhere('t_restaurant_chain.a_name', 'ilike', input_pg_regex);

        if (!Array.isArray(rests)) {
            rests = [rests];
        }

        if (!rests) {
            rests = [];
        }

        rests = rests.map(r => r.a_rest_id);
        rests = rests.filter((value, index) => rests.indexOf(value) === index);

        rests = await this.restaurantRoute.getRestaurantsObjects({ filters: {a_rest_id: rests} });

        return res.status(200).json({result: rests});
    }

    async searchFoods(req, res) {
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const {
            raw_input,
            filters
        } = req.body;

        const {
            a_type_ids,
            a_ingr_ids,
            a_char_ids
        } = filters;

        let foods;

        let input_pg_regex = "%" + raw_input.replace(/ /g,"%") + "%";

        if (!a_type_ids || !Array.isArray(a_type_ids) || a_type_ids.length == 0) {
            foods = await this.server.db.select(
                't_food.a_food_id as a_food_id',
                't_type.a_type_id as a_type_id',
                't_ingredient.a_ingr_id as a_ingr_id',
                't_characteristic.a_char_id as a_char_id'
                ).from('t_food')
                .join('t_type', 't_food.a_type_id', '=', 't_type.a_type_id')
                .leftOuterJoin('t_food_has_ingredient', 't_food.a_food_id', '=', 't_food_has_ingredient.a_food_id')
                .join('t_ingredient', 't_food_has_ingredient.a_ingr_id', "=", "t_ingredient.a_ingr_id")
                .leftOuterJoin('t_food_has_characteristic', 't_food.a_food_id', '=', 't_food_has_characteristic.a_food_id')
                .join('t_characteristic', 't_food_has_characteristic.a_char_id', "=", "t_characteristic.a_char_id")
                .where(function() { 
                    this.where('t_food.a_title', 'ilike', input_pg_regex)
                    .orWhere('t_food.a_description', 'ilike', input_pg_regex)
                    .orWhere('t_type.a_type_name', 'ilike', input_pg_regex)
                    .orWhere('t_ingredient.a_ingr_name', 'ilike', input_pg_regex)
                    .orWhere('t_characteristic.a_char_name', 'ilike', input_pg_regex)
                })
        }
        else {
            foods = await this.server.db.select(
                't_food.a_food_id as a_food_id',
                't_type.a_type_id as a_type_id',
                't_ingredient.a_ingr_id as a_ingr_id',
                't_characteristic.a_char_id as a_char_id'
                ).from('t_food')
                .join('t_type', 't_food.a_type_id', '=', 't_type.a_type_id')
                .leftOuterJoin('t_food_has_ingredient', 't_food.a_food_id', '=', 't_food_has_ingredient.a_food_id')
                .join('t_ingredient', 't_food_has_ingredient.a_ingr_id', "=", "t_ingredient.a_ingr_id")
                .leftOuterJoin('t_food_has_characteristic', 't_food.a_food_id', '=', 't_food_has_characteristic.a_food_id')
                .join('t_characteristic', 't_food_has_characteristic.a_char_id', "=", "t_characteristic.a_char_id")
                .whereIn('t_type.a_type_id', a_type_ids)
                .where(function() { 
                    this.where('t_food.a_title', 'ilike', input_pg_regex)
                    .orWhere('t_food.a_description', 'ilike', input_pg_regex)
                    .orWhere('t_type.a_type_name', 'ilike', input_pg_regex)
                    .orWhere('t_ingredient.a_ingr_name', 'ilike', input_pg_regex)
                    .orWhere('t_characteristic.a_char_name', 'ilike', input_pg_regex)
                })
        }

        if (!Array.isArray(foods)) {
            foods = [foods];
        }

        if (!foods) {
            foods = [];
        }

        let foodsMap = {};
        
        foods.forEach((current) => {

            if (!foodsMap[current.a_food_id]) {
                foodsMap[current.a_food_id] = {};
                foodsMap[current.a_food_id].a_ingr_ids = [];
                foodsMap[current.a_food_id].a_char_ids = [];
            }

            if (current.a_ingr_id) {
                foodsMap[current.a_food_id].a_ingr_ids.push(current.a_ingr_id);
            }
            if (current.a_char_id) {
                foodsMap[current.a_food_id].a_char_ids.push(current.a_char_id)
            }
        });

        foods = Object.keys(foodsMap)
            .filter((food_id) => (!a_ingr_ids || !Array.isArray(a_ingr_ids) || a_ingr_ids.length == 0 || a_ingr_ids.every(v => foodsMap[food_id].a_ingr_ids.includes(v))) 
                && (!a_char_ids || !Array.isArray(a_char_ids) || a_char_ids.length == 0 || a_char_ids.every(v => foodsMap[food_id].a_char_ids.includes(v))))
            .map(key => parseInt(key));

        foods = await this.foodRoute.getFoodsObjects({ filters: {a_food_id: foods}, detailed: true });

        return res.status(200).json({result: foods});
    }

}