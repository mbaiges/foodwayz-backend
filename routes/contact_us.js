module.exports = class AuthRoutes {
  constructor(server) {
    this.server = server;
  }

  async initialize(app) {
    app.post("/contact_us", this.contactUs.bind(this));
    app.post("/contact_us/type_request", this.typeRequest.bind(this));
    app.post("/contact_us/ingredient_request", this.ingredientRequest.bind(this));
    app.post("/contact_us/characteristic_request", this.characteristicRequest.bind(this));
  }

  async contactUs(req, res) {
    const {
      a_user_id,
      a_email
    } = req.user;

    const {
      reason,
      body
    } = req.body;

    let mailOptions;

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : process.env.EMAIL_ACCOUNT,
      subject : `Contact Us from User ID: "${a_user_id}", E-mail: "${a_email}"`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong>Reason: <span style="color: #fc987e;">${reason}</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/pugoficinista.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Body of the message:</strong>
                </h1>
                <h2 style="text-align: center; color: #9a9a9a;">
                  ${body.replace(/[<>]/g,"")}
                </h2>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending contact_us email"});
    }

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : a_email,
      subject : `Contact Us`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=16px;">
                  The following is a copy of what our team will be receiving. Thanks for contacting us! We're happy to improve our services in order to get a better customer experience.
                </h1>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong>Reason: <span style="color: #fc987e;">${reason}</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/pugoficinista.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Body of the message:</strong>
                </h1>
                <h2 style="text-align: center; color: #9a9a9a;">
                  ${body.replace(/[<>]/g,"")}
                </h2>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
      return res.status(200).json({result: true, message: "contact us email sent"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending contact_us email"});
    }

  }

  async typeRequest(req, res) {
    const {
      a_user_id,
      a_email
    } = req.user;

    const {
      a_type_name
    } = req.body;

    let mailOptions;

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : process.env.EMAIL_ACCOUNT,
      subject : `Type Request from User ID: "${a_user_id}", E-mail: "${a_email}"`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Type Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Type Name: ${a_type_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending type request email"});
    }

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : a_email,
      subject : `Type Request`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=16px;">
                  The following is a copy of what our team will be receiving. Thanks for contacting us! We're happy to improve our services in order to get a better customer experience.
                </h1>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Type Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Type Name: ${a_type_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
      return res.status(200).json({result: true, message: "contact us email sent"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending contact_us email"});
    }

  }

  async ingredientRequest(req, res) {
    const {
      a_user_id,
      a_email
    } = req.user;

    const {
      a_ingr_name
    } = req.body;

    let mailOptions;

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : process.env.EMAIL_ACCOUNT,
      subject : `Ingredient Request from User ID: "${a_user_id}", E-mail: "${a_email}"`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Ingredient Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Ingredient Name: ${a_ingr_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending ingredient request email"});
    }

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : a_email,
      subject : `Ingredient Request`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=16px;">
                  The following is a copy of what our team will be receiving. Thanks for contacting us! We're happy to improve our services in order to get a better customer experience.
                </h1>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Ingredient Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Ingredient Name: ${a_ingr_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
      return res.status(200).json({result: true, message: "contact us email sent"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending ingredient request email"});
    }
    
  }

  async characteristicRequest(req, res) {
    const {
      a_user_id,
      a_email
    } = req.user;

    const {
      a_char_name
    } = req.body;

    let mailOptions;

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : process.env.EMAIL_ACCOUNT,
      subject : `Characteristic Request from User ID: "${a_user_id}", E-mail: "${a_email}"`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Characteristic Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Characteristic Name: ${a_char_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending characteristic request email"});
    }

    mailOptions = {
      from : "Dychromatic <noreply@vysly.com>",
      to : a_email,
      subject : `Characteristic Request`,
      html : `<div>
                <h1 style="text-align: center; margin-bottom=16px;">
                  The following is a copy of what our team will be receiving. Thanks for contacting us! We're happy to improve our services in order to get a better customer experience.
                </h1>
                <h1 style="text-align: center; margin-bottom=8px;">
                  <strong><span style="color: #fc987e;">Characteristic Request</span></strong>
                </h1>
                <p>
                  <strong>
                    <span style="color: #fc987e;">
                      <img style="display: block; margin-left: auto; margin-right: auto;" src="https://img.techpowerup.org/200707/fotofamiliar.png" alt="Meeting New Members" width="500" height="500" />
                    </span>
                  </strong>
                </p>
                <h1 style="text-align: center;">
                  <strong>Characteristic Name: ${a_char_name.replace(/[<>]/g,"")}</strong>
                </h1>
             </div>` 
    }

    try {
      await this.server.emailSend(mailOptions);
      return res.status(200).json({result: true, message: "contact us email sent"});
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: "an error ocurred sending characteristic request email"});
    }
    
  }

}