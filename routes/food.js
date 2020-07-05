const message = require('../interface').message;

module.exports = class FoodRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/food')
            .post(this.addFood.bind(this))
            .get(this.getAll.bind(this));

        app.route('/food/:id')
            .put(this.editFood.bind(this))
            .get(this.getFood.bind(this))
            .delete(this.delFood.bind(this));
    }

    async getAll(req, res) {
        try {
            const foods = await this.getFoodsObjects({ detailed: true });
            res.status(200).json(message.fetch('foods', foods));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addFood(req, res) {
        const {a_title, a_description, a_score = null, a_type_id, a_rest_id, a_image_url = null} = req.body;

        const params = {
            a_title: [a_title, typeof(a_title) === 'string'],
            a_description: [a_description, typeof(a_description) === 'string'],
            a_score: [a_score, (a_score == null || Number.isInteger(a_score))],
            a_type_id: [a_type_id, Number.isInteger(a_type_id)],
            a_rest_id: [a_rest_id, Number.isInteger(a_rest_id)],
            a_image_url: [a_image_url, (a_image_url == null || typeof(a_image_url) === 'string')]
        }
        let errors = {};
        Object.entries(params).forEach(prop => {
            if(!prop[1][1]) {
                errors[prop[0]] = prop[1][0];
            }
        });

        let aux;
        if((aux = Object.keys(errors)).length != 0) {
            
            res.status(400).json(message.badRequest('food', aux, errors));
            return;
        }

        try {

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: a_rest_id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant food add', 'not an owner'));
                return;
            }

            const food = await this.server.db('t_food').insert({
                a_title: a_title,
                a_description: a_description,
                a_score: a_score,
                a_type_id: a_type_id,
                a_rest_id: a_rest_id,
                a_image_url: a_image_url
            }).returning("*");

            res.status(200).json(message.post('food', food[0]));

        } catch (error) {
            console.log(error);
            if(error.detail == null || error.detail == undefined)
                res.status(500).json({message: error.message});
            else
                res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async editFood(req, res) {
        const { id } = req.params;
        const {a_title = null, a_description = null, a_score = null, a_type_id = null, a_image_url = null} = req.body;
        
        const params = {
            a_title: [a_title, (a_title == null || typeof(a_title) === 'string')],
            a_description: [a_description, (a_description == null || typeof(a_description) === 'string')],
            a_score: [a_score, (a_score == null || Number.isInteger(a_score))],
            a_type_id: [a_type_id, (a_type_id == null || Number.isInteger(a_type_id))],
            a_image_url: [a_image_url, (a_image_url == null || typeof(a_image_url) === 'string')]
        };
        let errors = {};
        Object.entries(params).forEach(prop => {
            if(!prop[1][1]) {
                errors[prop[0]] = prop[1][0];
            }
        });

        let aux;
        if((aux = Object.keys(errors)).length != 0) {
            
            res.status(400).json(message.badRequest('food', aux, errors));
            return;
        }

        try {
            let update = {};
            if(a_title != null) {
                update.a_title = a_title;
            }
            if(a_description != null) {
                update.a_description = a_description;
            }
            if(a_type_id != null) {
                update.a_type_id = a_type_id;
            }
            if(a_score != null) {
                update.a_score = a_score;
            }
            if(a_image_url != null) {
                update.a_image_url = a_image_url;
            }
            
            if(Object.keys(update).length == 0) {
                res.status(400).json(message.badRequest('food', id, 'Nothing to be modified'));
                return;
            }

            const food_rest = await this.server.db('t_food').select('a_rest_id').where({a_food_id: id});
            console.log(food_rest);
            if (food_rest.length == 0) {
                res.status(404).json(message.notFound('food', id));
                return;
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: food_rest[0].a_rest_id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant food modify', 'not an owner'));
                return;
            }


            const cant = await this.server.db('t_food')
                        .update(update).where({a_food_id: id});

            if(cant)
                res.status(200).json(message.put('food', cant));
            else
                res.status(404).json(message.notFound('food', id));
        } catch (error) {
            console.log(error);
            if(error.detail == null || error.detail == undefined)
                res.status(500).json({message: error.message});
            else
                res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async getFood(req, res) {
        const {id} = req.params;
        try {
            let food = await this.getFoodsObjects({ filters: {a_food_id: id}, detailed: true });
            if(food) {
                food = food[0];
                res.status(200).json(message.fetch('food', food));
            }
            else {
                res.status(404).json(message.notFound('food', id));
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getFoodsObjects(cfg) {
        if (!this.restaurantRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restaurantRoute = new RestaurantRoute(this.server);
        }
        if (!this.typeRoute) {
            const TypeRoute = require('./type');
            this.typeRoute = new TypeRoute(this.server);
        }

        if (!cfg)
            cfg = {};

        const { filters, detailed, sort_by } = cfg;
        let foods;
        if (!filters)
            foods = await this.server.db('t_food');
        else if (Array.isArray(filters.a_food_id)) {
            let ids = [...filters.a_food_id];
            delete filters.a_food_id;
            foods = await this.server.db('t_food').whereIn('a_food_id', ids).where(filters);
        }    
        else
            foods = await this.server.db('t_food').where(filters);
        let rest, type, ingrs, chars, reviews_info, views_info;
        if (foods) {
            if (!Array.isArray(foods))
                foods = [foods];
            for (let i = 0; i < foods.length; i++) {
                rest = await this.restaurantRoute.getRestaurantsObjects({ filters: {a_rest_id: foods[i].a_rest_id} });
                if (rest) {
                    rest = rest[0];
                    delete foods[i].a_rest_id;
                    foods[i].a_rest = rest;
                }
                type = await this.typeRoute.getTypesObjects({ filters: {a_type_id: foods[i].a_type_id} });
                if (type) {
                    type = type[0];
                    delete foods[i].a_type_id;
                    foods[i].a_type = type;
                }

                if (detailed && detailed === true) {
                    if (!this.foodIngrRoute) {
                        const FoodIngredientRoute = require('./food_ingredient');
                        this.foodIngrRoute = new FoodIngredientRoute(this.server);
                    }
                    if (!this.foodCharRoute) {
                        const FoodCharacteristicRoute = require('./food_characteristic');
                        this.foodCharRoute = new FoodCharacteristicRoute(this.server);
                    }
                    
                    ingrs = await this.foodIngrRoute.getIngrsByFoodObjects(foods[i].a_food_id);
                    foods[i].a_ingredients = ingrs;
                    chars = await this.foodCharRoute.getCharsByFoodObjects(foods[i].a_food_id);
                    foods[i].a_characteristics = chars;

                    reviews_info = await this.server.db.raw(`select 
                        COALESCE(SUM(CASE 
                            WHEN a_score <= 1 THEN 1
                            ELSE 0
                            END),0) as star1,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 1 and a_score <= 2 THEN 1
                            ELSE 0
                            END),0) as star2,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 2 and a_score <= 3 THEN 1
                            ELSE 0
                            END),0) as star3,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 3 and a_score <= 4 THEN 1
                            ELSE 0
                            END),0) as star4,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 4 and a_score <= 5 THEN 1
                            ELSE 0
                            END),0) as star5,
                        COALESCE(SUM(CASE 
                            WHEN a_score <= 1.66 THEN 1
                            ELSE 0
                            END),0) as bad,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 1.66 and a_score <= 3.33 THEN 1
                            ELSE 0
                            END),0) as regular,
                        COALESCE(SUM(CASE 
                            WHEN a_score > 3.33 THEN 1
                            ELSE 0
                            END),0) as good
                        FROM t_review WHERE a_food_id = ${foods[i].a_food_id};
                    `);

                    if (reviews_info) {
                        const info = reviews_info.rows[0];

                        reviews_info = {
                            quantified: [
                                parseInt(info.star1), 
                                parseInt(info.star2), 
                                parseInt(info.star3), 
                                parseInt(info.star4), 
                                parseInt(info.star5)
                            ], 
                            qualified: {
                                bad: parseInt(info.bad), 
                                regular: parseInt(info.regular), 
                                good: parseInt(info.good) 
                            },
                            total: parseInt(info.bad) + parseInt(info.regular) + parseInt(info.good)
                        };

                        foods[i].a_reviews_info = reviews_info;
                    }

                    views_info = await this.server.db('t_food_view').where({a_food_id: foods[i].a_food_id});

                    if (views_info) {
                        console.log(views_info);
                    }
                }
            }

            if (detailed && detailed === true && sort_by) {
                
                if (sort_by === "most_reviews") {
                    foods = foods.sort((a, b) => b.a_reviews_info.total - a.a_reviews_info.total);
                }
                else if (sort_by === "best_rated") {
                    foods = foods.sort((a, b) => a.a_score - b.a_score);
                }
                else if (sort_by === "most_views") {

                }
            }

            return foods;
        }
        return null;
    }

    async delFood(req, res) {
        if (!this.restRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restRoute = new RestaurantRoute(this.server);
        }

        try {
            const { id } = req.params;

            const food_rest = await this.server.db('t_food').select('a_rest_id').where({a_food_id: id});
            if (food_rest.length == 0) {
                res.status(404).json(message.notFound('food', id));
                return;
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: food_rest[0].a_rest_id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant food modify', 'not an owner'));
                return;
            }
            
            const restId = await this.server.db('t_food').select('a_rest_id').where({a_food_id: id});
            const ret = await this.server.db('t_food').where({a_food_id: id}).del();

            if(ret) {
                res.status(200).json(message.delete('food', ret));
                this.restRoute.updateRestScore(restId[0].a_rest_id);
            }
            else
                res.status(404).json(message.notFound('food', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async updateFoodScore(foodId) {
        if (!this.restRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restRoute = new RestaurantRoute(this.server);
        }

        try {
            const revs = (await this.server.db('t_review').select('a_score').where({a_food_id: foodId})).map(r => r.a_score);
            if(revs.length != 0) {
                let sum = 0;
                revs.forEach(v => sum += Number.parseFloat(v));
                await this.server.db('t_food').update({a_score: sum/revs.length}).where({a_food_id: foodId});
                const restId = (await this.server.db('t_food').select('a_rest_id').where({a_food_id: foodId}))[0].a_rest_id;
                this.restRoute.updateRestScore(restId);
            }           
        } catch (error) {
            console.log(error.message);
        }
    }
};