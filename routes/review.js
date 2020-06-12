const message = require('../interface').message;
const UserRoute = require('./user');
const FoodRoute = require('./food');

module.exports = class ReviewRoute {
    constructor(server) {
        this.server = server;
        this.userRoute = new UserRoute(server);
        this.foodRoute = new FoodRoute(server);        
    }

    async initialize(app) {
        app.route('/review/:id')
            .get(this.getRev.bind(this))
            .delete(this.delRev.bind(this));

        app.route('/review/food/:foodId')
            .post(this.addRev.bind(this))
            .get(this.getRevsByFood.bind(this));

        app.route('/review/user/:userId')
            .get(this.getRevsByUser.bind(this));

    }

    async getRev(req, res) {
        const { id } = req.params;

        try {
            let rev = await this.server.db('t_review').select('*').where({ 
                a_review_id: id 
            });
            if(rev) {
                rev = rev[0];
                res.status(200).json(message.fetch('review', rev));
            }
            else
                res.status(404).json(message.notFound('review', id)); 
        } catch (error) {
            console.log(error);
        }
    }

    async delRev(req, res) {
        const { id } = req.params;

        try {
            const rev = await this.server.db('t_review').where({
                a_review_id: id
            }).del();

            if(rev) 
                res.status(200).json(message.delete('review', rev));
            else
                res.status(404).json(message.notFound('review', id));

        } catch (error) {
            console.log(error);
        }
    }

    async addRev(req, res) {
        const { foodId } = req.params;
        const { a_user_id } = req.user;
        const { desc, score } = req.body;

        try {
            
        } catch (error) {
            console.log(error);
        }
    }
    
    async getRevsByFood(req, res) {
        const { foodId } = req.params;

        try {
            let revs = await this.server.db('t_review').where({a_food_id: foodId});
            if (revs) {
                let userId;
                for(r in revs) {
                    userId = r.a_user_id;
                    delete r.a_user_id;
                    r.a_user = (await this.userRoute.getUsersObjects({ a_user_id: userId }))[0];                    
                }

                res.status(200).json(message.fetch('reviews by food', revs));
            }
            else
                res.status(404).json(message.notFound('reviews by food', foodId));
            
        } catch (error) {
            console.log(error);
        }
        
    }

    async getRevsByUser(req, res) {
        const { userId } = req.params;

        try {
            let revs = await this.server.db('t_review').where({a_user_id: userId});
        
            if (revs) {
                let food;
                for (let i = 0; i < revs.length; i++) {
                    food = await this.foodRoute.getFoodsObjects({a_food_id: revs[i].a_food_id});
                    if (food) {
                        food = food[0];
                        delete revs[i].a_food_id;
                        revs[i].a_food = food;
                    }
                }
                res.status(200).json(message.fetch('reviews by user', revs));
            }
            else
                res.status(404).json(message.notFound('reviews by user', userId))
        } catch (error) {
            console.log(error);
        }
    }

};