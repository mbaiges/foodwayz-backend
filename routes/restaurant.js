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

        app.route('/restaurant/:id/stats')
            .get(this.getStatistics.bind(this));

        app.route('/restaurant/:id/premium')
            .put(this.updatePremiumStatus.bind(this));

        app.route('/restaurant/:id/food')
            .get(this.getFoods.bind(this));

        app.route('/restaurant/:id/image')
            .get(this.getAllImages.bind(this))
            .post(this.addImages.bind(this));
        
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
            res.status(500).json({message: error.message});
        }
    }


    async addRestaurant(req, res) {

        const {
            a_user_id
        } = req.user;

        const {
            a_name,
            a_state,
            a_postal_code,
            a_city,
            a_address,
            a_rest_chain_id
        } = req.body;

        try {

            if (a_rest_chain_id) {
                const rest_chain = await this.server.db('t_restaurant_chain').where({
                    a_rest_chain_id: a_rest_chain_id
                }).first();
                if (!rest_chain) return res.status(404).json(message.notFound('restaurant chain', a_rest_chain_id));
            }

            const exists = await this.server.db('t_restaurant').where({
                a_state: a_state,
                a_postal_code: a_postal_code,
                a_city: a_city,
                a_address: a_address
            }).first();
            if (exists) return res.status(409).json(message.conflict('restaurant', 'already exists', exists));

            let insert = await this.server.db('t_restaurant')
                .insert({
                    a_name: a_name,
                    a_city: a_city,
                    a_state: a_state,
                    a_postal_code: a_postal_code,
                    a_rest_chain_id: a_rest_chain_id,
                    a_address: a_address,
                    a_premium_level: 0
                })
                .returning('*');

            if (insert) {
                if (Array.isArray(insert)) {
                    insert = insert[0];
                }

                const owns = await this.server.db('t_owns').insert({
                    a_user_id,
                    a_rest_id: insert.a_rest_id
                }).returning('*');

                res.status(200).json(message.post('restaurant', insert));
            }
        } catch (error) {
            console.error('Failed to add restaurant:');
            console.error(error);
            return res.status(500).json({
                message: 'Failed to add restaurant'
            });
        }
    }

    async removeRestaurant(req, res) {
        if (!this.restaurantChainRoute) {
            const RestaurantChainRoute = require('./restaurant_chain');
            this.restaurantChainRoute = new RestaurantChainRoute(this.server);
        }

        try {

            const {
                id
            } = req.params;

            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant delete', 'not an owner'));
                return;
            }

            const chainId = await this.server.db('t_restaurant').select('a_rest_chain_id').where('a_rest_id', '=', id);
            console.log(chainId);
            const response = await this.server.db('t_restaurant').where('a_rest_id', '=', id).del();
            if (response != 0) {
                res.status(200).json(message.delete('restaurant', response));
                if(chainId[0].a_rest_chain_id != null) {
                    this.restaurantChainRoute.updateChainScore(chainId[0].a_rest_chain_id);
                }
            }
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
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
            res.status(500).json({message: error.message});
        }
    }

    async getRestaurant(req, res) {
        try {

            const {
                id
            } = req.params;

            let rest = await this.getRestaurantsObjects({ filters: {a_rest_id: id} });
            if (rest.length != 0) {
                rest = rest[0];
                res.status(200).json(message.fetch('restaurant', rest));
            }
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getRestaurantsObjects(cfg) {
        if (!this.restaurantChainRoute) {
            const RestaurantChainRoute = require('./restaurant_chain');
            this.restaurantChainRoute = new RestaurantChainRoute(this.server);
        }

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

    async getStatistics(req, res) {
        const {
            id
        } = req.params;

        /*
            - Cantidad de vistas en el ultimo día (restaurant y comidas)
            - Cantidad de vistas (Por días de la semana, por hora) (restaurant y comidas)
            - Cantidad de usuarios por genero (restaurant y comidas)
            - Cantidad de usuarios por edad (restaurant y comidas)
            - Cantidad de usuarios por características (restaurant y comidas)
            - Mejores 10 comidas (por presentacion, calidad y precio-calidad)
            - Peores 10 comidas (por presentacion, calidad y precio-calidad)
        */

        let info = await this.server.db('t_restaurant')

    }

    async updatePremiumStatus(req, res) {
        const { id } = req.params;
        const { a_premium_level } = req.body;

        if(!Number.isInteger(a_premium_level)) {
            res.status(400).json(message.badRequest('premium level', id, a_premium_level));
            return;
        }

        try {
            const owns = await this.server.db('t_owns').where({a_user_id: req.user.a_user_id, a_rest_id: id});
            if (owns.length == 0) {
                res.status(401).json(message.unauth('restaurant update premium', 'not an owner'));
                return;
            }

            const rest = await this.server.db('t_restaurant').update({
                a_premium_level: a_premium_level
            }).where({a_rest_id: id});

            if(rest == 0)
                res.status(404).json(message.notFound('restaurant', id));
            else
                res.status(200).json(message.put('premium level', rest));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async getFoods(req, res) {
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const { id } = req.params;

        try {
            const foods = await this.foodRoute.getFoodsObjects({ filters: {a_rest_id: id} });
            res.status(200).json(message.fetch(`foods by restaurant id ${id}`, foods));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getAllImages(req, res) {
        try {
            const {
                id
            } = req.params;
            const rest_images = await this.server.db('t_restaurant_images').select('*').where({
                a_rest_id: id
            });

            if (!Array.isArray(rest_images)) {
                rest_images = [rest_images];
            }
            res.status(200).json(message.fetch('restaurant image', rest_images));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addImages(req, res) {

        try {
            const {
                id
            } = req.params;
    
            const {
                a_images
            } = req.body;
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

            if (Array.isArray(a_images)) {
                a_images.forEach(img => img.a_rest_id = id);
                const insert = await this.server.db('t_restaurant_images')
                    .insert(a_images)
                    .returning('*');
                res.status(200).json(message.post('restaurant image', insert));
            }
            else {
                throw {message: '"a_images" is not an array of objects'};
            }

        } catch (error) {
            console.error('Failed to add restaurant image:');
            console.error(error);
            return res.status(500).json({
                message: error.message
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
            
            const rest_image = await this.server.db('t_restaurant_images').select('*').where({
                a_rest_id: id,
                a_image_id: imageId
            });

            if (rest_image.length != 0)
                res.status(200).json(message.fetch('images from the restaurant', rest_image));
            else
                res.status(404).json(message.notFound('images from the restaurant', id));
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
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
            if(del == 0)
                res.status(404).json(message.notFound('restaurant image', imageId));
            else
                res.status(200).json(message.delete('restaurant image', del));
                
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async modifyImage(req, res) {
        const { id, imageId } = req.params;
        const { a_image_url, a_image_extra } = req.body;
        
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
                        .update({a_image_url: a_image_url, a_image_extra: a_image_extra})
                        .returning('*');
            
    
            if(mod.length == 0)
                res.status(404).json(message.notFound('restaurant image', imageId));
            else
                res.status(200).json(message.put('restaurant image', mod));
                
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async updateRestScore(restId) {
        if (!this.restaurantChainRoute) {
            const RestaurantChainRoute = require('./restaurant_chain');
            this.restaurantChainRoute = new RestaurantChainRoute(this.server);
        }

        try {
            let quality = 0, presentation = 0, price = 0;
            const foods = await this.server.db('t_food').select('a_food_quality_score', 'a_presentation_score', 'a_price_quality_score').where({a_rest_id: restId});

            if(foods.length != 0) {
                foods.forEach(f => {
                    quality += parseFloat(f.a_food_quality_score);
                    presentation += parseFloat(f.a_presentation_score);
                    price += parseFloat(f.a_price_quality_score);
                })

                quality = quality/foods.length;
                presentation = presentation/foods.length;
                price = price/foods.length;

                await this.server.db('t_restaurant').update({
                    a_food_quality_score: quality,
                    a_presentation_score: presentation,
                    a_price_quality_score: price,
                    a_score: (quality + presentation + price)/3
                }).where({a_rest_id: restId});
            } else {
                await this.server.db('t_restaurant').update({
                    a_food_quality_score: 0,
                    a_presentation_score: 0,
                    a_price_quality_score: 0,
                    a_score: 0
                }).where({a_rest_id: restId});
            }
            const chainId = (await this.server.db('t_restaurant').select('a_rest_chain_id').where({a_rest_id: restId}))[0].a_rest_chain_id;
            if(chainId != null && chainId != undefined) {
                this.restaurantChainRoute.updateChainScore(chainId);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

};