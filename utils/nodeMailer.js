const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    secure: false,
    auth: {
      user: 'cd5af22b98b059',
      pass: 'ae68d31f2a9de8',
    },
  });

  const mailOptions = {
    from: 'Manish Chitre <manish@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log('This is something intresting');
  //Actually send the email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
