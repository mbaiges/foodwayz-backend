const message = require('../interface').message;

module.exports = class RestaurantRoute {
    constructor(server) {
        this.server = server;
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
        
        app.route('/restaurant/:id/image/:image_id')
            .get(this.getImage.bind(this))
            .put(this.modifyImage.bind(this))
            .delete(this.removeImage.bind(this));
    }

    /**
     * @swagger
     *
     * /restaurant:
     *   post:
     *     description: Get all restaurants
     *     security:
     *       - accessToken []
     *     tags:
     *      - Restaurant
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Get success
     */
    async getRestaurants(req, res) {
        // Fetch restaurants from db
        try {
            const restaurants = await this.server.db('t_restaurant');
            res.status(200).json(message.fetch('restaurant', restaurants));
        } catch (error) {
            console.log(error);
        }
    }


    async addRestaurant(req, res) {

        const {
            name,
            state,
            postal_code,
            city,
            address,
            rest_chain_id
        } = req.body;

        try {

            const owner = await this.server.db('t_owner').where({
                a_user_id: req.user.a_user_id
            }).first();
            if (owner.length === 0) return res.status(401).json(message.unauth('add restaurant', 'Not registered as owner'));

            if (rest_chain_id) {
                const rest_chain = await this.server.db('t_restaurant_chain').where({
                    a_rest_chain_id: rest_chain_id
                }).first();
                if (rest_chain) return res.status(404).json(message.notFound('restaurant chain', rest_chain_id));
            }

            const exists = await this.server.db('t_restaurant').where({
                a_state: state,
                a_postal_code: postal_code,
                a_city: city,
                a_address: address
            }).first();
            if (exists) return res.status(409).json(message.conflict('restaurant', 'already exists', exists));

            const insert = await this.server.db('t_restaurant')
                .insert({
                    a_name: name,
                    a_city: city,
                    a_state: state,
                    a_postal_code: postal_code,
                    a_rest_chain_id: rest_chain_id,
                    a_address: address
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
                name,
                score,
                rest_chain_id
            } = req.body;
            if (!name || !score) {
                res.status(400).json(message.badRequest('restaurant', id, [name, score].filter(p => !p)));
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant modify', 'not an owner'));
                return;
            }

            const rest = await this.server.db('t_restaurant').where({
                a_rest_id: id
            }).update({
                a_name: name,
                a_score: score,
                a_rest_chain_id: rest_chain_id
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
            const rest = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });
            if (rest.length == 1)
                res.status(200).json(message.fetch('restaurant', rest));
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
        }
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
            image_url
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

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }

            const insert = await this.server.db('t_restaurant_images')
                .insert({
                    a_rest_id: id,
                    a_image_url: image_url
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
            const {id, image_id} = req.params;
            
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });

            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
            
            const rest_image = await this.server.db('t_restaurant_images').select('a_image_id', 'a_image_url').where({
                a_rest_id: id,
                a_image_id: image_id
            });
            if (rest.length == 1)
                res.status(200).json(message.fetch('restaurant image', rest));
            else
                res.status(404).json(message.notFound('restaurant image', image_id));
        } catch (error) {
            console.log(error);
        }
    }

    async removeImage(req, res) {
        const { id, image_id } = req.params;
        
        try {
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });
    
            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }
    
            const owns = await this.server.db('t_owns').where({a_user_id: req.user.id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
    
            const del = await this.server.db('t_restaurant_images')
                        .where({a_rest_id: id, a_image_id: image_id})
                        .del();
            
            if(del.length == 0)
                res.status(404).json(message.notFound('restaurant image', image_id));
            else
                res.status(200).json(message.delete('restaurant image', [del]));
                
        } catch (error) {
            console.log(error);
        }
    }

    async modifyImage(req, res) {
        const { id, image_id } = req.params;
        const { image_url } = req.body;
        
        try {
            const exists = await this.server.db('t_restaurant').where({
                a_rest_id: id
            });
    
            if (!exists || exists.length == 0) {
                res.status(404).json(message.notFound('restaurant', id))
                return;
            }
    
            const owns = await this.server.db('t_owns').where({a_user_id: req.user.id, a_rest_id: id});
            if (!owns || owns.length == 0) {
                res.status(401).json(message.unauth('restaurant image add', 'not an owner'));
                return;
            }
    
            const mod = await this.server.db('t_restaurant_images')
                        .where({a_rest_id: id, a_image_id: image_id})
                        .update({a_image_url: image_url})
                        .returning("a_image_id", "a_image_url");
            
            if(mod.length == 0)
                res.status(404).json(message.notFound('restaurant image', image_id));
            else
                res.status(200).json(message.update('restaurant image', mod));
                
        } catch (error) {
            console.log(error);
        }
    }

};