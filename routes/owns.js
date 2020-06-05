const message = require('../interface').message;

module.exports = class foodRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.route('/user/:userId/restaurant/:resId')
        //     .post(this..bind(this))
        //     .delete(this..bind(this));

        // app.get('/user/:userId/restaurant', this..bind(this));
        // app.get('/restaurant/:resId/users', this..bind(this));
    }

    async linkUserAndRes(req, res) {
        const { userId, resId } = req.params;

        try {
            const link = await this.server.db('').where({});
            if (link) {
                res.status(409).json(message.conflict('', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('').insert({});
                res.status(200).json(message.post('', added_link));
            }
        } catch (error) {
            console.log(error);
        }
    }

};

