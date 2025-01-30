const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {

    console.log('USER:');
    console.log(user);
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Email Sender <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') return;

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // Sends the email
    // 1. Render html based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2. Create email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html)
    };

    // 3. Create a transport and send email
    const transporter = this.newTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'WELCOME TO THE NATOURS WEBSITE!');
  }
  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'your password reset token. (Valid for only 10 minutes!)'
    );
  }
};

// const sendEmail = async options => {
//   // // 1. Create transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //   }
//   // });

//   // 2. Define email options
//   const mailOptions = {
//     from: 'Testing USER <user@example.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };
//   // 3. Send the email

//   console.log('SENDING THE FUCKING EMAIL');
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
