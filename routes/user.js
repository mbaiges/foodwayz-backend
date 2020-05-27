const message = require('../interface').message;
const bcrypt = require("bcrypt");

module.exports = class UserRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.get('/user', this.getUsers.bind(this));
        app.get("/user/:id", this.getUser.bind(this));
        app.put('/user/:id', this.modifyUser.bind(this));
        app.delete('/user/:id', this.delUser.bind(this));
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
            res.status(200).json(message.fetch('user', user));
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
            res.status(200).json(message.put('user', userData));
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
            res.status(200).json(message.delete('user', respose));
        } catch (error) {
            console.log(error);
        }
    }
};