const message = require('../interface').message;
const UserRoute = require('./user');
const CharacteristicRoute = require('./characteristic');

module.exports = class UserCharacteristicRoute {
    constructor(server) {
        this.server = server;
        this.userRoute = new UserRoute(server);
        this.charRoute = new CharacteristicRoute(server);
    }

    async initialize(app) {
        //app.get('/user/characteristic', this.getAllLinks.bind(this));

        app.route('/user/:userId/characteristic/:charId')
            .post(this.linkUserAndChar.bind(this))
            .delete(this.unLinkUserAndChar.bind(this));

        app.get('/user/:userId/characteristic', this.getCharsByUser.bind(this));
        app.get('/characteristic/:charId/user', this.getUsersByChar.bind(this));
    }

    async linkUserAndChar(req, res) {
        const { userId, charId } = req.params;
            
        try {
            const link = await this.server.db('t_user_has_characteristic').where({a_user_id: userId, a_char_id: charId});
            if (link) {
                res.status(409).json(message.conflict('userHasCharacteristic', 'already exists', link));
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

            if(unliked) 
                res.status(200).json(message.delete('user has charactersitic', unliked));
            else
                res.status(404).json(message.notFound('user has charactersitic', [userId, charId]));

        } catch (error) {
            console.log(error);
        }
    }

    async getCharsByUser(req, res) {
        const { userId } = req.params;

        try {
            const chars = this.getCharsByUserObjects(userId);
            res.status(200).json(message.fetch(`characteristics by user id ${id}`, chars));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getCharsByUserObjects(userId) {
        let chars_ids = await this.server.db('t_food_has_characteristic').select("a_char_id").where({a_user_id: userId});
        if (chars_ids && !Array.isArray(chars_ids))
            chars_ids = [chars_ids];
        return await this.charRoute.getCharacteristicsObjects({ filters: {a_char_id: chars_ids} });
    }

    async getUsersByChar(req, res) {
        const { charId } = req.params;

        try {
            const users = await this.getUsersByCharObjects(charId);
            res.status(200).json(message.fetch(`user by characteristics id ${id}`, users));

        } catch (error) {
            console.log(error);
        }
    }

    async getUsersByCharObjects(charId) {
        let users_ids = await this.server.db('t_food_has_characteristic').select("a_char_id").where({a_char_id: charId});
        if (users_ids && !Array.isArray(users_ids))
        users_ids = [users_ids];
        return await this.userRoute.getUsersObjects({ filters: {a_user_id: users_ids} });
    }
};

