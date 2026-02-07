#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

console.log('\n🔍 Email Configuration Test\n');
console.log('Environment Variables Status:');
console.log('==============================');

const vars = [
  'BREVO_SMTP_HOST',
  'BREVO_SMTP_PORT',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASSWORD',
  'BREVO_FROM_EMAIL',
  'BREVO_FROM_NAME'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName.includes('PASSWORD') 
      ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
  }
});

console.log('\nAttempting to create transporter...');
console.log('==============================\n');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection Failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  } else {
    console.log('✅ Connection Successful!');
    console.log('\nYou can now send emails using this configuration.');
    process.exit(0);
  }
});
