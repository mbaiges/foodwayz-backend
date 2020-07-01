const message = require('../interface').message;
const UserRoute = require('./user');
const RestaurantRoute = require('./restaurant');

module.exports = class OwnsRoute {
    constructor(server) {
        this.server = server;
        this.userRoute = new UserRoute(server);
        this.restaurantRoute = new RestaurantRoute(server);
    }

    async initialize(app) {
        
        app.get('/owner/restaurant', this.getRestsByOwner.bind(this));

        app.route('/owner/restaurant/:restId')
            .post(this.linkRest.bind(this))
            .delete(this.unLinkRest.bind(this));
        
        app.get('/restaurant/:restId/owner', this.getOwnersByRest.bind(this));
    }

    async linkRest(req, res) {
        req.params.ownerId = req.user.a_user_id;
        return this.linkUserAndRest(req, res);
    }

    async linkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {
            const owner = await this.server.db('t_owner').where({
                a_user_id: ownerId
            });
            if (owner.length === 0) return res.status(401).json(message.unauth('give restaurant ownership', 'Not registered as owner'));

            const link = await this.server.db('t_owns').where({a_user_id: ownerId, a_rest_id: restId});
            if (link.length != 0) {
                res.status(409).json(message.conflict('giving ownership to user', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_owns').insert({a_user_id: ownerId, a_rest_id: restId}).returning("*");
                res.status(200).json(message.post('owns', added_link));
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async unLinkRest(req, res) {
        req.params.ownerId = req.user.a_user_id;
        return this.unLinkUserAndRest(req, res);
    }

    async unLinkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {
            const owner = await this.server.db('t_owner').where({
                a_user_id: ownerId
            });
            if (owner.length === 0) return res.status(401).json(message.unauth('give restaurant ownership', 'Not registered as owner'));

            const unliked = await this.server.db('t_owns').where({a_user_id: ownerId, a_rest_id: restId}).del();

            if(unliked) 
                res.status(200).json(message.delete('ownership', unliked));
            else
                res.status(404).json(message.notFound('ownership of the restaurant', restId));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getRestsByOwner(req, res) {
        const { a_user_id: ownerId } = req.user;

        try {
            let rests_ids = await this.server.db('t_owns').select("a_rest_id").where({a_user_id: ownerId});
            if (rests_ids && !Array.isArray(rests_ids))
                rests_ids = [rests_ids];
            const rests = await this.restaurantRoute.getRestaurantsObjects({ filters: { a_rest_id: rests_ids } });
            res.status(200).json(message.fetch(`restaurants by owner id ${ownerId}`, rests));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getOwnersByRest(req, res) {
        const { restId } = req.params;

        try {
            let users_ids = await this.server.db('t_owns').select("a_rest_id").where({a_rest_id: restId});
            if (users_ids && !Array.isArray(users_ids))
                users_ids = [users_ids];
            const owners = await this.userRoute.getUsersObjects({ filters: { a_user_id: users_ids } });
            res.status(200).json(message.fetch(`owners by restaurant id ${restId}`, owners));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

};

