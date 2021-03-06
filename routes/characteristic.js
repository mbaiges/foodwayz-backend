const message = require('../interface').message;

module.exports = class CharacteristicRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/characteristic')
            .post(this.addChar.bind(this))
            .get(this.getAll.bind(this));

        app.route('/characteristic/:id')
            .put(this.editChar.bind(this))
            .get(this.getChar.bind(this))
            .delete(this.delChar.bind(this));

    }

    async getAll(req, res) {
        try {
            const chars = await this.getCharacteristicsObjects();
            res.status(200).json(message.fetch('characteristics', chars)); 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addChar(req, res) {
        let { a_char_name } = req.body;

        if(typeof(a_name) !== 'string') {
            res.status(400).json(message.badRequest('characteristic', '"name"', a_name));
            return;
        }

        a_char_name = a_char_name.toLowerCase();

        try {
            const aux = await this.server.db('t_characteristic').select("*").where({
                a_char_name: a_char_name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('characteristic', 'already exists', aux));
                return;
            }

            const char = await this.server.db('t_characteristic').insert({
                a_char_name: a_char_name
            }).returning("*");

            res.status(200).json(message.post('characteristic', char));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async editChar(req, res) {
        const { id } = req.params;
        let { a_char_name } = req.body;

        if(typeof(a_char_name) !== 'string') {
            res.status(400).json(message.badRequest('characteristic', '"name"', a_char_name));
            return;
        }

        a_char_name = a_char_name.toLowerCase();

        try {
            const aux = await this.server.db('t_characteristic').select("*").where({
                a_char_name: a_char_name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('characteristic', 'already exists', aux));
                return;
            }

            const char = await this.server.db('t_characteristic').update({
                a_char_name: a_char_name
            }).where({ a_char_id: id }).returning('*');

            if(char)
                res.status(200).json(message.put('characteristic', char));
            else
                res.status(404).json(message.notFound('characteristic', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getChar(req, res) {
        const { id } = req.params;

        try {
            let char = await this.getCharacteristicsObjects({ filters: {a_char_id: id} });
            if(char) {
                char = char[0];
                res.status(200).json(message.fetch('characteristic', char)); 
            }
            else
                res.status(404).json(message.notFound('characteristic', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getCharacteristicsObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let chars;
        if (!filters)
            chars = await this.server.db('t_characteristic');
        else if (Array.isArray(filters.a_char_id)) {
            let ids = [...filters.a_char_id];
            delete filters.a_char_id;
            chars = await this.server.db('t_characteristic').whereIn('a_char_id', ids).where(filters);
        }    
        else
            chars = await this.server.db('t_characteristic').where(filters);
        if (chars) {
            if (!Array.isArray(chars))
                chars = [chars];
            return chars;
        }
        return null;
    }
    
    async delChar(req, res) {
        const { id } = req.params;

        try {
            const char = await this.server.db('t_characteristic').where({
                a_char_id: id
            }).del();

            if(char) 
                res.status(200).json(message.delete('characteristic', char));
            else
                res.status(404).json(message.notFound('characteristic', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }
};