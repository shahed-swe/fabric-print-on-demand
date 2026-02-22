const transporter = require('../config/email');

const sendContactMessage = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address' 
            });
        }

        // Send email to admin
        const adminEmail = process.env.ADMIN_EMAIL || 'shahed@k53tech.com';
        const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@customprintshop.com';
        
        const adminMailOptions = {
            from: fromEmail,
            to: adminEmail,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                        .content { background: white; padding: 20px; border-radius: 8px; }
                        .field { margin-bottom: 16px; }
                        .label { font-weight: bold; color: #1f2937; margin-bottom: 4px; }
                        .value { color: #6b7280; white-space: pre-wrap; word-break: break-word; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin: 0;">New Contact Form Submission</h2>
                        </div>
                        <div class="content">
                            <div class="field">
                                <div class="label">Name</div>
                                <div class="value">${firstName} ${lastName}</div>
                            </div>
                            <div class="field">
                                <div class="label">Email</div>
                                <div class="value"><a href="mailto:${email}">${email}</a></div>
                            </div>
                            <div class="field">
                                <div class="label">Subject</div>
                                <div class="value">${subject}</div>
                            </div>
                            <div class="field">
                                <div class="label">Message</div>
                                <div class="value">${message}</div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">This is an automated message. Please reply directly to the customer's email address.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send confirmation email to customer
        const customerMailOptions = {
            from: fromEmail,
            to: email,
            subject: 'We received your message - CustomPrint',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
                        .content { background: white; padding: 20px; border-radius: 8px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ec4899 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
                        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin: 0;">Thank you for reaching out!</h2>
                        </div>
                        <div class="content">
                            <p>Hi ${firstName},</p>
                            <p>We have received your message and will get back to you as soon as possible. Our team typically responds within 24 business hours.</p>
                            <p><strong>Your Message Summary:</strong></p>
                            <p><em>${subject}</em></p>
                            <p>If you have any urgent matters, please feel free to call us or visit our office. Thank you for choosing CustomPrint!</p>
                            <a href="https://customprintshop.com" class="button">Visit Our Store</a>
                            <div class="footer">
                                <p style="margin: 0;">Best regards,<br>CustomPrint Team</p>
                                <p style="margin: 8px 0 0 0; color: #d1d5db;">This is an automated message. Please do not reply to this email.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        return res.status(200).json({ 
            success: true, 
            message: 'Your message has been sent successfully. We will get back to you soon!' 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later.' 
        });
    }
};

module.exports = {
    sendContactMessage
};
