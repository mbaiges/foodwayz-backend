const JWT = require('jsonwebtoken');

module.exports = class AuthMiddleware {
	constructor(server) {
		this.server = server;

		this.server.app.use(this.doMiddleware.bind(this));
	}

	async doMiddleware(req, res, next) {
		const publicRoutes = [ '/login', '/register', 'verify_email', 'reset_password' ];
		
		for (let i = 0; i < publicRoutes.length; i++) {
			if (req.originalUrl.includes(publicRoutes[i])) {
				return next();
			}
		}

		// Check Header
		if (!req.headers.authorization) return res.status(401).json({ message: 'No authorization header provided' });

		// headers
		// headers->authorization = 'Bearer asdasdasd1easdsadasd`

		// Get & Check Token
		const token = req.headers.authorization.split(' ')[1];
		if (!token) return res.status(401).json({ message: 'No authorization header provided' });

		try {
			const decoded = JWT.verify(token, process.env.JWT_SECRET);

			const id = decoded ? decoded.sub : '';
			// const iat = decoded ? decoded.iat : '';

			let user = await this.server.db('t_user').where({ a_user_id: id }).first();
			if (!user) return res.status(401).json({ message: 'Invalid authorization' });

			req.user = user;

			return next();

		} catch(error) {
			console.error('Authorize Error!');
			console.error(error);
			return res.status(401).json({ message: 'Your token appears to be invalid or incorrect' });
		}

		// Seguimos si esta todo bien
		next();
	}
}
