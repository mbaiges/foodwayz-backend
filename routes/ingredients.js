const message = require('../interface').message;

module.exports = class UserRoute {
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
            const ingr = await this.server.db('t_ingredient');
            res.status(200).json(message.fetch('ingredients', ingr))
        } catch (error) {
            console.log(error);
        }
    }

    async addIngr(req, res) {
        try {
            let { name } = req.body;
            if(typeof(name) !== 'string') {
                res.status(409).json(message.conflict('ingredient', 'name must be a string', name));
                return; 
            }
            name = name.toLowerCase();
            const aux = await this.server.db('t_ingredient').select('*').where({
                a_ingr_name: name
            });

            if(aux.length != 0) {
                res.status(409).json(message.conflict('ingredient', `Cannot add ${name}`, aux));
            }
            else {
                let resp = await this.server.db('t_ingredient').insert({
                    a_ingr_name: name
                }).returning('*');
                res.status(200).json(message.post('ingredient', resp));
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    async editIngr(req, res) {
        try {
            const { id } = req.params;
            let { name } = req.body;

            if(typeof(name) !== 'string') {
                res.status(409).json(message.conflict('ingredient', 'name must be a string', name));
                return; 
            }
            name = name.toLowerCase();
            const aux = await this.server.db('t_ingredient').select('*').where({
                a_ingr_name: name
            });    

            if(aux.length != 0) {
                res.status(409).json(message.conflict('ingredient', `Cannot put ${name} to id: ${id}`, aux));
            }
            else {
                const ret = await this.server.db('t_ingredient').where({a_ingr_id: id}).update({a_ingr_name: name}).returning('*');
                if(ret.length == 0)
                    res.status(404).json(message.notFound('ingredient', id));
                else
                    res.status(200).json(message.put('ingredient', ret));
            }

        } catch (error) {
            console.log(error);
        }
    }

    async getIngr(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_ingredient').where({a_ingr_id: id});

            if(ret.length == 0)
                res.status(404).json(message.notFound('ingredient', id));
            else
                res.status(200).json(message.fetch('ingredient', [ret]));
        } catch (error) {
            console.log(error);
        }
    }

    async delIngr(req, res) {
        try {
            const { id } = req.params;
            const ret = await this.server.db('t_ingredient').where({a_ingr_id: id}).del();

            if(ret == 0)
                res.status(404).json(message.notFound('ingredient', id));
            else
                res.status(200).json(message.delete('ingredient', [ret]));

        } catch (error) {
            console.log(error);
        }
    }

};