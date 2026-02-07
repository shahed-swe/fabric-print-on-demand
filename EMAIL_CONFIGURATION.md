# Email Configuration - Consolidated Setup

## Current Email Usage

### 1. Order Invoices
- **Location**: `backend/src/services/emailService.js`
- **Trigger**: When an order is placed (in `orderController.js`)
- **Purpose**: Send order confirmation and invoice to customer

## Email Configuration

All email functionality uses **Brevo SMTP** service configured in `backend/.env`:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=9fc3ea001@smtp-brevo.com
BREVO_SMTP_PASSWORD=xsmtpsib-7389ed43ca6703d1d2e20e3a9ed04703aad56d4ba9d3d30ffadc9b52b64faa65-L0b3NKhzsw43m6yY
BREVO_FROM_EMAIL=shahed@k53tech.com
BREVO_FROM_NAME=Fabric Print on Demand
FRONTEND_URL=https://customprintingservices.com.au
```

## Files Involved

1. **Backend Configuration**:
   - `backend/src/config/email.js` - Creates and verifies SMTP transporter
   - `backend/src/services/emailService.js` - Email service functions

2. **Usage**:
   - `backend/src/controllers/orderController.js` - Triggers invoice sending

## Testing Email Configuration

Run the test script to verify email credentials:

```bash
cd backend
node test-email.js
```

Expected output on success:
```
✅ Connection Successful!
You can now send emails using this configuration.
```

## Troubleshooting

If you see "Missing credentials for PLAIN" error:

1. **Verify .env credentials are properly quoted**:
   ```
   BREVO_SMTP_USER="your-email@smtp-brevo.com"
   BREVO_SMTP_PASSWORD="your-password-with-quotes"
   ```

2. **Check credential values** have no extra spaces or special characters

3. **Verify BREVO account**:
   - Login to Brevo.com
   - Check SMTP credentials in settings
   - Ensure credentials haven't expired

4. **Port configuration**:
   - Port 587 = STARTTLS (secure=false)
   - Port 465 = SSL (secure=true)
   - Currently using 587

## No Additional Email Services

- ❌ No separate frontend email configuration needed
- ❌ No forgot password email system implemented
- ✅ Only order invoice emails are sent via Brevo

## Future Enhancements

If you want to add password reset emails, use the same Brevo configuration:

```javascript
// Example: Sending password reset email
const transporter = require('../config/email');

const mailOptions = {
  from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
  to: userEmail,
  subject: 'Password Reset Request',
  html: resetLinkHTML
};

await transporter.sendMail(mailOptions);
```
