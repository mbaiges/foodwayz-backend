const message = require('../interface').message;
const bcrypt = require("bcrypt");

module.exports = class UserRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/user')
            .get(this.getUsers.bind(this));

        app.route('/user/:id')
            .get(this.getUser.bind(this))
            .put(this.modifyUser.bind(this))
            .delete(this.delUser.bind(this));

    }

    async getUsers(req, res) {
        try {
            const users = await this.server.db('t_user').select(["a_name", "a_email"]);
            res.status(200).json(message.fetch('users', users));
        } catch (error) {
            console.log(error);
        }
    }

    async getUser(req, res) {
        try {
            const {
                id
            } = req.params;
            const user = await this.server.db('t_user').select(["a_name", "a_email"]).where({
                a_user_id: id
            });
            if (user.length == 1)
                res.status(200).json(message.fetch('user', user));
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
        }

    }

    async modifyUser(req, res) {
        try {
            const {
                id
            } = req.params;

            const {
                name,
                password
            } = req.body;
            const userData = await this.server.db('t_user').where('a_user_id', '=', id).update({
                a_name: name,
                a_password: await bcrypt.hash(password, 10)
            });
            if (userData != 0)
                res.status(200).json(message.put('user', userData));
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
        }
    }

    async delUser(req, res) {
        try {
            const {
                id
            } = req.params;
            const respose = await this.server.db('t_user').where('a_user_id', '=', id).del();
            if (respose != 0)
                res.status(200).json(message.delete('user', respose));
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
        }
    }
};