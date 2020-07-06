const message = require('../interface').message;
const premiumLevels = {
    getBestWorstFood: 2,
    getRestaurantViewsByDay: 2,
    getFoodViewsByDay: 2,
}

module.exports = class StatisticRoute {
    constructor(server) {
        this.server = server;
    }

    initialize(app) {
        app.post('/statistics/restaurant/:restId/best_worst_food', this.getBestWorstFood.bind(this));
        app.post('/statistics/restaurant/:restId/views_by_day', this.getRestaurantViewsByDay.bind(this));
        app.post('/statistics/restaurant/:restId/views_by_hour', this.getRestaurantViewsByHour.bind(this));
        app.post('/statistics/food/:foodId/views_by_day', this.getFoodViewsByDay.bind(this));
        app.post('/statistics/food/:foodId/views_by_hour', this.getFoodViewsByHour.bind(this));
        app.post('/statistics/food/:foodId/user', this.getFoodUserStatistics.bind(this));
    }

    async getBestWorstFood(req, res) {

        const { restId } = req.params;
        const { a_user_id } = req.user;
        const { limit } = req.body;

        try {
            if(!(await this.checkOwnership(a_user_id, restId)))
            return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));

            if(!(await this.checkPremiumLevel(restId, premiumLevels.getBestWorstFood)))
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));

            if(!Number.isInteger(limit))
                return res.status(400).json(message.badRequest('restaurant statistics', 'limit', 'not an integer'));

            if (!this.foodRoute) {
                const FoodRoute = require('./food');
                this.foodRoute = new FoodRoute(this.server);
            }
        
            let a_food_quality_score_best = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_food_quality_score', 'desc').limit(limit)
                .then(resp => a_food_quality_score_best = resp.map(i => i.a_food_id));

            let a_presentation_score_best = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_presentation_score', 'desc').limit(limit)
                .then(resp => a_presentation_score_best = resp.map(i => i.a_food_id));

            let a_price_quality_score_best = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_price_quality_score', 'desc').limit(limit)
                .then(resp => a_price_quality_score_best = resp.map(i => i.a_food_id));
            
            let a_food_quality_score_worst = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_food_quality_score').limit(limit)
                .then(resp => a_food_quality_score_worst = resp.map(i => i.a_food_id));

            let a_presentation_score_worst = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_presentation_score').limit(limit)
                .then(resp => a_presentation_score_worst = resp.map(i => i.a_food_id));

            let a_price_quality_score_worst = this.server.db('t_food').select('a_food_id').where({a_rest_id: restId}).orderBy('a_price_quality_score').limit(limit)
                .then(resp => a_price_quality_score_worst = resp.map(i => i.a_food_id));

            await Promise.all([a_food_quality_score_best, a_presentation_score_best, a_price_quality_score_best, a_food_quality_score_worst, a_presentation_score_worst, a_price_quality_score_worst]);

            a_food_quality_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_food_quality_score_best}}).then(resp => a_food_quality_score_best = resp);

            a_presentation_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_presentation_score_best}}).then(resp => a_presentation_score_best = resp);

            a_price_quality_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_price_quality_score_best}}).then(resp => a_price_quality_score_best = resp);
            
            a_food_quality_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_food_quality_score_worst}}).then(resp => a_food_quality_score_worst = resp);

            a_presentation_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_presentation_score_worst}}).then(resp => a_presentation_score_worst = resp);

            a_price_quality_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_price_quality_score_worst}}).then(resp => a_price_quality_score_worst = resp);

            await Promise.all([a_food_quality_score_best, a_presentation_score_best, a_price_quality_score_best, a_food_quality_score_worst, a_presentation_score_worst, a_price_quality_score_worst]);
            console.log(a_price_quality_score_worst);
            
            const result = {
                "a_best": {
                    "a_food_quality_score": a_food_quality_score_best,
                    "a_presentation_score": a_presentation_score_best,
                    "a_price_quality_score": a_price_quality_score_best 
                },
                "a_worst": {
                    "a_food_quality_score": a_food_quality_score_worst,
                    "a_presentation_score": a_presentation_score_worst,
                    "a_price_quality_score": a_price_quality_score_worst 
                }
            }

            res.status(200).json(message.fetch('best and worst foods', result));
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
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
            a_user_id
        } = req.user;

        const {
            restId
        } = req.params;

        const a_rest_id = restId;

        const owns = await this.checkOwnership(a_user_id, a_rest_id);
        if (!owns) {
            return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));
        }

        const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getRestaurantViewsByDay);
        if (!isAllowed) {
            return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
        }

        return this.getViewsByDay('t_restaurant_view', 'a_rest_id', restId, req, res);
    }

    async getFoodViewsByDay(req, res) {
        const {
            a_user_id
        } = req.user;
        
        const {
            foodId
        } = req.params;

        let food = await this.server.db('t_food').where({a_food_id: foodId});

        if (food && food.length > 0) {
            
            food = food[0];
            const a_rest_id = food.a_rest_id;

            const owns = await this.checkOwnership(a_user_id, a_rest_id);
            if (!owns) {
                return res.status(401).json(message.unauth('food statistics', 'not an owner'));
            }

            const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getFoodViewsByDay);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('food statistics', 'not enough premium level'));
            }


            return this.getViewsByDay('t_food_view', 'a_food_id', foodId, req, res);
        }
        else {
            return res.status(404).json(message.notFound('food statistics', foodId));
        }

    }

    async getViewsByDay(table_name, prop_name, prop_value, req, res) {
        let {
            a_first_date,
            a_last_date = null
        } = req.body;

        try {
            // Do Stuff
            if (a_last_date == null || a_last_date === "") {
                a_last_date = new Date().toISOString();
                console.log(a_last_date);
            }
            let info = await this.server.db(table_name).where(prop_name, '=', prop_value).where('a_time', '>=', a_first_date).where('a_time', '<=', a_last_date);

            let viewsByUser = this.getSpacedViewsByUser(info);

            Object.entries(viewsByUser).forEach(e => {
                viewsByUser[e[0]] = e[1].map(l => l.a_time);
            });

            // mapea las vistas de usuarios de la forma {"1":[vista1, vista2]} a un array de tipo [a_time1, a_time2..]

            const allViews = Object.values(viewsByUser)
                .reduce((acum, curr) => acum = [...acum, ...curr], [])
                .sort();

            let viewsByDay = {};

            allViews.forEach(curr => {
                let midnightedDay = curr;
                midnightedDay.setHours(0,0,0,0)
                if (!viewsByDay[midnightedDay]) {
                    viewsByDay[midnightedDay] = 0;
                }
                viewsByDay[midnightedDay] += 1;
            });

            viewsByDay = Object.entries(viewsByDay).map(entry => Object.assign({a_time: entry[0], a_amount: entry[1]}));

            return res.status(200).json(message.fetch('views', viewsByDay));

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
        
    }

    async getRestaurantViewsByHour(req, res) {
        const {
            restId
        } = req.params;

        return this.getViewsByHour('t_restaurant_view', 'a_rest_id', restId, restId, req, res);
    }

    async getFoodViewsByHour(req, res) {
        const {
            foodId
        } = req.params;

        let food = await this.server.db('t_food').where({a_food_id: foodId});

        if (food && food.length > 0) {
            food = food[0];
            const restId = food.a_rest_id;
            return this.getViewsByHour('t_food_view', 'a_food_id', foodId, restId, req, res);
        }
        else {
            return res.status(404).json(message.notFound('food statistics', foodId));
        }

    }

    async getViewsByHour(table_name, prop_name, prop_value, a_rest_id, req, res) {
        const {
            a_user_id
        } = req.user;
        
        let {
            a_date
        } = req.body;

        let a_first_date, a_last_date;

        if (!a_date || a_date === "") {
            a_date = new Date().toISOString();
        }

        a_first_date = new Date(a_date);
        a_first_date.setHours(0,0,0,0);
        a_last_date = new Date(a_date);
        a_last_date.setHours(23,59,59,999);

        console.log(a_first_date, a_last_date);

        try {
            const owns = await this.checkOwnership(a_user_id, a_rest_id);
            if (!owns) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));
            }

            const isAllowed = await this.checkPremiumLevel(a_rest_id, 2);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
            }

            // Do Stuff

            let info = await this.server.db(table_name).where(prop_name, '=', prop_value).where('a_time', '>=', a_first_date).where('a_time', '<=', a_last_date);

            let viewsByUser = this.getSpacedViewsByUser(info);

            Object.entries(viewsByUser).forEach(e => {
                viewsByUser[e[0]] = e[1].map(l => l.a_time);
            });

            // mapea las vistas de usuarios de la forma {"1":[vista1, vista2]} a un array de tipo [a_time1, a_time2..]

            const allViews = Object.values(viewsByUser)
                .reduce((acum, curr) => acum = [...acum, ...curr], [])
                .sort();

            let viewsByHour = new Array(24).fill(0);

            console.log(viewsByHour);

            allViews.forEach(curr => {
                viewsByHour[curr.getHours()] += 1;
            });

            return res.status(200).json(message.fetch('views', viewsByHour));

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
        
    }

    async getFoodUserStatistics(req, res) {
        const {
            foodId
        } = req.params;

        let {
            a_first_date = null,
            a_last_date = null
        } = req.body;

        if (a_last_date == null || a_last_date === "") {
            a_last_date = new Date().toISOString();
            console.log(a_last_date);
        }

        try {

            let a_users_info = {};

            // Views

            let viewsInfo;
            
            if (a_first_date) {
                viewsInfo = await this.server.db('t_food_view').where({a_food_id: foodId}).where('a_time', '>=', a_first_date).where('a_time', '<=', a_last_date);
            } else {
                viewsInfo = await this.server.db('t_food_view').where({a_food_id: foodId}).where('a_time', '<=', a_last_date);
            }

            let a_views_info = {};

            if (!Array.isArray(viewsInfo)) {
                viewsInfo = [];
            }

            console.log(viewsInfo);
            
            
            let a_reviews_info = {};
            

            a_users_info = {a_views_info, a_reviews_info};
            
            return res.status(200).json(message.fetch('food user statistics', a_users_info))

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
    }

    getSpacedViewsByUser(info) {
        let viewsByUser = {};
        if (Array.isArray(info) && info.length > 0) {
                let user, time;

                for (let j = 0; j < info.length; j++) {
                    user = info[j].a_user_id;
                    time = info[j].a_time;
                    
                    if (!viewsByUser[user]) {
                        viewsByUser[user] = [];
                    }

                    if (viewsByUser[user].length === 0) {
                        viewsByUser[user].push(info[j]);
                    }
                    else {
                        if ( (time - (viewsByUser[user])[viewsByUser[user].length - 1]) > 10 * 60 * 1000) {
                            viewsByUser[user].push(info[j]);
                        }
                    }
                }
            }

        return viewsByUser;
    }

}