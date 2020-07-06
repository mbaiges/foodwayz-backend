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
            const chain = await this.getRestaurantChainsObjects();
            res.status(200).json(message.fetch('restaurant chain', chain));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addChain(req, res) {
        let {a_name, a_score = null, a_image_url = null} = req.body;

        const params = {
            a_name: [a_name, typeof(a_name) === 'string'],
            a_score: [a_score, (a_score == null || Number.isInteger(a_score))],
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
            
            res.status(400).json(message.badRequest('restaurant chain', aux, errors));
            return;
        }

        a_name = a_name.toLowerCase();

        try {
            const chain = await this.server.db('t_restaurant_chain').insert({
                a_name: a_name,
                a_score: a_score,
                a_image_url: a_image_url
            }).returning('*');

            res.status(200).json(message.post('restaurant chain', chain));
        } catch (error) {
            console.log(error);
            if(error.detail == null || error.detail == undefined)
                res.status(500).json({message: error.message});
            else
                res.status(409).json(message.conflict('restaurant chain', error.detail, null));
        }
    }

    async editChain(req, res) {
        const { id } = req.params;
        let {a_name, a_score = null, a_image_url = null} = req.body;

        const params = {
            a_name: [a_name, typeof(a_name) === 'string'],
            a_score: [a_score, (a_score == null || Number.isInteger(a_score))],
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
            
            res.status(400).json(message.badRequest('restaurant chain', aux, errors));
            return;
        }

        a_name = a_name.toLowerCase();

        try {
            const chain = await this.server.db('t_restaurant_chain').update({
                a_name: a_name,
                a_score: a_score,
                a_image_url: a_image_url
            }).where({ a_rest_chain_id: id }).returning('*');

            if(chain.length == 0)
                res.status(404).json(message.notFound('restaurant chain', id));
            else
                res.status(200).json(message.put('restaurant chain', chain));
        } catch (error) {
            console.log(error);
            if(error.detail == null || error.detail == undefined)
                res.status(500).json({message: error.message});
            else
                res.status(409).json(message.conflict('restaurant chain', error.detail, null));
                
        }

    }

    async getChain(req, res) {
        const { id } = req.params;

        try {
            const restChain = await this.getRestaurantChainsObjects({ filters: {a_rest_chain_id: id} });
            if(restChain.length == 0)
                res.status(404).json(message.notFound('t_restaurant_chain', id));
            else 
                res.status(200).json(message.fetch('t_restaurant_chain', restChain));
            
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getRestaurantChainsObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let restChains;
        if (!filters)
            restChains = await this.server.db('t_restaurant_chain');
        else if (Array.isArray(filters.a_rest_chain_id)) {
            let ids = [...filters.a_rest_chain_id];
            delete filters.a_rest_chain_id;
            restChains = await this.server.db('t_restaurant_chain').whereIn('a_rest_chain_id', ids).where(filters);
        }    
        else
            restChains = await this.server.db('t_restaurant_chain').where(filters);
        if (restChains) {
            if (!Array.isArray(restChains))
                restChains = restChains[0];
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
            res.status(500).json({message: error.message});
        }
    }

    async updateChainScore(chainId) {
        try {
            let quality = 0, presentation = 0, price = 0;
            const rests = await this.server.db('t_restaurant').select('a_food_quality_score', 'a_presentation_score', 'a_price_quality_score').where({a_rest_chain_id: chainId});
            if(rests.length != 0) {
                rests.forEach(r => {
                    quality += parseFloat(r.a_food_quality_score);
                    presentation += parseFloat(r.a_presentation_score);
                    price += parseFloat(r.a_price_quality_score);
                });

                quality = quality/rests.length;
                presentation = presentation/rests.length;
                price = price/rests.length;

                await this.server.db('t_restaurant_chain').update({
                    a_food_quality_score: quality,
                    a_presentation_score: presentation,
                    a_price_quality_score: price,
                    a_score: (quality + presentation + price)/3
                }).where({a_rest_chain_id: chainId});
            }
            else {
                await this.server.db('t_restaurant_chain').update({
                    a_food_quality_score: 0,
                    a_presentation_score: 0,
                    a_price_quality_score: 0,
                    a_score: 0
                }).where({a_rest_chain_id: chainId});
            }
        } catch (error) {
            console.log(error.message);
        }
    }
};