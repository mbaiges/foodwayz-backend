module.exports = class RestaurantRoute {
	constructor(server) {
		this.server = server;
	}

	async initialize(app) {
        app.route('/restaurant')
        .get(this.getRestaurants.bind(this))
        .post(this.addRestaurant.bind(this))
        .delete(this.removeRestaurant.bind(this));
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
		const restaurants = await this.server.db('t_restaurant');
		res.status(200).json({ message: 'Successfully fetched restaurants', restaurants });
	}

    
    async addRestaurant(req, res) {

        const { name, state, postal_code, city, address, rest_chain_id } = req.body;

        const owner = await this.server.db('t_owner').where({ a_user_id: req.user.a_user_id }).first();
        if (!owner) return res.status(401).json({ code: 'not-owner', message: 'Invalid authorization: to add a resturnt you nust be registered as owner.' });

        if(rest_chain_id) {
            const rest_chain = await this.server.db('t_restaurant_chain').where({ a_rest_chain_id: rest_chain_id }).first();
            if (rest_chain) return res.status(400).json({ code: 'rest-chain-no-exists', message: 'Restaurant chain does not exists'});
        }
       
        const exists = await this.server.db('t_restaurant').where({ a_state: state, a_postal_code: postal_code, a_city: city, a_address: address }).first();
        if (exists) return res.status(400).json({ code: 'rest-exists', message: 'Restaurant already exists' });

        try {
            const insert = await this.server.db('t_restaurant')
            .insert({ a_name: name, a_city: city, a_state: state, a_postal_code: postal_code, a_rest_chain_id: rest_chain_id, a_address: address }) 
            .returning('*');

            res.json({ message: 'Successfully inserted restaurant', insert });
        } catch (error) {
            console.error('Failed to add restaurant:');
            console.error(error);
            return res.status(500).json({ message: 'Failed to add restaurant' });
        }
    }

    async removeRestaurant(req, res) {
        const { rest_id } = req.body;
        if (typeof rest_id !== 'number' || id < 0) return res.status(400).json({ message: 'Invalid body' });

        const rest = await this.server.db('t_restaurant').where({ a_rest_id: rest_id }).first();
        if (!rest) return res.status(400).json({ code: 'rest-no-exists', message: 'Restaurant does not exists' });

        const owns = await this.server.db('t_owns').where({ a_user_id: req.user.a_user_id, a_rest_id: rest_id }).first();
        if (!owns) return res.status(401).json({ code: 'not-owner', message: 'Invalid authorization' });
        
        try {
            const del = await this.server.db('t_restaurant')
            .where({ rest_id })
            .del();
    
            res.json({ message: 'Successfully deleted restaurant', del });
        } catch (error) {
            console.error('Failed to delete restaurant:');
            console.error(error);
            return res.status(500).json({ message: 'Failed to delete restaurant' });
        }
    }

    
        
};
