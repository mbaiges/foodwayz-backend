module.exports = class UserRoute {
	constructor(server) {
		this.server = server;
	}

	async initialize(app) {
        app.route('/user')
        .get(this.getUsers.bind(this));
    }

    async getUsers(req, res) {
        const users = await this.server.db('t_user');
        users.forEach(e => {
            delete e.a_user_id;
            delete e.a_password;
            delete e.a_reg_date;
        });
		res.json({ message: 'Successfully fetched users', users});
    }
};
