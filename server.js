const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jetpack = require('fs-jetpack');
const nodemailer = require('nodemailer');

const AuthMiddleware = require('./middleware/auth');

module.exports = class Server {
	constructor() {
		this.app = express();

		this.db = require('knex')({
			client: 'pg',
			connection: {
				host : process.env.DB_HOST || '127.0.0.1',
				user : process.env.DB_USER || 'root',
				password : process.env.DB_PASSWORD || '123321',
				database : process.env.DB_DATABASE || 'test'
			}
		});

		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
		this.app.use(cors())

		// Auth Middleware
		new AuthMiddleware(this);

		// RegisterRoutes
		this.registerRoutes();

		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'dychromatic.foodwayz@gmail.com',
			  pass: 'foodwayz.itba.edu.ar'
			}
		});

		this.app.listen(process.env.PORT, () => {
			console.log(`Server listening is listening on port: ${process.env.PORT}`)
		})
	}


	registerRoutes() {
		console.log('Registering routes...');

		jetpack.find('./routes', { matching: '*.js' }).forEach(routeFilePath => {
			console.log(`Found route file: ${routeFilePath}`)

			const route = require(`./${routeFilePath}`);
			const routeInstance = new route(this);

			// Initialize route
			routeInstance.initialize(this.app);
		});

		console.log('All routes registered.');
	}
}
