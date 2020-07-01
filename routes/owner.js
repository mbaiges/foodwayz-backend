const message = require('../interface').message;

module.exports = class OwnerRoute {
	constructor(server) {
		this.server = server;
	}

	async initialize(app) {
        app.route('/owner')
            .post(this.makeOwnership.bind(this))
            .put(this.updatePremiumStatus.bind(this))
            .delete(this.removeOwnership.bind(this));
    }

    async makeOwnership(req, res){
        const owner = await this.server.db('t_owner').where({ a_user_id: req.user.a_user_id }).first();
        if (owner) return res.status(409).json(message.conflict('owner', 'already exists', owner));

        try {
            const insert = await this.server.db('t_owner').insert({
                a_user_id: req.user.a_user_id, 
                a_premium_level: 0
            }).returning("*");
            res.status(200).json(message.post('owner', insert));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to give ownership' });
        }
    }

    async removeOwnership(req, res){
        const owner = await this.server.db('t_owner').where({ a_user_id: req.user.a_user_id }).first();
        if (!owner) return res.status(409).json(message.conflict('owner', 'not an owner', null));

        const del = await this.server.db('t_owner').where( {a_user_id: req.user.a_user_id}).delete();

        try {
            const del = await this.server.db('t_owner').where( {a_user_id: req.user.a_user_id}).delete();
            res.status(200).json(message.delete('owner', del));
        } catch (error) {
            console.error('Failed to remove ownership:');
            console.error(error);
            return res.status(500).json({ message: 'Failed to remove ownership' });
        }
    }

    async updatePremiumStatus(req, res) {
        const { a_user_id } = req.user;
        const { a_premium_level } = req.body;

        if(!Number.isInteger(a_premium_level)) {
            res.status(400).json(message.badRequest('premium level', a_user_id, a_premium_level));
            return;
        }

        try {
        
            const user = await this.server.db('t_owner').update({
                a_premium_level: a_premium_level
            }).where({a_user_id: a_user_id});

            if(user == 0)
                res.status(404).json(message.notFound('owner user', a_user_id));
            else
                res.status(200).json(message.put('premium level', user));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error});
        }
    }
};



