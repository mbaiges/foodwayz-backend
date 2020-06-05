const message = require('../interface').message;

module.exports = class foodRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.get('/type/:typeId/foods', this.getFoodsByType.bind(this));
    }

    async getFoodsByType(req, res) {
        const { typeId } = req.params;

        try {
            const foods = await this.server.db('t_food').select('a_user_id', a_).where({a_type_id: typeId});
            res.status(200).json(message.fetch(`food by characteristics id ${charId}`, foods));

        } catch (error) {
            console.log(error);
        }
    }

};

