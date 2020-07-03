const message = require('../interface').message;
const bcrypt = require("bcrypt");

module.exports = class UserRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        app.route('/user/')
            .get(this.getCurrentUser.bind(this))
            .put(this.modifyCurrentUser.bind(this))

        app.route('/user/all')
            .get(this.getUsers.bind(this));
        
        app.route('/user/find')
            .get(this.findUsers.bind(this));

        app.route('/user/:id')
            .get(this.getUser.bind(this));
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
            res.status(500).json({message: error.message});
        }
    }

    async getUser(req, res) {
        const { id } = req.params;
        try {
            let user = await this.getUsersObjects({ filters: {a_user_id: id} });
            if(user) {
                user = user[0];
                res.status(200).json(message.fetch('user', user));
            }
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getUsersObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let users;
        if (!filters)
            users = await this.server.db('t_user');
        else if (Array.isArray(filters.a_user_id)) {
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
            }
            return users;
        }
        return null;
    }

    async findUsers(req, res) {
        const {a_name = null, a_gender = null, a_birthdate = null, a_email = null, a_is_verified = null} = req.body;

        const params = {
            a_name: [a_name, (a_name == null || typeof(a_name) === 'string')],
            a_gender: [a_gender, (a_gender == null || typeof(a_gender) === 'string')],
            a_birthdate: [a_birthdate, (a_birthdate == null || typeof(a_birthdate) === 'string')],
            a_email: [a_email, (a_email == null || typeof(a_email) === 'string')],
            a_is_verified: [a_is_verified, (a_is_verified == null || typeof(a_is_verified) === 'boolean')],
        };
        let errors = {};
        Object.entries(params).forEach(prop => {
            if(!prop[1][1]) {
                errors[prop[0]] = prop[1][0];
            }
        });

        let aux;
        if((aux = Object.keys(errors)).length != 0) {
            
            res.status(400).json(message.badRequest('user', aux, errors));
            return;
        }

        let filters = {
            a_name: a_name,
            a_gender: a_gender,
            a_birthdate: a_birthdate,
            a_email: a_email,
            a_is_verified: a_is_verified,
        }

        const keys = Object.keys(filters);
        for(const idx in keys) {
            if(filters[keys[idx]] == null)
                delete filters[keys[idx]];
        }

        if(Object.keys(filters).length == 0) {
            return this.getUsers(req, res);
        }

        try {
            const result = await this.server.db('t_user').where(filters);
            result.forEach(u => delete u.a_password);
            res.status(200).json(message.fetch('users', result));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async modifyCurrentUser(req, res) {
        if (!req.params)
            req.params = {};
        req.params.id = req.user.a_user_id;
        if (req.body.a_user_id)
            req.body.a_user_id = req.user.a_user_id;
        this.modifyUser(req, res);
    }

    async modifyUser(req, res) {
        const { id } = req.params;
        const user = req.body;

        try {
            if (user.a_password) {
                const pass_to_hash = user.a_password;
                user.a_password = await bcrypt.hash(pass_to_hash, 10);
            }
            const userData = await this.server.db('t_user').where({a_user_id: id}).update(user);
            if (userData != 0)
                res.status(200).json(message.put('user', userData));
            else
                res.status(404).json(message.notFound('user', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async delCurrentUser(req, res) {
        if (!req.params)
            req.params = {};
        req.params.id = req.user.a_user_id;
        this.delUser(req, res);
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
            res.status(500).json({message: error.message});
        }
    }
};