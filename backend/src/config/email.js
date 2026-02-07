const nodemailer = require('nodemailer');

// Get credentials from environment (should be loaded by app.js before this module is imported)
const smtpUser = (process.env.BREVO_SMTP_USER || '').trim();
const smtpPassword = (process.env.BREVO_SMTP_PASSWORD || '').trim();
const smtpHost = (process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com').trim();
const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);

console.log('\n📧 Email Configuration Status:');
console.log('==============================');
console.log('  SMTP Host:', smtpHost);
console.log('  SMTP Port:', smtpPort);
console.log('  SMTP User set:', smtpUser ? '✓ Yes' : '✗ NO');
console.log('  SMTP Password set:', smtpPassword ? '✓ Yes' : '✗ NO');

// Critical validation - credentials MUST exist
if (!smtpUser || !smtpPassword) {
  console.error('\n❌ CRITICAL ERROR: Email credentials are missing!');
  console.error('\nRequired environment variables in backend/.env:');
  console.error('  BREVO_SMTP_USER=9fc3ea001@smtp-brevo.com');
  console.error('  BREVO_SMTP_PASSWORD=xsmtpsib-7389ed43ca6703d1d2e20e3a9ed04703aad56d4ba9d3d30ffadc9b52b64faa65-L0b3NKhzsw43m6yY');
  console.error('\n⚠️  Make sure .env values do NOT have quotes around them!\n');
  
  // Still create transporter with empty credentials for now, will fail at connect time
  // This allows the app to start but emails will fail
}

// Create transporter with credentials
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // Use secure connection for port 465
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ Email Server Connection Failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('\n   Troubleshooting Steps:');
    console.error('   1. Check that BREVO_SMTP_USER is set correctly (no quotes in .env)');
    console.error('   2. Check that BREVO_SMTP_PASSWORD is set correctly (no quotes in .env)');
    console.error('   3. Verify BREVO_SMTP_HOST=smtp-relay.brevo.com');
    console.error('   4. Verify BREVO_SMTP_PORT=587');
    console.error('   5. Verify your Brevo SMTP credentials have not expired');
    console.error('   6. Restart the backend server after fixing .env\n');
  } else {
    console.log('✅ Email Server Connected Successfully\n');
  }
});

module.exports = transporter;


module.exports = transporter;
