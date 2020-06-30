const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const moment = require("moment");

module.exports = class AuthRoutes {
  constructor(server) {
    this.server = server;
  }

  async initialize(app) {
    // route.get(this.getBooks.bind(this));
    app.post("/login", this.loginUser.bind(this));
    app.post("/register", this.registerUser.bind(this));
  }

  async registerUser(req, res) {
    const {
      a_name,
      a_email,
      a_password
    } = req.body;

    if (!a_name || !a_email || !a_password)
      return res
        .status(400)
        .json({
          code: "prop-missing",
          message: "Properties missing"
        });

    try {
      const exists = await this.server
        .db("t_user")
        .where({
          a_name: a_name
        })
        .first();
      if (exists)
        return res
          .status(400)
          .json({
            code: "user-exists",
            message: "Username already exists"
          });

      const hash = await bcrypt.hash(password, 10);

      console.log("asdasdasd");

      await this.server.db.table("t_user").insert({
        a_name: a_name,
        a_email: a_email,
        a_password: hash,
      });

      return res.json({
        code: "user-reg",
        message: "Successfully Registered"
      });
    } catch (error) {
      console.error("Failed to register user:");
      console.error(error);
      return res.status(500).json({
        message: "Failed to register user"
      });
    }
  }

  async loginUser(req, res) {
    const {
      a_email,
      a_password
    } = req.body;

    try {
      const user = await this.server
        .db("t_user")
        .where({
          a_email: a_email
        })
        .first();
      if (!user)
        return res.status(400).json({
          code: "user-not-exists",
          message: "A user with that mail address was not found.",
        });

      const comparePassword = await bcrypt.compare(a_password, user.a_password);
      if (!comparePassword)
        return res
          .status(401)
          .json({
            code: "invalid-auth",
            message: "Invalid authorization."
          });

      const jwt = JWT.sign({
          iss: "dahwdwuadhawuidha",
          sub: user.a_user_id,
          iat: moment.utc().valueOf(),
        },
        process.env.JWT_SECRET, {
          expiresIn: "30d"
        }
      );

      return res.json({
        code: "user-logged",
        message: "Successfully logged in.",
        user: {
          a_user_id: user.a_user_id,
          a_email: user.a_email,
          a_name: user.a_name,
        },
        accessToken: jwt,
      });
    } catch (error) {
      console.error("Failed to login user:");
      console.error(error);
      return res.status(500).json({
        message: "Failed to login user"
      });
    }
  }

  async removeUser(req, res) {
    const {
      a_email,
      a_password
    } = req.body;

    try {
      const user = await this.server
        .db("t_user")
        .where({
          a_email: a_email
        })
        .first();
      if (!user)
        return res.status(400).json({
          code: "user-not-exists",
          message: "A user with that mail address was not found.",
        });

      const comparePassword = await bcrypt.compare(a_password, user.a_password);
      if (!comparePassword)
        return res
          .status(401)
          .json({
            code: "invalid-auth",
            message: "Invalid authorization."
          });

      const del = await this.server
        .db("t_user")
        .where({
          a_email: a_email
        })
        .first()
        .del();

      return res.status(200).json({
        code: "user-deleted",
        message: "User deleted",
      });
    } catch (error) {
      console.error("Failed to login user:");
      console.error(error);
      return res.status(500).json({
        message: "Failed to delete user"
      });
    }
  }
};