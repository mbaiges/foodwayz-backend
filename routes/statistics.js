const message = require('../interface').message;

module.exports = class SearchRoute {
    constructor(server) {
        this.server = server;
    }

    initialize(app) {
        app.post('/statistics/restaurant/:restId', this.getRestaurantViewsByDay.bind(this));
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
            if (owns && owns.length > 1) {
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
                return rest.a_premium_level != null && rest.a_premium_level != undefined && !isNan(rest.a_premium_level) && rest.a_premium_level >= minimumLevel;
            }
            return false;
        }
        catch(error) {
            console.log(error);
            return false;
        }
    }

    async getRestaurantViewsByDay(req, res) {
        
    }

    async getViewsByDay(req, res) {
        const {
            a_user_id
        } = req.user;

        const {
            restId
        } = req.params;
        
        const {
            a_first_date,
            a_last_date
        } = req.body;

        try {
            const owns = await this.checkOwnership(a_user_id, restId);
            if (!owns) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));
            }

            const isAllowed = await this.checkOwnershipLevel(restId, 2);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
            }

            console.log("Hello world");
        } catch (error) {
            console.log(error);
        }
        
    }

}