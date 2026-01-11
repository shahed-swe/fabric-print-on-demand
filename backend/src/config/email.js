const nodemailer = require('nodemailer');

// Create transporter - only if credentials are provided
const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) 
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  : null;

// Verify connection only if transporter exists
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} else {
  console.log('⚠️  Email configuration incomplete. Set EMAIL_USER and EMAIL_PASSWORD to enable email features.');
}

module.exports = transporter;
