const message = require('../interface').message;

module.exports = class OwnsRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.route('/owner/:ownerId/restaurant/:restId')
            .post(this.linkRest.bind(this))
            .delete(this.unLinkRest.bind(this));

        app.get('/owner/:ownerId/restaurant', this.getRestsByOwner.bind(this));
        app.get('/restaurant/:restId/users', this.getOwnersByRest.bind(this));
    }

    async linkRest(req, res) {
        req.params.userId = req.user.id;
        return this.linkRest(req, res);
    }

    async linkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {
            const owner = await this.server.db('t_owner').where({
                a_user_id: ownerId
            }).first();
            if (owner.length === 0) return res.status(401).json(message.unauth('give restaurant ownership', 'Not registered as owner'));

            const link = await this.server.db('t_owns').where({a_user_id: ownerId, a_rest_id: restId});
            if (link) {
                res.status(409).json(message.conflict('giving ownership to user', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_owns').insert({a_user_id: ownerId, a_rest_id: restId}).returning("*");
                res.status(200).json(message.post('owns', added_link));
            }
        } catch (error) {
            console.log(error);
        }
    }

    async unLinkRest(req, res) {
        req.params.userId = req.user.id;
        return this.unLinkUserAndRest(req, res);
    }

    async unLinkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {
            const owner = await this.server.db('t_owner').where({
                a_user_id: ownerId
            }).first();
            if (owner.length === 0) return res.status(401).json(message.unauth('give restaurant ownership', 'Not registered as owner'));

            const unliked = await this.server.db('t_owns').where({a_user_id: ownerId, a_rest_id: restId}).del();

            if(unliked == 0) 
                res.status(404).json(message.notFound('ownership', [ownerId, restId]));
            else
                res.status(200).json(message.delete('ownership', [unliked]));

        } catch (error) {
            console.log(error);
        }
    }

    async getRestsByOwner(req, res) {
        const { ownerId } = req.params;

        try {
            const rests = await this.server.db('t_owns').joinRaw('natural full join t_restaurant').select("a_rest_id", "a_name", "a_score", "a_state", "a_city", "a_postal_code", "a_address", "a_rest_chain_id", "a_created_at").where({a_user_id: ownerId});
            res.status(200).json(message.fetch(`restaurants by owner id ${ownerId}`, rests));

        } catch (error) {
            console.log(error);
        }
        
    }

    async getOwnersByRest(req, res) {
        const { restId } = req.params;

        try {
            const owners = await this.server.db('t_owns').joinRaw('natural full join t_user').select("a_user_id", "a_name", "a_email").where({a_rest_id: restId});
            res.status(200).json(message.fetch(`owners by restaurant id ${restId}`, owners));
        } catch (error) {
            console.log(error);
        }
    }

};

