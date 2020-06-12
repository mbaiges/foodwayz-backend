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
            let rev = await this.server.db('t_review').where({ 
                a_review_id: id 
            });
            if(rev) {
                if (Array.isArray(rev))
                    rev = rev[0];

                rev.a_user = (await this.userRoute.getUsersObjects({ a_user_id: rev.a_user_id }))[0];
                delete rev.a_user_id;

                rev.a_food = (await this.userRoute.getUsersObjects({ a_food_id: rev.a_food_id }))[0];
                delete rev.a_food_id;

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
        const userId = req.user.a_user_id;
        const { desc, score } = req.body;

        console.log(score);

        const params = {
            desc: [desc, typeof(desc) === 'string'],
            score: [score, (Number(score) === score && score >= 0 && score <= 5)],
        }

        let errors = {};
        Object.entries(params).forEach(prop => {
            if(!prop[1][1]) {
                errors[prop[0]] = prop[1][0];
            }
        });

        let aux;
        if((aux = Object.keys(errors)).length != 0) {
            
            res.status(400).json(message.badRequest('review', aux, errors));
            return;
        }

        try {
            const rev = await this.server.db('t_review').insert({
                a_user_id: userId,
                a_food_id: foodId,
                a_score: score,
                a_desc: desc
            }).returning('*');

            res.status(200).json(message.post('review', rev));            
        } catch (error) {
            console.log(error);
            res.status(409).json(message.conflict('review', error.detail, null));
        }
    }
    
    async getRevsByFood(req, res) {
        const { foodId } = req.params;

        try {
            let revs = await this.server.db('t_review').where({a_food_id: foodId});
            if (revs) {
                for(r in revs) {
                    r.a_user = (await this.userRoute.getUsersObjects({ a_user_id: r.a_user_id }))[0];
                    delete r.a_user_id;
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
                for (let i = 0; i < revs.length; i++) {
                    revs[i].a_food = (await this.foodRoute.getFoodsObjects({ a_food_id: revs[i].a_food_id }))[0];
                    delete revs[i].a_food_id;
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