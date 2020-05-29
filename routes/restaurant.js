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

        const owner = await this.server.db('t_owner').where({
            a_user_id: req.user.a_user_id
        }).first();
        if (!owner) return res.status(401).json({
            code: 'not-owner',
            message: 'Invalid authorization: to add a resturnt you nust be registered as owner.'
        });

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

        try {
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
                res.status(200).json(message.fetch('rest', rest));
            else
                res.status(404).json(message.notFound('restaurant', id));
        } catch (error) {
            console.log(error);
        }
    }

};