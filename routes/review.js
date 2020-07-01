const message = require('../interface').message;

module.exports = class ReviewRoute {
    constructor(server) {
        this.server = server;    
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
        if (!this.userRoute) {
            const UserRoute = require('./user');
            this.userRoute = new UserRoute(this.server);
        }
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const { id } = req.params;

        try {
            let rev = await this.server.db('t_review').where({ 
                a_review_id: id 
            });
            if(rev.length != 0) {
                if (Array.isArray(rev))
                    rev = rev[0];

                rev.a_user = (await this.userRoute.getUsersObjects({ filters: { a_user_id: rev.a_user_id } }))[0];
                delete rev.a_user_id;

                rev.a_food = (await this.foodRoute.getFoodsObjects({ filters: { a_food_id: rev.a_food_id } }))[0];
                delete rev.a_food_id;

                res.status(200).json(message.fetch('review', rev));
            }
            else
                res.status(404).json(message.notFound('review', id)); 
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async delRev(req, res) {
        const { id } = req.params;
        const { a_user_id: userId } = req.user;

        try {
            const rev = await this.server.db('t_review').where({
                a_review_id: id,
                a_user_id: userId
            }).del();
            if(rev != 0) 
                res.status(200).json(message.delete('review', rev));
            else
                res.status(404).json(message.notFound('review', id));

        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

    async addRev(req, res) {
        const { foodId } = req.params;
        const userId = req.user.a_user_id;
        const { a_desc, a_score } = req.body;

        console.log(a_score);

        const params = {
            a_desc: [a_desc, typeof(a_desc) === 'string'],
            a_score: [a_score, (Number(a_score) === a_score && a_score >= 0 && a_score <= 5)],
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
                a_score: a_score,
                a_desc: a_desc
            }).returning('*');

            res.status(200).json(message.post('review', rev));            
        } catch (error) {
            console.log(error);
            if(error.detail == null || error.detail == undefined)
                res.status(500).json({message: error.message});
            else
                res.status(409).json(message.conflict('review', error.detail, null));
        }
    }
    
    async getRevsByFood(req, res) {
        if (!this.userRoute) {
            const UserRoute = require('./user');
            this.userRoute = new UserRoute(this.server);
        }
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const { foodId } = req.params;

        try {
            let revs = await this.server.db('t_review').where({a_food_id: foodId});
            console.log(revs);
            if (revs.length != 0) {
                
                for (let idx = 0; idx < revs.length; idx++) {
                    revs[idx].a_user = (await this.userRoute.getUsersObjects({ filters: { a_user_id: revs[idx].a_user_id } }))[0];
                    delete revs[idx].a_user_id;
                    revs[idx].a_food = (await this.foodRoute.getFoodsObjects({ filters: { a_food_id: revs[idx].a_food_id } }))[0];
                    delete revs[idx].a_food_id;
                }

                res.status(200).json(message.fetch('reviews by food', revs));
            }
            else
                res.status(404).json(message.notFound('reviews by food', foodId));
            
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
        
    }

    async getRevsByUser(req, res) {
        if (!this.userRoute) {
            const UserRoute = require('./user');
            this.userRoute = new UserRoute(this.server);
        }
        if (!this.foodRoute) {
            const FoodRoute = require('./food');
            this.foodRoute = new FoodRoute(this.server);
        }

        const { userId } = req.params;

        try {
            let revs = await this.server.db('t_review').where({a_user_id: userId});
        
            if (revs.length != 0) {
                for (let i = 0; i < revs.length; i++) {
                    revs[idx].a_user = (await this.userRoute.getUsersObjects({ filters: { a_user_id: revs[idx].a_user_id } }))[0];
                    delete revs[idx].a_user_id;
                    revs[idx].a_food = (await this.foodRoute.getFoodsObjects({ filters: { a_food_id: revs[idx].a_food_id } }))[0];
                    delete revs[idx].a_food_id;
                }
                res.status(200).json(message.fetch('reviews by user', revs));
            }
            else
                res.status(404).json(message.notFound('reviews by user', userId))
        } catch (error) {
            console.log(error);
            res.status(500).json({message: error.message});
        }
    }

};