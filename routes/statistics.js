const message = require('../interface').message;

module.exports = class SearchRoute {
    constructor(server) {
        this.server = server;
    }

    initialize(app) {
        app.post('/statistics/restaurant/:restId/views_by_day', this.getRestaurantViewsByDay.bind(this));
        app.post('/statistics/food/:foodId/views_by_day', this.getFoodViewsByDay.bind(this));
    }

    async getRestaurantViewsStatistics(req, res) {
        const {
            restId
        } = req.params;

        /*
            - Cantidad de vistas en el ultimo día (restaurant y comidas)
            - Cantidad de vistas (Por días de la semana, por hora) (restaurant y comidas)
            - Cantidad de usuarios por genero (restaurant y comidas)
            - Cantidad de usuarios por edad (restaurant y comidas)
            - Cantidad de usuarios por características (restaurant y comidas)
            - Mejores 10 comidas (por presentacion, calidad y precio-calidad)
            - Peores 10 comidas (por presentacion, calidad y precio-calidad)
        */

        let info = await this.server.db('t_restaurant')

    }

    async checkOwnership(a_user_id, a_rest_id) {
        try {
            const owns = await this.server.db('t_owns').where({a_user_id, a_rest_id});
            if (owns && owns.length > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async checkPremiumLevel(a_rest_id, minimumLevel) {
        try {
            let rest = await this.server.db('t_restaurant').where({a_rest_id});
            if (rest && rest.length > 0) {
                rest = rest[0];
                return rest.a_premium_level != null && rest.a_premium_level != undefined && !isNaN(rest.a_premium_level) && rest.a_premium_level >= minimumLevel;
            }
            return false;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

    async getRestaurantViewsByDay(req, res) {
        const {
            restId
        } = req.params;

        return this.getViewsByDay('t_restaurant_view', 'a_rest_id', restId, restId, req, res);
    }

    async getFoodViewsByDay(req, res) {
        const {
            foodId
        } = req.params;

        let food = await this.server.db('t_food').where({a_food_id: foodId});

        if (food && food.length > 0) {
            food = food[0];
            const restId = food.a_rest_id; 
            return this.getViewsByDay('t_food_view', 'a_food_id', foodId, restId, req, res);
        }
        else {
            return res.status(404).json(message.notFound('food statistics', foodId));
        }

    }

    async getViewsByDay(table_name, prop_name, prop_value, a_rest_id, req, res) {
        const {
            a_user_id
        } = req.user;
        
        let {
            a_first_date,
            a_last_date = null
        } = req.body;

        try {
            const owns = await this.checkOwnership(a_user_id, a_rest_id);
            if (!owns) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));
            }

            const isAllowed = await this.checkPremiumLevel(a_rest_id, 2);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
            }

            console.log("Hello world");
            // Do Stuff
            if (a_last_date == null || a_last_date === "") {
                a_last_date = new Date().toISOString();
                console.log(a_last_date);
            }
            const info = await this.server.db(table_name).where(prop_name, '=', prop_value).where('a_time', '>=', a_first_date).where('a_time', '<=', a_last_date);
            console.log(info);

            return res.status(200).json(message.fetch('views', info));

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
        
    }

}