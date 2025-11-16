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
                    ${order.shippingAddress.fullName}<br>
                    ${order.shippingAddress.addressLine1}<br>
                    ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                    ${order.shippingAddress.phone ? '<br>Phone: ' + order.shippingAddress.phone : ''}
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
      from: `"Fabric Print on Demand" <${process.env.EMAIL_USER}>`,
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

module.exports = {
  sendOrderInvoice,
  generateInvoiceHTML,
};
