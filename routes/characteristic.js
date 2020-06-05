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
            const chars = await this.server.db('t_characteristic');
            res.status(200).json(message.fetch('characteristics', chars)); 
        } catch (error) {
            console.log(error);
        }
    }

    async addChar(req, res) {
        let { name } = req.body;

        if(typeof(name) !== 'string') {
            res.status(400).json(message.badRequest('characteristic', '"name"', name));
            return;
        }

        name = name.toLowerCase();

        try {
            const aux = await this.server.db('t_characteristic').select("*").where({
                a_char_name: name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('characteristic', 'already exists', aux));
                return;
            }

            const char = await this.server.db('t_characteristic').insert({
                a_char_name: name
            }).returning("*");

            res.status(200).json(message.post('characteristic', char));
        } catch (error) {
            console.log(error);
        }
    }

    async editChar(req, res) {
        const { id } = req.params;
        let { name } = req.body;

        if(typeof(name) !== 'string') {
            res.status(400).json(message.badRequest('characteristic', '"name"', name));
            return;
        }

        name = name.toLowerCase();

        try {
            const aux = await this.server.db('t_characteristic').select("*").where({
                a_char_name: name
            })
    
            if(aux.length != 0) {
                res.status(409).json(message.conflict('characteristic', 'already exists', aux));
                return;
            }

            const char = await this.server.db('t_characteristic').update({
                a_char_name: name
            }).where({ a_char_id: id });

            if(char.length == 0)
                res.status(404).json(message.notFound('characteristic', id));
            else
                res.status(200).json(message.put('characteristic', [char]));
        } catch (error) {
            console.log(error);
        }
    }

    async getChar(req, res) {
        const { id } = req.params;

        try {
            const char = await this.server.db('t_characteristic').select("*").where({
                a_char_id: id
            });

            if(char.length == 0) 
                res.status(404).json(message.notFound('characteristic', id));
            else
                res.status(200).json(message.fetch('characteristic', char));
        } catch (error) {
            console.log(error);
        }
    }
    
    async delChar(req, res) {
        const { id } = req.params;

        try {
            const char = await this.server.db('t_characteristic').where({
                a_char_id: id
            }).del();

            if(char.length == 0) 
                res.status(404).json(message.notFound('characteristic', id));
            else
                res.status(200).json(message.delete('characteristic', [char]));
        } catch (error) {
            console.log(error);
        }
    }
};