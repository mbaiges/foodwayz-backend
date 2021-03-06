const message = require('../interface').message;
const premiumLevels = {
    getBestWorstFood: 0,
    getRestaurantViewsByDay: 1,
    getRestaurantViewsByHour: 1,
    getFoodViewsByDay: 1,
    getFoodViewsByHour: 1,
    getRestaurantUserStatistics: 2,
    getFoodUserStatistics: 3,
}
const MINUTES_SPACED_VIEW = 10;

module.exports = class StatisticRoute {
    constructor(server) {
        this.server = server;
    }

    initialize(app) {
        app.post('/statistics/restaurant/:restId/best_worst_food', this.getBestWorstFood.bind(this));
        app.post('/statistics/restaurant/:restId/views_by_day', this.getRestaurantViewsByDay.bind(this));
        app.post('/statistics/restaurant/:restId/views_by_hour', this.getRestaurantViewsByHour.bind(this));
        app.post('/statistics/restaurant/:restId/user', this.getRestaurantUserStatistics.bind(this));
        app.post('/statistics/food/:foodId/views_by_day', this.getFoodViewsByDay.bind(this));
        app.post('/statistics/food/:foodId/views_by_hour', this.getFoodViewsByHour.bind(this));
        app.post('/statistics/food/:foodId/user', this.getFoodUserStatistics.bind(this));
    }

    async getBestWorstFood(req, res) {

        const { restId } = req.params;
        const { a_user_id } = req.user;
        const { limit } = req.body;

        try {
            if(!Number.isInteger(limit))
                return res.status(400).json(message.badRequest('restaurant statistics', 'limit', 'not an integer'));

            if(!(await this.checkOwnership(a_user_id, restId)))
            return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));

            if(!(await this.checkPremiumLevel(restId, premiumLevels.getBestWorstFood)))
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));

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

            a_food_quality_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_food_quality_score_best}, detailed: true}).then(resp => a_food_quality_score_best = resp);

            a_presentation_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_presentation_score_best}, detailed: true}).then(resp => a_presentation_score_best = resp);

            a_price_quality_score_best = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_price_quality_score_best}, detailed: true}).then(resp => a_price_quality_score_best = resp);
            
            a_food_quality_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_food_quality_score_worst}, detailed: true}).then(resp => a_food_quality_score_worst = resp);

            a_presentation_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_presentation_score_worst}, detailed: true}).then(resp => a_presentation_score_worst = resp);

            a_price_quality_score_worst = this.foodRoute.getFoodsObjects({filters: {a_food_id: a_price_quality_score_worst}, detailed: true}).then(resp => a_price_quality_score_worst = resp);

            await Promise.all([a_food_quality_score_best, a_presentation_score_best, a_price_quality_score_best, a_food_quality_score_worst, a_presentation_score_worst, a_price_quality_score_worst]);
            
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
            - Cantidad de vistas en el ultimo d??a (restaurant y comidas)
            - Cantidad de vistas (Por d??as de la semana, por hora) (restaurant y comidas)
            - Cantidad de usuarios por genero (restaurant y comidas)
            - Cantidad de usuarios por edad (restaurant y comidas)
            - Cantidad de usuarios por caracter??sticas (restaurant y comidas)
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

        const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getRestaurantViewsByHour);
        if (!isAllowed) {
            return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
        }

        return this.getViewsByHour('t_restaurant_view', 'a_rest_id', restId, req, res);
    }

    async getFoodViewsByHour(req, res) {
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

            const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getFoodViewsByHour);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('food statistics', 'not enough premium level'));
            }

            return this.getViewsByHour('t_food_view', 'a_food_id', foodId, req, res);
        }
        else {
            return res.status(404).json(message.notFound('food statistics', foodId));
        }

    }

    async getViewsByHour(table_name, prop_name, prop_value, req, res) {
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

        try {
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

            allViews.forEach(curr => {
                viewsByHour[curr.getHours()] += 1;
            });

            return res.status(200).json(message.fetch('views', viewsByHour));

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
        
    }

    async getRestaurantUserStatistics(req, res) {
        const {
            a_user_id
        } = req.user;
        
        const {
            restId
        } = req.params;

        let {
            a_first_date = null,
            a_last_date = null
        } = req.body;

        if (a_last_date == null || a_last_date === "") {
            a_last_date = new Date().toISOString();
        }

        try {

            const a_rest_id = restId;

            const owns = await this.checkOwnership(a_user_id, a_rest_id);
            if (!owns) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not an owner'));
            }

            const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getRestaurantUserStatistics);
            if (!isAllowed) {
                return res.status(401).json(message.unauth('restaurant statistics', 'not enough premium level'));
            }

            let a_users_info = {};

            // Views

            let viewsInfo;
            
            if (a_first_date) {
                viewsInfo = await this.server.db
                    .select(
                        't_user.a_user_id as a_user_id', 
                        't_user.a_gender as a_gender',
                        't_restaurant_view.a_time as a_time'
                    )
                    .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                    .from('t_restaurant_view')
                    .join('t_user', 't_restaurant_view.a_user_id', '=', 't_user.a_user_id')
                    .where({a_rest_id: restId})
                    .where('a_time', '>=', a_first_date)
                    .where('a_time', '<=', a_last_date);
            } else {
                viewsInfo = await this.server.db
                    .select(
                        't_user.a_user_id as a_user_id', 
                        't_user.a_gender as a_gender',
                        't_restaurant_view.a_time as a_time'
                    )
                    .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                    .from('t_restaurant_view')
                    .join('t_user', 't_restaurant_view.a_user_id', '=', 't_user.a_user_id')
                    .where({a_rest_id: restId})
                    .where('a_time', '<=', a_last_date);
            }

            let a_views_info = {
                a_gender: {},
                a_age: {},
                a_characteristic: {}
            };

            if (!Array.isArray(viewsInfo)) {
                viewsInfo = [];
            }

            const viewsByUser = this.getSpacedViewsByUser(viewsInfo);

            if (!this.userHasCharRoute) {
                const UserHasCharacteristic = require('./user_characteristic');
                this.userHasCharRoute = new UserHasCharacteristic(this.server);
            }

            const charsByUser1 = {};

            const userIds1 = Object.keys(viewsByUser);
            for (let k = 0; k < userIds1.length; k++) {
                charsByUser1[userIds1[k]] = (await this.userHasCharRoute.getCharsByUserObjects(userIds1[k])).map(c => c.a_char_name);
            }

            Object.values(viewsByUser).reduce((acum, curr) => [...acum, ...curr], []).forEach(info => {
                if (info.a_gender != null) {
                    if (!a_views_info.a_gender[info.a_gender]) {
                        a_views_info.a_gender[info.a_gender] = 0;
                    }
                    a_views_info.a_gender[info.a_gender] += 1;
                }

                if (info.a_age != null) {
                    if (!a_views_info.a_age[info.a_age]) {
                        a_views_info.a_age[info.a_age] = 0;
                    }
                    a_views_info.a_age[info.a_age] += 1;
                }

                if (Array.isArray(charsByUser1[info.a_user_id])) {
                    charsByUser1[info.a_user_id].forEach(char => {
                        if (!a_views_info.a_characteristic[char]) {
                            a_views_info.a_characteristic[char] = 0;
                        }
                        a_views_info.a_characteristic[char] += 1;
                    });
                }
            });

            // Reviews

            let reviewsInfo;
            
            if (a_first_date) {
                reviewsInfo = await this.server.db
                    .select(
                        't_user.a_user_id as a_user_id', 
                        't_user.a_gender as a_gender',
                        't_review.a_score as a_score'
                    )
                    .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                    .from('t_review')
                    .join('t_user', 't_review.a_user_id', '=', 't_user.a_user_id')
                    .join('t_food', 't_review.a_food_id', '=', 't_food.a_food_id')
                    .where('t_food.a_rest_id', '=', restId)
                    .where('t_review.a_created_at', '>=', a_first_date)
                    .where('t_review.a_created_at', '<=', a_last_date);
            } else {
                reviewsInfo = await this.server.db
                    .select(
                        't_user.a_user_id as a_user_id', 
                        't_user.a_gender as a_gender',
                        't_review.a_score as a_score'
                    )
                    .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                    .from('t_review')
                    .join('t_user', 't_review.a_user_id', '=', 't_user.a_user_id')
                    .join('t_food', 't_review.a_food_id', '=', 't_food.a_food_id')
                    .where('t_food.a_rest_id', '=', restId)
                    .where('t_review.a_created_at', '<=', a_last_date);
            }

            let a_reviews_info = {
                a_gender: {},
                a_age: {},
                a_characteristic: {}
            };

            const charsByUser2 = {};

            const userIds2 = reviewsInfo.map(i => i.a_user_id);
            for (let k = 0; k < userIds2.length; k++) {
                charsByUser2[userIds2[k]] = (await this.userHasCharRoute.getCharsByUserObjects(userIds2[k])).map(c => c.a_char_name);
            }

            reviewsInfo.forEach(info => {

                if (info.a_gender != null) {
                    if (!a_reviews_info.a_gender[info.a_gender]) {
                        a_reviews_info.a_gender[info.a_gender] = {};
                    }
                    if (!a_reviews_info.a_gender[info.a_gender][info.a_user_id]) {
                        a_reviews_info.a_gender[info.a_gender][info.a_user_id] = {
                            a_score: 0,
                            a_amount: 0
                        }
                    }
                    a_reviews_info.a_gender[info.a_gender][info.a_user_id].a_score += parseFloat(info.a_score);
                    a_reviews_info.a_gender[info.a_gender][info.a_user_id].a_amount += 1;
                }

                if (info.a_age != null) {
                    if (!a_reviews_info.a_age[info.a_age]) {
                        a_reviews_info.a_age[info.a_age] = {};
                    }
                    if (!a_reviews_info.a_age[info.a_age][info.a_user_id]) {
                        a_reviews_info.a_age[info.a_age][info.a_user_id] = {
                            a_score: 0,
                            a_amount: 0
                        }
                    }
                    a_reviews_info.a_age[info.a_age][info.a_user_id].a_score += parseFloat(info.a_score);
                    a_reviews_info.a_age[info.a_age][info.a_user_id].a_amount += 1;
                }

                if (Array.isArray(charsByUser2[info.a_user_id])) {
                    charsByUser2[info.a_user_id].forEach(char => {
                        if (!a_reviews_info.a_characteristic[char]) {
                            a_reviews_info.a_characteristic[char] = {};
                        }
                        if (!a_reviews_info.a_characteristic[char][info.a_user_id]) {
                            a_reviews_info.a_characteristic[char][info.a_user_id] = {
                                a_score: 0,
                                a_amount: 0
                            }
                        }
                        a_reviews_info.a_characteristic[char][info.a_user_id].a_score += parseFloat(info.a_score);
                        a_reviews_info.a_characteristic[char][info.a_user_id].a_amount += 1;
                    });
                }
            });

            Object.entries(a_reviews_info).forEach(([key, type]) => {
                Object.entries(type).forEach(([typeName, map]) => {
                    let newObject = {
                        a_score: 0,
                        a_amount: 0
                    };

                    newObject.a_score = Object.values(map).reduce((acum, curr) => acum += parseFloat(curr.a_score / curr.a_amount), 0);
                    newObject.a_amount = Object.keys(map).length;
                    newObject.a_score /= newObject.a_amount;

                    a_reviews_info[key][typeName] = newObject;
                });
            });

            a_users_info = {a_views_info, a_reviews_info};
            
            return res.status(200).json(message.fetch('restaurant user statistics', a_users_info))

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
    }

    async getFoodUserStatistics(req, res) {
        const {
            a_user_id
        } = req.user;

        const {
            foodId
        } = req.params;

        let {
            a_first_date = null,
            a_last_date = null
        } = req.body;

        if (a_last_date == null || a_last_date === "") {
            a_last_date = new Date().toISOString();
        }

        try {

            let food = await this.server.db('t_food').where({a_food_id: foodId});

            if (food && food.length > 0) {
                
                food = food[0];
                const a_rest_id = food.a_rest_id;

                const owns = await this.checkOwnership(a_user_id, a_rest_id);
                if (!owns) {
                    return res.status(401).json(message.unauth('food statistics', 'not an owner'));
                }

                const isAllowed = await this.checkPremiumLevel(a_rest_id, premiumLevels.getFoodUserStatistics);
                if (!isAllowed) {
                    return res.status(401).json(message.unauth('food statistics', 'not enough premium level'));
                }

                let a_users_info = {};

                // Views

                let viewsInfo;
                
                if (a_first_date) {
                    viewsInfo = await this.server.db
                        .select(
                            't_user.a_user_id as a_user_id', 
                            't_user.a_gender as a_gender',
                            't_food_view.a_time as a_time'
                        )
                        .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                        .from('t_food_view')
                        .join('t_user', 't_food_view.a_user_id', '=', 't_user.a_user_id')
                        .where({a_food_id: foodId})
                        .where('a_time', '>=', a_first_date)
                        .where('a_time', '<=', a_last_date);
                } else {
                    viewsInfo = await this.server.db
                        .select(
                            't_user.a_user_id as a_user_id', 
                            't_user.a_gender as a_gender',
                            't_food_view.a_time as a_time'
                        )
                        .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                        .from('t_food_view')
                        .join('t_user', 't_food_view.a_user_id', '=', 't_user.a_user_id')
                        .where({a_food_id: foodId})
                        .where('a_time', '<=', a_last_date);
                }

                let a_views_info = {
                    a_gender: {},
                    a_age: {},
                    a_characteristic: {}
                };

                if (!Array.isArray(viewsInfo)) {
                    viewsInfo = [];
                }

                const viewsByUser = this.getSpacedViewsByUser(viewsInfo);

                if (!this.userHasCharRoute) {
                    const UserHasCharacteristic = require('./user_characteristic');
                    this.userHasCharRoute = new UserHasCharacteristic(this.server);
                }

                const charsByUser1 = {};

                const userIds1 = Object.keys(viewsByUser);
                for (let k = 0; k < userIds1.length; k++) {
                    charsByUser1[userIds1[k]] = (await this.userHasCharRoute.getCharsByUserObjects(userIds1[k])).map(c => c.a_char_name);
                }

                Object.values(viewsByUser).reduce((acum, curr) => [...acum, ...curr], []).forEach(info => {
                    if (info.a_gender != null) {
                        if (!a_views_info.a_gender[info.a_gender]) {
                            a_views_info.a_gender[info.a_gender] = 0;
                        }
                        a_views_info.a_gender[info.a_gender] += 1;
                    }

                    if (info.a_age != null) {
                        if (!a_views_info.a_age[info.a_age]) {
                            a_views_info.a_age[info.a_age] = 0;
                        }
                        a_views_info.a_age[info.a_age] += 1;
                    }

                    if (Array.isArray(charsByUser1[info.a_user_id])) {
                        charsByUser1[info.a_user_id].forEach(char => {
                            if (!a_views_info.a_characteristic[char]) {
                                a_views_info.a_characteristic[char] = 0;
                            }
                            a_views_info.a_characteristic[char] += 1;
                        });
                    }
                });

                // Reviews

                let reviewsInfo;
                
                if (a_first_date) {
                    reviewsInfo = await this.server.db
                        .select(
                            't_user.a_user_id as a_user_id', 
                            't_user.a_gender as a_gender',
                            't_review.a_score as a_score'
                        )
                        .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                        .from('t_review')
                        .join('t_user', 't_review.a_user_id', '=', 't_user.a_user_id')
                        .where('t_review.a_food_id', '=', foodId)
                        .where('t_review.a_created_at', '>=', a_first_date)
                        .where('t_review.a_created_at', '<=', a_last_date);
                } else {
                    reviewsInfo = await this.server.db
                        .select(
                            't_user.a_user_id as a_user_id', 
                            't_user.a_gender as a_gender',
                            't_review.a_score as a_score'
                        )
                        .select(this.server.db.raw("DATE_PART('year', AGE(NOW(), t_user.a_birthdate)) as a_age"))
                        .from('t_review')
                        .join('t_user', 't_review.a_user_id', '=', 't_user.a_user_id')
                        .where('t_review.a_food_id', '=', foodId)
                        .where('t_review.a_created_at', '<=', a_last_date);
                }

                let a_reviews_info = {
                    a_gender: {},
                    a_age: {},
                    a_characteristic: {}
                };

                const charsByUser2 = {};

                const userIds2 = reviewsInfo.map(i => i.a_user_id);
                for (let k = 0; k < userIds2.length; k++) {
                    charsByUser2[userIds2[k]] = (await this.userHasCharRoute.getCharsByUserObjects(userIds2[k])).map(c => c.a_char_name);
                }

                reviewsInfo.forEach(info => {

                    if (info.a_gender != null) {
                        if (!a_reviews_info.a_gender[info.a_gender]) {
                            a_reviews_info.a_gender[info.a_gender] = {};
                        }
                        if (!a_reviews_info.a_gender[info.a_gender][info.a_user_id]) {
                            a_reviews_info.a_gender[info.a_gender][info.a_user_id] = {
                                a_score: 0,
                                a_amount: 0
                            }
                        }
                        a_reviews_info.a_gender[info.a_gender][info.a_user_id].a_score += parseFloat(info.a_score);
                        a_reviews_info.a_gender[info.a_gender][info.a_user_id].a_amount += 1;
                    }
    
                    if (info.a_age != null) {
                        if (!a_reviews_info.a_age[info.a_age]) {
                            a_reviews_info.a_age[info.a_age] = {};
                        }
                        if (!a_reviews_info.a_age[info.a_age][info.a_user_id]) {
                            a_reviews_info.a_age[info.a_age][info.a_user_id] = {
                                a_score: 0,
                                a_amount: 0
                            }
                        }
                        a_reviews_info.a_age[info.a_age][info.a_user_id].a_score += parseFloat(info.a_score);
                        a_reviews_info.a_age[info.a_age][info.a_user_id].a_amount += 1;
                    }
    
                    if (Array.isArray(charsByUser2[info.a_user_id])) {
                        charsByUser2[info.a_user_id].forEach(char => {
                            if (!a_reviews_info.a_characteristic[char]) {
                                a_reviews_info.a_characteristic[char] = {};
                            }
                            if (!a_reviews_info.a_characteristic[char][info.a_user_id]) {
                                a_reviews_info.a_characteristic[char][info.a_user_id] = {
                                    a_score: 0,
                                    a_amount: 0
                                }
                            }
                            a_reviews_info.a_characteristic[char][info.a_user_id].a_score += parseFloat(info.a_score);
                            a_reviews_info.a_characteristic[char][info.a_user_id].a_amount += 1;
                        });
                    }

                });

                Object.entries(a_reviews_info).forEach(([key, type]) => {
                    console.log(type);
                    Object.entries(type).forEach(([typeName, map]) => {
                        let newObject = {
                            a_score: 0,
                            a_amount: 0
                        };
    
                        console.log(typeName, map);

                        newObject.a_score = Object.values(map).reduce((acum, curr) => acum += parseFloat(curr.a_score / curr.a_amount), 0);
                        newObject.a_amount = Object.keys(map).length;
                        newObject.a_score /= newObject.a_amount;
    
                        a_reviews_info[key][typeName] = newObject;
                    });
                });

                a_users_info = {a_views_info, a_reviews_info};
                
                return res.status(200).json(message.fetch('food user statistics', a_users_info))
            }
            else {
                return res.status(404).json(message.notFound('food statistics', foodId));
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({message: error.message});
        }
    }

    getSpacedViewsByUser(info) {
        let viewsByUser = {};
        if (Array.isArray(info) && info.length > 0) {

                // Comment this when it all works.
                info = info.sort((a, b) => a.a_time - b.a_time);

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
                        if ( (time - (viewsByUser[user])[viewsByUser[user].length - 1].a_time) > MINUTES_SPACED_VIEW * 60 * 1000) {
                            viewsByUser[user].push(info[j]);
                        }
                    }
                }
            }

        return viewsByUser;
    }

}