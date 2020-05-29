const message = require('../interface').message;

module.exports = class UserRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        //app.get('/user/characteristic', this.getAllLinks.bind(this));

        app.route('/user/:userId/characteristic/:charId')
            .post(this.linkUserAndChar.bind(this))
            .delete(this.unLinkUserAndChar.bind(this));

        app.get('/user/:id/characteristic', this.getCharsByUser.bind(this));
        app.get('/characteristic/:id/users', this.getUsersByChar.bind(this));
    }

    async linkUserAndChar(req, res) {
        const { userId, charId } = req.params;
            
        try {
            const link = await this.server.db('t_user_has_characteristic').where({a_user_id: userId, a_char_id: charId});
            if (link) {
                res.status(409).json(message.conflict('userHasCharacteristic', 'already-exists', link));
            }
            else {
                const added_link = await this.server.db('t_user_has_characteristic').insert({a_user_id: userId, a_char_id: charId});
                res.status(200).json(message.post('user has charactersitic', added_link));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async unLinkUserAndChar(req, res) {
        const { userId, charId } = req.params;

        try {
            const unliked = await this.server.db('t_user_has_characteristic').where({a_user_id: userId, a_char_id: charId}).del();

            if(unliked == 0) 
                res.status(404).json(message.notFound('user has charactersitic', [userId, charId]));
            else
                res.status(200).json(message.delete('user has charactersitic', [unliked]));

        } catch (error) {
            console.log(error);
        }
    }

    async getCharsByUser(req, res) {
        const { id } = req.params;

        try {
            const chars = await this.server.db('t_user_has_characteristic').joinRaw('natural full join t_characteristic').select("a_char_id", "a_char_name").where({a_user_id: id});
            res.status(200).json(message.fetch(`characteristics by user id ${id}`, chars));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getUsersByChar(req, res) {
        const { id } = req.params;

        try {
            const users = await this.server.db('t_user_has_characteristic').joinRaw('natural full join t_user').select("a_user_id", "a_name", "a_email").where({a_char_id: id});
            res.status(200).json(message.fetch(`user by characteristics id ${id}`, users));

        } catch (error) {
            console.log(error);
        }
    }
};

