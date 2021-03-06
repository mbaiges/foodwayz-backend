const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const moment = require("moment");
const crypto = require("crypto");
const message = require('../interface').message;

module.exports = class AuthRoutes {
  constructor(server) {
    this.server = server;
  }

  async initialize(app) {
    app.post("/verify_email", this.verifyEmail.bind(this));
    app.post("/reset_password", this.resetPassword.bind(this));
    app.post("/reset_password/confirm", this.resetPasswordConfirmation.bind(this));
    app.post("/resend_email", this.resendVerificationEmail.bind(this));
    app.post("/login", this.loginUser.bind(this));
    app.post("/register", this.registerUser.bind(this));
    app.delete("/delete_account", this.removeUser.bind(this));
    app.put("/change_password", this.changePassword.bind(this));
  }

  async registerUser(req, res) {
    let {
      a_name,
      a_email,
      a_password
    } = req.body;

    const params = {
      a_name: [a_name, typeof(a_name) === 'string'],
      a_email: [a_email, typeof(a_email) === 'string'],
      a_password: [a_password, typeof(a_password) === 'string']
    };
    let errors = {};
    Object.entries(params).forEach(prop => {
        if(!prop[1][1]) {
            errors[prop[0]] = prop[1][0];
        }
    });

    let aux;
    if((aux = Object.keys(errors)).length != 0) {
        
        res.status(400).json(message.badRequest('register', aux, errors));
        return;
    }

    a_email = a_email.toLowerCase().replace(/ /g,"");

    try {
      const exists = await this.server
        .db("t_user")
        .where({
          a_email: a_email
        });

      if (exists && exists.length > 0) {
        return res
        .status(400)
        .json({
          code: "email-exists",
          message: "Email already associated"
        });
      }

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
    let {
      a_email,
      a_password
    } = req.body;

    a_email = a_email.toLowerCase().replace(/ /g,"");

    try {
      let user = await this.server
        .db("t_user")
        .where({
          a_email: a_email
        });

      if (!user || user.length == 0)
        return res.status(400).json({
          code: "user-not-exists",
          message: "A user with that mail address was not found.",
        });

      user = user[0];

      const comparePassword = await bcrypt.compare(a_password, user.a_password);
      if (!comparePassword)
        return res
          .status(401)
          .json({
            code: "invalid-auth",
            message: "Invalid authorization - Incorrect password."
          });

      if (!user.a_is_verified) {
        return res
          .status(401)
          .json({
            code: "not-verified",
            message: "Invalid authorization - Missing email verification."
          });
      }

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
      a_user_id,
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

      const foodRevs = await this.server.db('t_review').select('a_food_id').where({a_user_id: a_user_id}).distinct();

      await this.server.db("t_user").where({a_user_id}).del();

      if(foodRevs.length != 0) {
        if (!this.foodRoute) {
          const FoodRoute = require('./food');
          this.foodRoute = new FoodRoute(this.server);
        }

        for (const idx in foodRevs) {
          this.foodRoute.updateFoodScore(foodRevs[idx].a_food_id);
        }
      }

      return res.status(200).json({
        code: "user-deleted",
        message: "User deleted",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: error.message
      });
    }
  }

  async verifyEmail(req, res) {

    let {
      a_email,
      a_code
    } = req.body;

    a_email = a_email.toLowerCase().replace(/ /g,"");

    let user = await this.server.db('t_user').where({a_email});

    if (user && user.length > 0) {
      user = user[0];
      if (user.a_is_verified) {
        return res.status(200).json({result: true, code: "already-verified"});
      }

      let userVerify = await this.server.db('t_user_verify').where({a_user_id: user.a_user_id});
      
      if (userVerify && userVerify.length > 0) {
        userVerify = userVerify[0];
        if(new Date(userVerify.a_valid_until) > new Date()){
          if (userVerify.a_code.toUpperCase() === a_code.toUpperCase()) {
            user.a_is_verified = true;
            await this.server.db('t_user').where({a_user_id: user.a_user_id}).update(user);
            this.server.db('t_user_verify').where({a_user_id: user.a_user_id}).del();
            return res.status(200).json({result: true, code: "verified"});
          }
          else {
            return res.status(200).json({result: false, code: "invalid-code"});
          }
        }
        else {
          return res.status(200).json({result: false, code: "expired-code"})
        }
      }
      else {
        // Should never happen
      }
    }
    else {
      return res.status(404).json({result: false, code: "email-not-registered"});
    }

    if(new Date(exp_date) > new Date()){
      let user = await this.server.db('t_user').where({a_user_id: id});
      
      if (!user || user.length == 0) {
        console.log("User not found");
        return res.status(404).json({message : "User not found"});
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
        return res.status(400).json({error : "Link is expired"});
    }
  }

  async resendVerificationEmail(req, res) {

    const {
      a_email
    } = req.body;

    let user = await this.server
      .db("t_user")
      .where({
        a_email: a_email
      });
      
    if (!user || user.length == 0) {
      return res
        .status(404)
        .json({
          code: "user-not-registered",
          message: "Email not registered"
        });
    }

    user = user[0];

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

  async sendVerificationEmail(user) {

    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    const exists = await this.server.db('t_user_verify').where({a_user_id: user.a_user_id});

    const userVerify = {
      a_user_id: user.a_user_id,
      a_code: code,
      a_valid_until: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }

    if (exists && exists.length > 0) {
      await this.server.db('t_user_verify').where({a_user_id: user.a_user_id}).update(userVerify);
    }
    else {
      await this.server.db('t_user_verify').insert(userVerify);
    }

    const mailOptions = {
        from : "Dychromatic <noreply@vysly.com>",
        to : user.a_email,
        subject : "Email Confirmation",
        html : `<div>
                  <h1 style="text-align: center;">
                    <strong>Welcome to <span style="color: #fc987e;">FoodWayz</span></strong>
                  </h1>
                  <p>
                    <strong>
                      <span style="color: #fc987e;">
                        <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200705/email.png" alt="Meeting New Members" width="500" height="500" />
                      </span>
                    </strong>
                  </p>
                  <h1 style="text-align: center;">
                    <strong>Your code is <span style="color: #fc987e;">${code}</span></strong>
                  </h1>
               </div>` 
    }

    //console.log(mailOptions);

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
    }

  }

  async resetPassword(req, res) {

    let {
      a_email
    } = req.body;

    a_email = a_email.toLowerCase().replace(/ /g,"");

    let user = await this.server.db('t_user').where({a_email});

    if (user && user.length > 0) {
      user = user[0];

      if (user.a_is_verified) {
        this.sendResetPasswordEmail(user)
        return res.status(200).json({result: true, code: "email-sent"});
      }
      else {
        return res.status(200).json({result: false, code: "not-verified"});
      }
    }
    else {
      return res.status(404).json({result: false, code: "email-not-registered"});
    }

  }

  async sendResetPasswordEmail(user) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    const exists = await this.server.db('t_user_verify').where({a_user_id: user.a_user_id});

    const userVerify = {
      a_user_id: user.a_user_id,
      a_code: code,
      a_valid_until: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }

    if (exists && exists.length > 0) {
      await this.server.db('t_user_verify').where({a_user_id: user.a_user_id}).update(userVerify);
    }
    else {
      await this.server.db('t_user_verify').insert(userVerify);
    }

    const mailOptions = {
        from : "Dychromatic <noreply@vysly.com>",
        to : user.a_email,
        subject : "Password Reset",
        html : `<div>
                  <h1 style="text-align: center;">
                    <strong>Have you forgotten your password?</strong>
                  </h1>
                  <p>
                    <strong>
                      <span style="color: #fc987e;">
                        <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200705/reset-password.png" alt="Resetting Password" width="340" height="500" />
                      </span>
                    </strong>
                  </p>
                  <h1 style="text-align: center;">
                    <strong>Your code is <span style="color: #fc987e;">${code}</span></strong>
                  </h1>
               </div>` 
    }

    //console.log(mailOptions);

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }

  async resetPasswordConfirmation(req, res) {

    let {
      a_email,
      a_code,
      a_password_new
    } = req.body;

    a_email = a_email.toLowerCase().replace(/ /g,"");

    let user = await this.server.db('t_user').where({a_email});

    if (user && user.length > 0) {
      user = user[0];
      if (user.a_is_verified) {
        let userVerify = await this.server.db('t_user_verify').where({a_user_id: user.a_user_id});
        
        if (userVerify && userVerify.length > 0) {
          userVerify = userVerify[0];
          if(new Date(userVerify.a_valid_until) > new Date()){
            if (userVerify.a_code.toUpperCase() === a_code.toUpperCase()) {
              user.a_password = await bcrypt.hash(a_password_new, 10);
              await this.server.db('t_user').where({a_user_id: user.a_user_id}).update(user);
              this.server.db('t_user_verify').where({a_user_id: user.a_user_id}).del();
              return res.status(200).json({result: true, code: "verified"});
            }
            else {
              return res.status(200).json({result: false, code: "invalid-code"});
            }
          }
          else {
            return res.status(200).json({result: false, code: "expired-code"})
          }
        }
        else {
          // Should never happen
        }
      }
      else {
        return res.status(200).json({result: false, code: "not-verified"});
      }
    }
    else {
      return res.status(404).json({result: false, code: "email-not-registered"});
    }

    if(new Date(exp_date) > new Date()){
      let user = await this.server.db('t_user').where({a_user_id: id});
      
      if (!user || user.length == 0) {
        console.log("User not found");
        return res.status(404).json({message : "User not found"});
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
        return res.status(400).json({error : "Link is expired"});
    }
  }

}