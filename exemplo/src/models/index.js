const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "76b7378b89fb2f",
      pass: "ae63b446308417"
    }
  });

  transport.use('compile', hbs({
    viewEngine: {
      extName: '.html',
      partialsDir: path.resolve('./src/resources/mail/'),
      layoutsDir: path.resolve('./src/resources/mail/'),
      defaultLayout: 'auth/forgot_password.html',
  },
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.html'


}));

  module.exports = transport;