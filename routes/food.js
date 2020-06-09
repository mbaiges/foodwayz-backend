const message = require('../interface').message;
const RestaurantRoute = require('./restaurant');

module.exports = class FoodRoute {
    constructor(server) {
        this.server = server;
        this.restaurantRoute = new RestaurantRoute(server);
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
            const food = await this.server.db('t_food');
            res.status(200).json(message.fetch('foods', food));
        } catch (error) {
            console.log(error);
        }
    }

    async addFood(req, res) {
        const {description, score = null, type_id, rest_id, image_url = null} = req.body;

        const params = {
            description: [description, typeof(description) === 'string'],
            score: [score, (score == null || Number.isInteger(score))],
            type_id: [type_id, Number.isInteger(type_id)],
            rest_id: [rest_id, Number.isInteger(rest_id)],
            image_url: [image_url, (image_url == null || typeof(image_url) === 'string')]
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
                a_description: description,
                a_score: score,
                a_type_id: type_id,
                a_rest_id: rest_id,
                a_image_url: image_url
            }).returning("*");

            res.status(200).json(message.post('food', food));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async editFood(req, res) {
        const { id } = req.params;
        const { description, type_id = null, image_url = null } = req.body;
        
        const params = {
            description: [description, typeof(description) === 'string'],
            type_id: [type_id, (type_id == null || Number.isInteger(type_id))],
            image_url: [image_url, (image_url == null || typeof(image_url) === 'string')]
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
            let col_type = null;
            if(type_id != null) {
                col_type = 'a_type_id';
            }

            const cant = await this.server.db('t_food')
                        .update('a_description', description, col_type, type_id, 'a_image_url', image_url).where({a_food_id: id});

            if(cant == 0)
                res.status(404).json(message.notFound('food', id));
            else
                res.status(200).json(message.put('food', [cant]));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('food', error.detail, null));
        }
    }

    async getFood(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_food').where({a_food_id: id});

            if(ret.length == 0)
                res.status(404).json(message.notFound('food', id));
            else {
                let aux = {};
                await this.restaurantRoute({params: {id: ret.a_rest_id}}, aux);
                let rest;
                if (aux.result) {
                    rest = aux.result.first();
                    delete ret.a_rest_id;
                    ret.a_rest = rest;
                }
                res.status(200).json(message.fetch('food', ret));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async delFood(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_food').where({a_food_id: id}).del();

            if(ret.length == 0)
                res.status(404).json(message.notFound('food', id));
            else
                res.status(200).json(message.delete('food', [ret]));
        } catch (error) {
            console.log(error);
        }
    }
};