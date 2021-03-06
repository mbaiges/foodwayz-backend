const message = require('../interface').message;

module.exports = class OwnsRoute {
    constructor(server) {
        this.server = server;
    }

    async initialize(app) {
        
        app.get('/owner/restaurant', this.getRestsByOwner.bind(this));

        app.route('/owner/restaurant/:restId')
            .post(this.linkRest.bind(this))
            .delete(this.unLinkRest.bind(this));

        app.route('/owner/:ownerId/restaurant/:restId')
            .post(this.linkUserToRest.bind(this))
            .delete(this.unLinkUserToRest.bind(this));
        
        app.get('/restaurant/:restId/owner', this.getOwnersByRest.bind(this));
    }

    async linkRest(req, res) {
        req.params.ownerId = req.user.a_user_id;
        return this.linkUserAndRest(req, res);
    }

    async linkUserToRest(req, res) {
        const { a_user_id } = req.user;
        const { restId } = req.params;

        try {
            const owns = await this.server.db('t_owns').where({a_user_id: a_user_id, a_rest_id: restId});
            if(owns.length == 0) {
                res.status(401).json(message.unauth(`adding new owner to restaurant with id ${restId}`, 'You are not an owner'));
                return;
            }
            req.params.ownerId = req.params.userId;
            return this.linkUserAndRest(req, res);
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async linkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {
            const link = await this.server.db('t_owns').where({a_user_id: ownerId, a_rest_id: restId});
            if (link.length != 0) {
                res.status(409).json(message.conflict('giving ownership to user', 'already exists', link));
            }
            else {
                const added_link = await this.server.db('t_owns').insert({a_user_id: ownerId, a_rest_id: restId}).returning("*");
                res.status(200).json(message.post('owns', added_link));
                this.sendOwnerEmail(ownerId, restId);
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

    async unLinkUserToRest(req, res) {
        const { a_user_id } = req.user;
        const { restId } = req.params;

        try {
            const owns = await this.server.db('t_owns').where({a_user_id: a_user_id, a_rest_id: restId});
            if(owns.length == 0) {
                res.status(401).json(message.unauth(`deleting owner from restaurant with id ${restId}`, 'You are not an owner'));
                return;
            }
            req.params.ownerId = req.params.userId;
            return this.unLinkUserAndRest(req, res);
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async unLinkUserAndRest(req, res) {
        const { ownerId, restId } = req.params;

        try {

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
        if (!this.restaurantRoute) {
            const RestaurantRoute = require('./restaurant');
            this.restaurantRoute = new RestaurantRoute(this.server);
        }

        const { a_user_id: ownerId } = req.user;

        try {
            let rests_ids = await this.server.db('t_owns').select("a_rest_id").where({a_user_id: ownerId});
            if (rests_ids && !Array.isArray(rests_ids))
                rests_ids = [rests_ids];
            if (rests_ids) {
                rests_ids = rests_ids.map(r => r.a_rest_id);
            }
            const rests = await this.restaurantRoute.getRestaurantsObjects({ filters: { a_rest_id: rests_ids } });
            res.status(200).json(message.fetch(`restaurants by owner id ${ownerId}`, rests));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getOwnersByRest(req, res) {
        if (!this.userRoute) {
            const UserRoute = require('./user');
            this.userRoute = new UserRoute(this.server);
        }

        const { restId } = req.params;

        try {
            let users_ids = await this.server.db('t_owns').select("a_user_id").where({a_rest_id: restId});
            if (users_ids && !Array.isArray(users_ids))
                users_ids = [users_ids];
            if (users_ids.length != 0) {
                users_ids = users_ids.map(u => u.a_user_id);
            }
            const owners = await this.userRoute.getUsersObjects({ filters: { a_user_id: users_ids } });
            res.status(200).json(message.fetch(`owners by restaurant id ${restId}`, owners));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async sendOwnerEmail(a_user_id, a_rest_id) {
        let user = await this.server.db('t_user').where({a_user_id});
        let rest = await this.server.db('t_restaurant').where({a_rest_id});

        if (user && user.length > 0 && rest && rest.length > 0) {
            user = user[0];
            rest = rest[0];

            mailOptions = {
                from : "Dychromatic <noreply@vysly.com>",
                to : user.a_email,
                subject : `New Owner`,
                html : `<div>
                          <h1 style="text-align: center; margin-bottom=8px;">
                            <strong>You are now owner of restaurant called "<span style="color: #fc987e;">${rest.a_name}</span>"</strong>
                          </h1>
                          <p>
                            <strong>
                              <span style="color: #fc987e;">
                                <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/pugcocinero.png" alt="New Owner!" width="500" height="500" />
                              </span>
                            </strong>
                          </p>
                       </div>` 
              }
          
              try {
                await this.server.emailSend(mailOptions);
              } catch (error) {
                console.log(error);
              }
        }
    }

};

