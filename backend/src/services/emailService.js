const transporter = require('../config/email');

const generateInvoiceHTML = (order, user) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  // Calculate subtotal (total - shipping)
  const shippingCost = 7;
  const subtotal = order.totalAmount - shippingCost;

  // Generate items HTML
  const itemsHTML = order.items.map((item, index) => {
    let itemName = '';
    let itemDetails = '';
    
    if (item.itemType === 'product' && item.productId) {
      itemName = item.productId.name || 'Product';
      itemDetails = `Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}`;
    } else if (item.itemType === 'design' && item.designId) {
      itemName = item.designId.title || 'Custom Design';
      itemDetails = 'Custom Print on Demand';
    } else {
      itemName = 'Item';
      itemDetails = '';
    }

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 8px; text-align: left;">${index + 1}</td>
        <td style="padding: 16px 8px; text-align: left;">
          <div style="font-weight: 500;">${itemName}</div>
          <div style="font-size: 14px; color: #6b7280;">${itemDetails}</div>
        </td>
        <td style="padding: 16px 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 16px 8px; text-align: right;">${formatCurrency(item.price)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Invoice</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ORDER INVOICE</h1>
                  <p style="margin: 10px 0 0 0; color: #e5e7eb; font-size: 16px;">Fabric Print on Demand</p>
                </td>
              </tr>
              
              <!-- Order Info -->
              <tr>
                <td style="padding: 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="vertical-align: top;">
                        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Order Details</h3>
                        <p style="margin: 5px 0; font-size: 16px; color: #111827;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
                        <p style="margin: 5px 0; font-size: 16px; color: #111827;"><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                        <p style="margin: 5px 0; font-size: 16px; color: #111827;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">${order.status}</span></p>
                      </td>
                      <td width="50%" style="vertical-align: top; text-align: right;">
                        <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Customer Info</h3>
                        <p style="margin: 5px 0; font-size: 16px; color: #111827;">${user?.name || 'Guest User'}</p>
                        <p style="margin: 5px 0; font-size: 16px; color: #111827;">${user?.email || 'guest@example.com'}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Shipping Address -->
              ${order.shippingAddress ? `
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Shipping Address</h3>
                  <p style="margin: 5px 0; font-size: 16px; color: #111827; line-height: 1.6;">
                    ${order.shippingAddress.fullName || 'N/A'}<br>
                    ${order.shippingAddress.streetAddress || order.shippingAddress.address || 'N/A'}<br>
                    ${order.shippingAddress.city ? order.shippingAddress.city : 'N/A'}${order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''} ${order.shippingAddress.postalCode || order.shippingAddress.zipCode || 'N/A'}<br>
                    ${order.shippingAddress.country || 'N/A'}${order.shippingAddress.phone ? '<br>Phone: ' + order.shippingAddress.phone : ''}
                  </p>
                </td>
              </tr>
              ` : ''}
              
              <!-- Items Table -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">#</th>
                        <th style="padding: 16px 8px; text-align: left; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Item</th>
                        <th style="padding: 16px 8px; text-align: center; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                        <th style="padding: 16px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                    </tbody>
                  </table>
                </td>
              </tr>
              
              <!-- Totals -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="70%"></td>
                      <td width="30%">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 16px; color: #6b7280;">Subtotal:</td>
                            <td style="padding: 8px 0; text-align: right; font-size: 16px; color: #111827;">${formatCurrency(subtotal)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 16px; color: #6b7280;">Shipping:</td>
                            <td style="padding: 8px 0; text-align: right; font-size: 16px; color: #111827;">${formatCurrency(shippingCost)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 16px 0 0 0; font-size: 18px; font-weight: bold; color: #111827; border-top: 2px solid #e5e7eb;">Total:</td>
                            <td style="padding: 16px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #e5e7eb;">${formatCurrency(order.totalAmount)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Thank you for your order!</p>
                  <p style="margin: 0; font-size: 14px; color: #9ca3af;">If you have any questions, please contact us at support@fabricpod.com</p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const sendOrderInvoice = async (order, user) => {
  try {
    const invoiceHTML = generateInvoiceHTML(order, user);
    
    const mailOptions = {
      from: `"${process.env.BREVO_FROM_NAME || 'Fabric Print on Demand'}" <${process.env.BREVO_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: user?.email || order.shippingAddress?.email || 'customer@example.com',
      subject: `Order Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`,
      html: invoiceHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
};

const sendAccountCreationEmail = async (user, temporaryPassword) => {
  try {
    const accountHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome!</h1>
                    <p style="margin: 10px 0 0 0; color: #e5e7eb; font-size: 16px;">Your Account Has Been Created</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Hello ${user.name}!</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      We've successfully created your account at <strong>Fabric Print on Demand</strong>. You can now log in with the credentials below to access your account and track your orders.
                    </p>
                    
                    <!-- Credentials Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 20px 0;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px;">Login Credentials:</h3>
                          
                          <div style="margin: 12px 0;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Email:</p>
                            <p style="margin: 0; color: #111827; font-size: 16px; font-weight: bold; background-color: #fff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">${user.email}</p>
                          </div>
                          
                          <div style="margin: 12px 0;">
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Temporary Password:</p>
                            <p style="margin: 0; color: #111827; font-size: 16px; font-weight: bold; background-color: #fff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">Password1@</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Important Info -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Important:</strong> Please change your password on your first login. We recommend using a strong, unique password.
                      </p>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                      You can now:
                    </p>
                    <ul style="margin: 10px 0 20px 0; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>View and track your orders</li>
                      <li>Manage your shipping addresses</li>
                      <li>Create custom designs</li>
                      <li>Access your account settings</li>
                    </ul>
                  </td>
                </tr>
                
                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <a href="${process.env.FRONTEND_URL || 'https://customprintingservices.com.au'}/login" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Log In to Your Account
                    </a>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Questions? We're here to help!</p>
                    <p style="margin: 0; font-size: 14px; color: #9ca3af;">Contact us at support@fabricpod.com</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.BREVO_FROM_NAME || 'Fabric Print on Demand'}" <${process.env.BREVO_FROM_EMAIL}>`,
      to: user.email,
      subject: 'Welcome to Fabric Print on Demand - Your Account is Ready!',
      html: accountHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Account creation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending account creation email:', error);
    throw error;
  }
};

const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verificationURL = `${process.env.FRONTEND_URL || 'https://customprintingservices.com.au'}/verify-email?token=${verificationToken}`;
    
    const verifyHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Verify Your Email</h1>
                    <p style="margin: 10px 0 0 0; color: #e5e7eb; font-size: 16px;">Complete your registration</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px;">Hello ${user.name}!</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Thank you for registering with <strong>Fabric Print on Demand</strong>. To complete your registration and unlock all features, please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- Verification Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationURL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0; color: #6b7280; font-size: 14px; text-align: center;">
                      Or copy and paste this link in your browser:
                    </p>
                    <p style="margin: 0 0 20px 0; color: #667eea; font-size: 12px; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
                      ${verificationURL}
                    </p>
                    
                    <!-- Important Info -->
                    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>ℹ️ Note:</strong> This verification link will expire in 24 hours. If it expires, you can request a new one from your account settings.
                      </p>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px;">
                      Benefits of verification:
                    </p>
                    <ul style="margin: 10px 0 20px 20px; color: #374151; font-size: 14px;">
                      <li style="margin: 8px 0;">Full access to your account dashboard</li>
                      <li style="margin: 8px 0;">Track your design orders and shipments</li>
                      <li style="margin: 8px 0;">Receive order updates via email</li>
                      <li style="margin: 8px 0;">Save your designs and preferences</li>
                    </ul>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      © 2026 Fabric Print on Demand. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.BREVO_FROM_NAME || 'Fabric Print on Demand'}" <${process.env.BREVO_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - Fabric Print on Demand',
      html: verifyHTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderInvoice,
  generateInvoiceHTML,
  sendAccountCreationEmail,
  sendVerificationEmail
};
