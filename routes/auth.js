const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const moment = require("moment");

module.exports = class AuthRoutes {
  constructor(server) {
    this.server = server;
  }

  async initialize(app) {
    // route.get(this.getBooks.bind(this));
    app.get("/verify_email/:token", this.verifyEmail.bind(this));
    app.post("/resend_email", this.resendEmail.bind(this));
    app.post("/login", this.loginUser.bind(this));
    app.post("/register", this.registerUser.bind(this));
    app.delete("/delete_account", this.removeUser.bind(this));
    app.put("/change_password", this.changePassword.bind(this));
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
          a_email: a_email
        })
        .first();

      if (exists)
        return res
          .status(400)
          .json({
            code: "email-exists",
            message: "Email already associated"
          });

      const hash = await bcrypt.hash(a_password, 10);

      let user = await this.server.db.table("t_user").insert({
        a_name: a_name,
        a_email: a_email,
        a_password: hash,
        a_is_verified: false,
      }).returning('*');

      if (Array.isArray(user)) {
        user = user[0];
      }

      this.sendVerificationEmail(user);
      return res.status(200).json({result : true});
      
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

      if (!user.a_is_verified) {
        return res
          .status(401)
          .json({
            code: "not-verified",
            message: "Invalid authorization - Missing email verification."
          });
      }

      const comparePassword = await bcrypt.compare(a_password, user.a_password);
      if (!comparePassword)
        return res
          .status(401)
          .json({
            code: "invalid-auth",
            message: "Invalid authorization - Incorrect password."
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

      return res.status(200).json({
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

  async changePassword(req, res) {
    const {
      a_user_id,
      a_password
    } = req.user;  

    const {
      a_password_old,
      a_password_new
    } = req.body;

    try {
      const comparePassword = await bcrypt.compare(a_password_old, a_password);
      if (!comparePassword) {
        return res
        .status(401)
        .json({
          code: "invalid-auth",
          message: "Invalid authorization."
        });
      }
      
      const hash = await bcrypt.hash(a_password_new, 10); 

      const update = await this.server.db.table("t_user").update({a_password: hash}).where({a_user_id});
      if (update == 1) {
        return res.status(200).json({
          code: "password-changed",
          message: "Password changed successfully"
        });
      }
      else {
        return res.status(500).json({
          message: "Password couldnt be updated"
        });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Failed to change password"
      })
    }
  }

  async removeUser(req, res) {
    const {
      a_password: real_password,
    } = req.user;

    const {
      a_password
    } = req.body;

    try {
      const comparePassword = await bcrypt.compare(a_password, real_password);
      if (!comparePassword) {
        return res
        .status(401)
        .json({
          code: "invalid-auth",
          message: "Invalid authorization."
        });
      }

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
      console.error(error);
      return res.status(500).json({
        message: "Failed to delete user"
      });
    }
  }

  async verifyEmail(req, res) {
    const token = req.params.token;
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    const id = decoded ? decoded.sub : '';
    const exp_date = decoded ? decoded.expiration_date : '';

    if(new Date(exp_date) > new Date()){
      let user = await this.server.db('t_user').where({a_user_id: id});
      
      if (!user) {
        console.log("User not found");
        res.status(404).json({message : "User not found"});
      }
      else {
        console.log("User found");
        //user.a_is_verified = true;
        await this.server.db('t_user').where({a_user_id: id}).update({a_is_verified: true});

        console.log("Email is verified of user "+id);
        return res.status(200).json({result : true});
      }

    }else{
        console.log("Link is expired");
        res.status(400).json({error : "Link is expired"});
    }
  }

  async resendEmail(req, res) {

    const {
      a_email
    } = req.body;

    const user = await this.server
      .db("t_user")
      .where({
        a_email: a_email
      })
      .first();
      
    if (!user) {
      return res
        .status(404)
        .json({
          code: "user-not-registered",
          message: "Email not registered"
        });
    }

    if (user.a_is_verified) {
      return res
        .status(200)
        .json({
          code: "already-verified",
          message: "Email already verified"
        })
    }

    this.sendVerificationEmail(user);
    return res.status(200).json({result : true});

  }

  async sendVerificationEmail(user, req, res) {
      
    const token = JWT.sign({
        iss: "dahwdwuadhawuidha",
        sub: user.a_user_id,
        expiration_date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        iat: moment.utc().valueOf(),
      },
      process.env.JWT_SECRET, {
        expiresIn: "1d"
      }
    );
    console.log("http://localhost:3000/verify_email/" + token);

    const mailOptions = {
        from : "Dychromatic <noreply@vysly.com>",
        to : user.a_email,
        subject : "Email Confirmation",
        html : '<a href="http://localhost:3000/verify_email/'+token+'"><H2>Click on this</H2></a>'
    }

    this.server.transporter.sendMail(mailOptions, (err, data) => {
        if(err){
            console.log(err);
        }else{
            console.log("Email is Sent");
        }
    });
  }

}