const message = require('../interface').message;

module.exports = class RestaurantChainRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/restaurant_chain')
            .post(this.addChain.bind(this))
            .get(this.getAll.bind(this));

        app.route('/restaurant_chain/:id')
            .put(this.editChain.bind(this))
            .get(this.getChain.bind(this))
            .delete(this.delChain.bind(this));

    }

    async getAll(req, res) {
        try {
            const chain = this.getRestaurantChainsObjects();
            res.status(200).json(message.fetch('restaurant chain', chain));
        } catch (error) {
            console.log(error);
        }
    }

    async addChain(req, res) {
        let {name, score = null, image_url = null} = req.body;

        const params = {
            name: [name, typeof(name) === 'string'],
            score: [score, (score == null || Number.isInteger(score))],
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
            
            res.status(400).json(message.badRequest('restaurant chain', aux, errors));
            return;
        }

        name = name.toLowerCase();

        try {
            const chain = await this.server.db('t_restaurant_chain').insert({
                a_name: name,
                a_score: score,
                a_image_url: image_url
            }).returning('*');

            res.status(200).json(message.post('restaurant chain', chain));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('restaurant chain', error.detail, null));
        }
    }

    async editChain(req, res) {
        const { id } = req.params;
        let {name, score = null, image_url = null} = req.body;

        const params = {
            name: [name, typeof(name) === 'string'],
            score: [score, (score == null || Number.isInteger(score))],
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
            
            res.status(400).json(message.badRequest('restaurant chain', aux, errors));
            return;
        }

        name = name.toLowerCase();

        try {
            const chain = await this.server.db('t_restaurant_chain').update({
                a_name: name,
                a_score: score,
                a_image_url: image_url
            }).where({ a_rest_chain_id: id }).returning('*');

            res.status(200).json(message.put('restaurant chain', chain));
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('restaurant chain', error.detail, null));
        }

    }

    async getChain(req, res) {
        const { id } = req.params;

        try {
            const restChain = this.getRestaurantChainsObjects({a_rest_chain_id: id});
            if(!restChain)
                res.status(404).json(message.notFound('t_restaurant_chain', id));
            else 
                res.status(200).json(message.fetch('t_restaurant_chain', restChain));
            
        } catch (error) {
            console.log(error);
        }
    }

    async getRestaurantChainsObjects(filters) {
        let restChains;
        if (!filters)
            restChains = await this.server.db('t_restaurant_chain');
        if (Array.isArray(filters.a_rest_chain_id)) {
            let ids = [...filters.a_rest_chain_id];
            delete filters.a_rest_chain_id;
            restChains = await this.server.db('t_restaurant_chain').whereIn('a_rest_chain_id', ids).where(filters);
        }    
        else
            restChains = await this.server.db('t_restaurant_chain').where(filters);
        if (restChains) {
            return restChains;
        }
        return null;
    }

    async delChain(req, res) {
        const { id } = req.params;
        try {
            const ret = await this.server.db('t_restaurant_chain').where({a_rest_chain_id: id}).del();

            if(ret)
                res.status(200).json(message.delete('restaurant chain', ret));
            else
                res.status(404).json(message.notFound('restaurant chain', id));
        } catch (error) {
            console.log(error);
        }
    }

};