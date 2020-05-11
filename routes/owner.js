module.exports = class OwnerRoute {
	constructor(server) {
		this.server = server;
	}

	async initialize(app) {
        app.route('/owner')
            .post(this.makeOwnership.bind(this))
            .delete(this.removeOwnership.bind(this));
    }

    async makeOwnership(req, res){
        const owner = await this.server.db('t_owner').where({ a_user_id: req.user.a_user_id }).first();
        if (owner) return res.status(400).json({ code: 'owner-already', message: 'You are already owner' });

        try {
            const insert = await this.server.db('t_owner').insert({
                a_user_id: req.user.a_user_id, 
                a_is_premium: false
            });
            res.status(200).json({ message: `User ${req.user.a_name} is now a proud owner c:`});
        } catch (error) {
            console.error('Failed to give ownership:');
            console.error(error);
            return res.status(500).json({ message: 'Failed to give ownership' });
        }
    }

    async removeOwnership(req, res){
        const owner = await this.server.db('t_owner').where({ a_user_id: req.user.a_user_id }).first();
        if (!owner) return res.status(401).json({ code: 'not-owner', message: 'Invalid authorization' });

        const del = await this.server.db('t_owner').where( {a_user_id: req.user.a_user_id}).delete();

        try {
            const del = await this.server.db('t_owner').where( {a_user_id: req.user.a_user_id}).delete();
            res.status(200).json({ message: `User ${req.user.a_name} is no longer a proud owner :c`});
        } catch (error) {
            console.error('Failed to remove ownership:');
            console.error(error);
            return res.status(500).json({ message: 'Failed to remove ownership' });
        }
    }
};



