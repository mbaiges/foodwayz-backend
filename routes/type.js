const message = require('../interface').message;

module.exports = class TypeRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/type')
            .post(this.addType.bind(this))
            .get(this.getAll.bind(this));

        app.route('/type/:id')
            .put(this.editType.bind(this))
            .get(this.getType.bind(this))
            .delete(this.delType.bind(this));

    }

    async getAll(req, res) {
        try {
            const types = await this.getTypesObjects({ filters: {a_type_id: [1,2,4]} });
            res.status(200).json(message.fetch('types', types)); 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }

    async addType(req, res) {
        let { a_type_name } = req.body;

        if(typeof(a_type_name) !== 'string') {
            res.status(400).json(message.badRequest('type', '"name"', a_type_name));
            return;
        }

        a_type_name = a_type_name.toLowerCase();

        try {
            const aux = await this.server.db('t_type').select("*").where({
                a_type_name: a_type_name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('type', 'already exists', aux));
                return;
            }

            const type = await this.server.db('t_type').insert({
                a_type_name: a_type_name
            }).returning("*");

            res.status(200).json(message.post('type', type));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }

    async editType(req, res) {
        const { id } = req.params;
        let { a_type_name } = req.body;

        if(typeof(a_type_name) !== 'string') {
            res.status(400).json(message.badRequest('type', '"name"', a_type_name));
            return;
        }

        a_type_name = a_type_name.toLowerCase();

        try {
            const aux = await this.server.db('t_type').select("*").where({
                a_type_name: a_type_name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('type', 'already exists', aux));
                return;
            }

            const type = await this.server.db('t_type').update({
                a_type_name: a_type_name
            }).where({ a_type_id: id });

            if(type)
                res.status(200).json(message.put('type', type));
            else
                res.status(404).json(message.notFound('type', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }

    async getType(req, res) {
        const { id } = req.params;

        try {
            let type = await this.getTypesObjects({ filters: {a_type_id: id} });
            if(type) {
                type = type[0];
                res.status(200).json(message.fetch('type', type));
            }
            else
                res.status(404).json(message.notFound('type', id)); 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }

    async getTypesObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let types;
        if (!filters)
            types = await this.server.db('t_type');
        else if (Array.isArray(filters.a_type_id)) {
            let ids = [...filters.a_type_id];
            delete filters.a_type_id;
            types = await this.server.db('t_type').whereIn('a_type_id', ids).where(filters);
        }    
        else
            types = await this.server.db('t_type').where(filters);
        if (types) {
            if (!Array.isArray(types))
                types = [types];
            return types;
        }
        return null;
    }
    
    async delType(req, res) {
        const { id } = req.params;

        try {
            const type = await this.server.db('t_type').where({
                a_type_id: id
            }).del();

            if(type) 
                res.status(200).json(message.delete('type', type));
            else
                res.status(404).json(message.notFound('type', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }
};