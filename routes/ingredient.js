const message = require('../interface').message;

module.exports = class IngredientRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/ingredient')
            .post(this.addIngr.bind(this))
            .get(this.getAll.bind(this));

        app.route('/ingredient/:id')
        .put(this.editIngr.bind(this))
        .get(this.getIngr.bind(this))
        .delete(this.delIngr.bind(this));

    }

    async getAll(req, res) {
        try {
            const ingr = await this.getIngredientsObjects();
            res.status(200).json(message.fetch('ingredients', ingr))
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addIngr(req, res) {
        try {
            let { a_ingr_name } = req.body;
            if(typeof(a_ingr_name) !== 'string') {
                res.status(409).json(message.conflict('ingredient', 'name must be a string', a_ingr_name));
                return; 
            }
            a_ingr_name = a_ingr_name.toLowerCase();
            const aux = await this.server.db('t_ingredient').select('*').where({
                a_ingr_name: a_ingr_name
            });

            if(aux.length != 0) {
                res.status(409).json(message.conflict('ingredient', `Cannot add ${a_ingr_name}`, aux));
            }
            else {
                let resp = await this.server.db('t_ingredient').insert({
                    a_ingr_name: a_ingr_name
                }).returning('*');
                res.status(200).json(message.post('ingredient', resp));
            }
            
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async editIngr(req, res) {
        try {
            const { id } = req.params;
            let { a_ingr_name } = req.body;

            if(typeof(a_ingr_name) !== 'string') {
                res.status(409).json(message.conflict('ingredient', 'name must be a string', a_ingr_name));
                return; 
            }
            a_ingr_name = a_ingr_name.toLowerCase();
            const aux = await this.server.db('t_ingredient').select('*').where({
                a_ingr_name: a_ingr_name
            });    

            if(aux.length != 0) {
                res.status(409).json(message.conflict('ingredient', `Cannot put ${a_ingr_name} to id: ${id}`, aux));
            }
            else {
                const ret = await this.server.db('t_ingredient').where({a_ingr_id: id}).update({a_ingr_name: a_ingr_name}).returning('*');
                if(ret.length == 0)
                    res.status(404).json(message.notFound('ingredient', id));
                else
                    res.status(200).json(message.put('ingredient', ret));
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getIngr(req, res) {
        try {
            const { id } = req.params;
            let ingr = await this.getIngredientsObjects({ filters: {a_ingr_id: id} });
            if(ingr) {
                ingr = ingr[0];
                res.status(200).json(message.fetch('ingredient', ingr));
            }
            else
                res.status(404).json(message.notFound('ingredient', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getIngredientsObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let ingrs;
        if (!filters)
            ingrs = await this.server.db('t_ingredient');
        else if (Array.isArray(filters.a_ingr_id)) {
            let ids = [...filters.a_ingr_id];
            delete filters.a_ingr_id;
            ingrs = await this.server.db('t_ingredient').whereIn('a_ingr_id', ids).where(filters);
        }    
        else
            ingrs = await this.server.db('t_ingredient').where(filters);
        if (ingrs) {
            if (!Array.isArray(ingrs))
                ingrs = [ingrs];
            return ingrs;
        }
        return null;
    }

    async delIngr(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_ingredient').where({a_ingr_id: id}).del();

            if(ret)
                res.status(200).json(message.delete('ingredient', ret));
            else
                res.status(404).json(message.notFound('ingredient', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

};