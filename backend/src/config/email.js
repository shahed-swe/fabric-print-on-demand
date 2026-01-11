const nodemailer = require('nodemailer');

console.log('\n========== EMAIL CONFIGURATION ==========');
console.log('BREVO_SMTP_HOST:', process.env.BREVO_SMTP_HOST);
console.log('BREVO_SMTP_PORT:', process.env.BREVO_SMTP_PORT);
console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
console.log('BREVO_SMTP_PASSWORD:', process.env.BREVO_SMTP_PASSWORD ? '****' : 'NOT SET');
console.log('BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL);
console.log('BREVO_FROM_NAME:', process.env.BREVO_FROM_NAME);
console.log('=========================================\n');

// Create transporter using Brevo SMTP
const transporter = (process.env.BREVO_SMTP_HOST && process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASSWORD)
  ? nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: process.env.BREVO_SMTP_PORT || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    })
  : null;

console.log('Transporter created:', transporter ? 'YES ✅' : 'NO ❌');

// Verify connection only if transporter exists
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email configuration error (Brevo):', error.message);
    } else {
      console.log('✅ Email server (Brevo) is ready to send messages');
    }
  });
} else {
  console.log('⚠️  Email configuration incomplete. Set Brevo SMTP credentials to enable email features.');
}

module.exports = transporter;
