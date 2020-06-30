const message = require('../interface').message;
const RestaurantRoute = require('./restaurant');
const TypeRoute = require('./type');

module.exports = class FoodRoute {
    constructor(server) {
        this.server = server;
        this.restaurantRoute = new RestaurantRoute(server);
        this.typeRoute = new TypeRoute(server);
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
            const foods = await this.getFoodsObjects();
            res.status(200).json(message.fetch('foods', foods));
        } catch (error) {
            console.log(error);
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

            const food = await this.server.db('t_food').insert({
                a_title: a_title,
                a_description: a_description,
                a_score: a_score,
                a_type_id: a_type_id,
                a_rest_id: a_rest_id,
                a_image_url: a_image_url
            }).returning("*");

            res.status(200).json(message.post('food', food));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async editFood(req, res) {
        const { id } = req.params;
        const {a_title, a_description, a_score = null, a_type_id = null, a_image_url = null} = req.body
        
        const params = {
            a_title: [a_title, typeof(a_title) === 'string'],
            a_description: [a_description, typeof(a_description) === 'string'],
            a_score: [a_score, (a_score == null || Number.isInteger(a_score))],
            a_type_id: [a_type_id, (a_type_id == null || Number.isInteger(a_type_id))],
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
            let col_type = null, col_score = null, col_img = null;
            if(a_type_id != null) {
                col_type = 'a_type_id';
            }
            if(a_score != null) {
                col_score = 'a_score';
            }
            if(a_image_url != null) {
                col_img = 'a_image_url';
            }


            const cant = await this.server.db('t_food')
                        .update('a_title', a_title,'a_description', a_description, col_score, a_score, col_type, a_type_id, col_img, a_image_url).where({a_food_id: id});

            if(cant)
                res.status(200).json(message.put('food', cant));
            else
                res.status(404).json(message.notFound('food', id));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async getFood(req, res) {
        const {id} = req.params;
        try {
            let food = await this.getFoodsObjects({a_food_id: id});
            if(food.length !== 0) {
                res.status(200).json(message.fetch('food', food));
            }
            else {
                res.status(404).json(message.notFound('food', id));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getFoodsObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters, detailed } = cfg;
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
        let rest, type;
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
                if (detailed) {}
            }
            return foods;
        }
        return null;
    }

    async delFood(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_food').where({a_food_id: id}).del();

            if(ret)
                res.status(200).json(message.delete('food', ret));
            else
                res.status(404).json(message.notFound('food', id));
        } catch (error) {
            console.log(error);
        }
    }
};