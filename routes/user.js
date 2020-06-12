const message = require('../interface').message;
const bcrypt = require("bcrypt");

module.exports = class UserRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/user/')
            .get(this.getCurrentUser.bind(this))

        app.route('/user/all')
            .get(this.getUsers.bind(this));

        app.route('/user/:id')
            .get(this.getUser.bind(this))
            .put(this.modifyUser.bind(this))
            .delete(this.delUser.bind(this));

    }

    async getCurrentUser(req, res) {
        if (!req.params)
            req.params = {};
        req.params.id = req.user.a_user_id;
        return this.getUser(req, res);
    }

    async getUsers(req, res) {
        try {
            const users = await this.getUsersObjects();
            if (users)
                res.status(200).json(message.fetch('users', users));
            else
                res.status(404).json(message.notFound('users', null));
        } catch (error) {
            console.log(error);
        }
    }

    async getUser(req, res) {
        const { id } = req.params;
        try {
            let user = await this.getUsersObjects({a_user_id: id});
            if(user) {
                user = user[0];
                res.status(200).json(message.fetch('user', user));
            }
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
        }
    }

    async getUsersObjects(filters) {
        let users;
        if (!filters)
            users = await this.server.db('t_user');
        if (Array.isArray(filters.a_user_id)) {
            let ids = [...filters.a_user_id];
            delete filters.a_user_id;
            users = await this.server.db('t_user').whereIn('a_user_id', ids).where(filters);
        }    
        else
            users = await this.server.db('t_user').where(filters);
        if (users) {
            if (!Array.isArray(users))
                users = [users];
            for (let i = 0; i < users.length; i++) {
                delete users[i].a_password;
                delete users[i].a_email;
            }
            return users;
        }
        return null;
    }

    async modifyUser(req, res) {
        const { id } = req.params;
        const { name, password, image_url } = req.body;
        
        try {
            const userData = await this.server.db('t_user').where({a_user_id: id}).update({
                a_name: name,
                a_password: await bcrypt.hash(password, 10),
                a_image_url: image_url
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
            const respose = await this.server.db('t_user').where({a_user_id: id}).del();
            if (respose != 0)
                res.status(200).json(message.delete('user', respose));
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
        }
    }
};