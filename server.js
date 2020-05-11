const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jetpack = require('fs-jetpack');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

		this.swaggerOptions = {
			swaggerDefinition: {
				info: {
					title: 'FoodWayz API',
					description: 'FoodWayz API Information',
					contact: {
						name: 'Dychromatic'
					},
					license: {
						name: 'MIT',
						url: 'https://opensource.org/licenses/MIT'
					},
					servers: ['http://localhost:3002'],
					tags: [
						{
							name: 'Restaurants',
							description: 'Restaurants information'
						}
					],
					components: {
  						securitySchemes: {
							accessToken: { 
								type: 'http',
								scheme: 'bearer',
								bearerFormat: 'JWT',
							}
						}
					}
				}
			},
			apis: ['routes/*.js'],
		};
		
		this.swaggerDocs = swaggerJsDoc(this.swaggerOptions);
		this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.swaggerDocs));

		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
		this.app.use(cors())

		// Auth Middleware
		new AuthMiddleware(this);

		// RegisterRoutes
		this.registerRoutes();

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
