const message = require('../interface').message;
const RestaurantChainRoute = require('./restaurant_chain');

module.exports = class RestaurantRoute {
    constructor(server) {
        this.server = server;
        this.restaurantChainRoute = new RestaurantChainRoute(server);
    }

    async initialize(app) {
        app.route('/restaurant')
            .get(this.getRestaurants.bind(this))
            .post(this.addRestaurant.bind(this));

        app.route('/restaurant/:id')
            .get(this.getRestaurant.bind(this))
            .delete(this.removeRestaurant.bind(this))
            .put(this.modifyRestaurant.bind(this));

        app.route('/restaurant/:id/image')
            .get(this.getAllImages.bind(this))
            .post(this.addImage.bind(this));
        
        app.route('/restaurant/:id/image/:imageId')
            .get(this.getImage.bind(this))
            .put(this.modifyImage.bind(this))
            .delete(this.removeImage.bind(this));
    }

    
    async getRestaurants(req, res) {
        // Fetch restaurants from db
        try {
            const restaurants = await this.getRestaurantsObjects();
            res.status(200).json(message.fetch('restaurant', restaurants));
        } catch (error) {
            console.log(error);
        }
    }


    async addRestaurant(req, res) {

        const {
            a_name,
            a_state,
            a_postal_code,
            a_city,
            a_address,
            a_rest_chain_id
        } = req.body;

        try {

            const owner = await this.server.db('t_owner').where({
                a_user_id: req.user.a_user_id
            }).first();
            if (owner.length === 0) return res.status(401).json(message.unauth('add restaurant', 'Not registered as owner'));

            if (a_rest_chain_id) {
                const rest_chain = await this.server.db('t_restaurant_chain').where({
                    a_rest_chain_id: a_rest_chain_id
                }).first();
                if (rest_chain) return res.status(404).json(message.notFound('restaurant chain', a_rest_chain_id));
            }

            const exists = await this.server.db('t_restaurant').where({
                a_state: a_state,
                a_postal_code: a_postal_code,
                a_city: a_city,
                a_address: a_address
            }).first();
            if (exists) return res.status(409).json(message.conflict('restaurant', 'already exists', exists));

            const insert = await this.server.db('t_restaurant')
                .insert({
                    a_name: a_name,
                    a_city: a_city,
                    a_state: a_state,
                    a_postal_code: a_postal_code,
                    a_rest_chain_id: a_rest_chain_id,
                    a_address: a_address
                })
                .returning('*');

            res.status(200).json(message.post('restaurant', insert));
        } catch (error) {
            console.error('Failed to add restaurant:');
            console.error(error);
            return res.status(500).json({
                message: 'Failed to add restaurant'
            });
        }
    }

    async removeRestaurant(req, res) {
        try {
            const {
                id
            } = req.params;
            const response = await this.server.db('t_restaurant').where('a_rest_id', '=', id).del();
            if (response != 0)
                res.status(200).json(message.delete('restaurant', [response]));
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
        }
    }

    async modifyRestaurant(req, res) {
        try {
            const {
                id
            } = req.params;
            const {
                a_name,
                a_score,
                a_rest_chain_id
            } = req.body;
            if (!a_name || !a_score) {
                res.status(400).json(message.badRequest('restaurant', id, [a_name, a_score].filter(p => !p)));
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant modify', 'not an owner'));
                return;
            }

            const rest = await this.server.db('t_restaurant').where({
                a_rest_id: id
            }).update({
                a_name: a_name,
                a_score: a_score,
                a_rest_chain_id: a_rest_chain_id
            });

            res.status(200).json(message.put('restaurant', rest));
        } catch (error) {
            console.log(error);
        }
    }

    async getRestaurant(req, res) {
        try {
            const {
                id
            } = req.params;
            let rest = await this.getRestaurantsObjects({ filters: {a_rest_id: id} });
            if (rest) {
                rest = rest[0];
                res.status(200).json(message.fetch('restaurant', rest));
            }
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
        }
    }

    async getRestaurantsObjects(cfg) {
        if (!cfg)
            cfg = {};
        const { filters } = cfg;
        let rests;
        if (!filters)
            rests = await this.server.db('t_restaurant');
        else if (Array.isArray(filters.a_rest_id)) {
            let ids = [...filters.a_rest_id];
            delete filters.a_rest_id;
            rests = await this.server.db('t_restaurant').whereIn('a_rest_id', ids).where(filters);
        }    
        else
            rests = await this.server.db('t_restaurant').where(filters);
        let chain;
        if (rests) {
            if (!Array.isArray(rests))
                rests = [rests];
            for (let i = 0; i < rests.length; i++) {
                if (rests[i].a_rest_chain_id) {
                    chain = await this.restaurantChainRoute.getRestaurantChainsObjects({ filters: {a_rest_chain_id: rests[i].a_rest_chain_id} });
                    if (chain) {
                        chain = chain[0];
                        delete rests[i].a_rest_chain_id;
                        rests[i].a_rest_chain = chain;
                    }
                }
            }
            return rests;
        }
        return null;
    }

    async getAllImages(req, res) {
        try {
            const {
                id
            } = req.params;
            const rest_images = await this.server.db('t_restaurant_images').select('a_image_id', 'a_image_url').where({
                a_rest_id: id
            });
            if (rest_images.length == 1)
                res.status(200).json(message.fetch('restaurant images', rest_images));
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
        }
    }

    async addImage(req, res) {

        const {
            id
        } = req.params;

        const {
            a_image_url
        } = req.body;

        if (typeof(image_url) !== 'string')
            res.status()

        try {

            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });

            if (exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }

            const insert = await this.server.db('t_restaurant_images')
                .insert({
                    a_rest_id: id,
                    a_image_url: a_image_url
                })
                .returning('a_image_id','a_image_url');

            res.status(200).json(message.post('restaurant image', insert));
        } catch (error) {
            console.error('Failed to add restaurant image:');
            console.error(error);
            return res.status(500).json({
                message: 'Failed to add restaurant image'
            });
        }
    }

    async getImage(req, res) {
        try {
            const {id, imageId} = req.params;
            
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });

            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
            
            const rest_image = await this.server.db('t_restaurant_images').select('a_image_id', 'a_image_url').where({
                a_rest_id: id,
                a_image_id: imageId
            });
            if (rest.length == 1)
                res.status(200).json(message.fetch('restaurant image', rest));
            else
                res.status(404).json(message.notFound('restaurant image', imageId));
        } catch (error) {
            console.log(error);
        }
    }

    async removeImage(req, res) {
        const { id, imageId } = req.params;
        
        try {
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });
    
            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }
    
            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
    
            const del = await this.server.db('t_restaurant_images')
                        .where({a_rest_id: id, a_image_id: imageId})
                        .del();
            
            if(del.length == 0)
                res.status(404).json(message.notFound('restaurant image', imageId));
            else
                res.status(200).json(message.delete('restaurant image', [del]));
                
        } catch (error) {
            console.log(error);
        }
    }

    async modifyImage(req, res) {
        const { id, imageId } = req.params;
        const { image_url } = req.body;
        
        try {
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });
    
            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }
    
            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
    
            const mod = await this.server.db('t_restaurant_images')
                        .where({a_rest_id: id, a_image_id: imageId})
                        .update({a_image_url: image_url})
                        .returning("a_image_id", "a_image_url");
            
            if(mod.length == 0)
                res.status(404).json(message.notFound('restaurant image', imageId));
            else
                res.status(200).json(message.update('restaurant image', mod));
                
        } catch (error) {
            console.log(error);
        }
    }

};