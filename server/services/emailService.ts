import nodemailer from 'nodemailer';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
}

// Create transporter with sensible timeouts so sendMail fails fast on network issues
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Fail fast settings
  connectionTimeout: 10000, // 10s
  greetingTimeout: 5000, // 5s
  socketTimeout: 10000, // 10s
});

// Generate HTML email for admin
function generateAdminEmailHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${item.name}</strong>
            ${item.description ? `<br/><span style="color: #6b7280; font-size: 12px;">${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</span>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        
        <!-- Header -->
        <div style="background-color: #9E7FFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
        </div>
        
        <!-- Order Info -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Details</h2>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Order Date:</strong> ${data.orderDate.toLocaleString('en-IN', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: ${data.paymentStatus === 'completed' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${data.paymentStatus.toUpperCase()}</span></p>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Customer Information</h2>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Name:</strong> ${data.customerName}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Shipping Address</h2>
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.fullName}</p>
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.addressLine1}</p>
            ${data.shippingAddress.addressLine2 ? `<p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.addressLine2}</p>` : ''}
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postalCode}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Phone:</strong> ${data.shippingAddress.phone}</p>
          </div>

          <!-- Order Items -->
          <h2 style="color: #1f2937;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #9E7FFF;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #9E7FFF;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #9E7FFF;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #9E7FFF;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Total -->
          <div style="background-color: #9E7FFF; padding: 20px; border-radius: 8px; text-align: right;">
            <h2 style="color: #ffffff; margin: 0;">Total Amount: ₹${data.totalAmount.toFixed(2)}</h2>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">This is an automated notification from your e-commerce system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML email for customer
function generateCustomerEmailHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        
        <!-- Header -->
        <div style="background-color: #9E7FFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Thank You for Your Order! 🎉</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="color: #4b5563; font-size: 16px;">Hi ${data.customerName},</p>
          <p style="color: #4b5563; font-size: 16px;">We've received your order and are getting it ready. We'll notify you when it ships!</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Order Summary</h2>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Order Date:</strong> ${data.orderDate.toLocaleString('en-IN', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</p>
          </div>

          <!-- Order Items -->
          <h2 style="color: #1f2937;">Your Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #9E7FFF;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #9E7FFF;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #9E7FFF;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Total -->
          <div style="background-color: #9E7FFF; padding: 20px; border-radius: 8px; text-align: right; margin-bottom: 20px;">
            <h2 style="color: #ffffff; margin: 0;">Total: ₹${data.totalAmount.toFixed(2)}</h2>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Shipping To:</h3>
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.fullName}</p>
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.addressLine1}</p>
            ${data.shippingAddress.addressLine2 ? `<p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.addressLine2}</p>` : ''}
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postalCode}</p>
            <p style="color: #4b5563; margin: 5px 0;">${data.shippingAddress.phone}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Questions? Contact us at ${process.env.EMAIL_FROM}</p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} ABC Accessories. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send order confirmation emails
export async function sendOrderConfirmationEmails(data: OrderEmailData): Promise<void> {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Skipping email sending.');
      console.warn('Required environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, ADMIN_EMAIL');
      return;
    }

    if (!process.env.ADMIN_EMAIL) {
      console.warn('⚠️ ADMIN_EMAIL not configured. Skipping admin email.');
    } else {
      // Send email to admin
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `🛍️ New Order #${data.orderId} - ₹${data.totalAmount.toFixed(2)}`,
        html: generateAdminEmailHTML(data),
      });
      console.log(`✅ Admin email sent for order ${data.orderId}`);
    }

    // Send email to customer
    if (data.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: data.customerEmail,
        subject: `Order Confirmation #${data.orderId}`,
        html: generateCustomerEmailHTML(data),
      });
      console.log(`✅ Customer email sent for order ${data.orderId}`);
    } else {
      console.warn(`⚠️ Customer email not available for order ${data.orderId}`);
    }

    console.log(`✅ Order confirmation emails sent for order ${data.orderId}`);
  } catch (error) {
    console.error('❌ Error sending order confirmation emails:', error);
    // Don't throw error - we don't want email failure to break the order process
  }
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Skipping password reset email.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="background: #9E7FFF; padding: 24px; border-radius: 8px; text-align: center; color: #fff;">
          <h2 style="margin:0;">Password Reset Request</h2>
        </div>
        <div style="padding: 20px; background: #fff; border-radius: 8px; margin-top: 12px;">
          <p>We received a request to reset the password for your account. Click the button below to reset your password. This link will expire in one hour.</p>
          <p style="text-align:center; margin: 24px 0;"><a href="${resetLink}" style="background: #9E7FFF; color: #fff; padding: 12px 18px; border-radius: 6px; text-decoration: none;">Reset Password</a></p>
          <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="padding: 12px; color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ABC Accessories</div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: 'Reset your password',
      html,
    });

    console.log(`✅ Password reset email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
  }
}

// Send newsletter confirmation to subscriber
export async function sendNewsletterConfirmation(to: string, name?: string): Promise<void> {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Skipping newsletter confirmation email.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="background: #9E7FFF; padding: 24px; border-radius: 8px; text-align: center; color: #fff;">
          <h2 style="margin:0;">Thanks for subscribing!</h2>
        </div>
        <div style="padding: 20px; background: #fff; border-radius: 8px; margin-top: 12px;">
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for subscribing to our newsletter. You'll now receive updates about new arrivals, offers, and more.</p>
          <p style="color: #6b7280; font-size: 13px;">If you did not subscribe, you can ignore this email or contact support.</p>
        </div>
        <div style="padding: 12px; color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} ABC Accessories</div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: 'Thanks for subscribing to our newsletter',
      html,
    });

    console.log(`✅ Newsletter confirmation sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending newsletter confirmation email:', error);
  }
}

// Notify admin about new subscriber
export async function notifyAdminNewSubscriber(subscriberEmail: string): Promise<void> {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.warn('⚠️ ADMIN_EMAIL not configured. Skipping admin notification for new subscriber.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="background: #9E7FFF; padding: 20px; color: #fff; border-radius: 8px; text-align: center;"><h3>New Newsletter Subscriber</h3></div>
        <div style="padding: 16px; background: #fff; border-radius: 8px; margin-top: 8px;">
          <p><strong>Email:</strong> ${subscriberEmail}</p>
          <p>Signed up via the website newsletter form.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `📰 New Newsletter Subscriber: ${subscriberEmail}`,
      html,
    });

    console.log(`✅ Admin notified of new subscriber: ${subscriberEmail}`);
  } catch (error) {
    console.error('❌ Error notifying admin about new subscriber:', error);
  }
}

// Send repair request details to admin
export async function sendRepairRequestEmail(details: { brand: string; model: string; problem: string; name: string; phone: string; email?: string; }): Promise<void> {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.warn('⚠️ ADMIN_EMAIL not configured. Skipping repair request email.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="background: #9E7FFF; padding: 20px; color: #fff; border-radius: 8px; text-align: center;"><h3>New Repair Request</h3></div>
        <div style="padding: 16px; background: #fff; border-radius: 8px; margin-top: 8px;">
          <p><strong>Customer Name:</strong> ${details.name}</p>
          <p><strong>Phone:</strong> ${details.phone}</p>
          ${details.email ? `<p><strong>Email:</strong> ${details.email}</p>` : ''}
          <p><strong>Brand:</strong> ${details.brand}</p>
          <p><strong>Model:</strong> ${details.model}</p>
          <p><strong>Problem:</strong><br/> ${details.problem.replace(/\n/g, '<br/>')}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🔧 Repair Request - ${details.brand} ${details.model}`,
      html,
    });

    console.log(`✅ Repair request emailed to admin for ${details.name}`);
  } catch (error) {
    console.error('❌ Error sending repair request email:', error);
  }
}

// Send contact-us form details to admin
export async function sendContactUsEmail(details: { firstName: string; lastName?: string; email: string; message: string; phone?: string; }): Promise<void> {
  try {
    if (!process.env.ADMIN_EMAIL) {
      console.warn('⚠️ ADMIN_EMAIL not configured. Skipping contact-us email.');
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <div style="background: #9E7FFF; padding: 20px; color: #fff; border-radius: 8px; text-align: center;"><h3>Contact Us Submission</h3></div>
        <div style="padding: 16px; background: #fff; border-radius: 8px; margin-top: 8px;">
          <p><strong>Name:</strong> ${details.firstName} ${details.lastName || ''}</p>
          <p><strong>Email:</strong> ${details.email}</p>
          ${details.phone ? `<p><strong>Phone:</strong> ${details.phone}</p>` : ''}
          <p><strong>Message:</strong><br/> ${details.message.replace(/\n/g, '<br/>')}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 Contact Form - ${details.firstName} ${details.lastName || ''}`,
      html,
    });

    console.log(`✅ Contact-us submission emailed to admin from ${details.email}`);
  } catch (error) {
    console.error('❌ Error sending contact-us email:', error);
  }
}

// Send order status update emails to admin and customer
export async function sendOrderStatusUpdateEmails(data: { orderId: string; customerName?: string; customerEmail?: string; customerPhone?: string; orderStatus?: string; paymentStatus?: string; trackingInfo?: string; items?: Array<{ name: string; quantity: number; price: number; description?: string }>; totalAmount?: number; shippingAddress?: OrderEmailData['shippingAddress']; }): Promise<void> {
  try {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email configuration missing. Skipping order status emails.');
      return;
    }

    const subject = `🔔 Order Update #${data.orderId} - ${data.orderStatus || 'Updated'}`;
    const plainText = `Order ${data.orderId} status updated to ${data.orderStatus || 'Updated'}. Payment: ${data.paymentStatus || 'N/A'}. ${data.trackingInfo ? `Tracking: ${data.trackingInfo}` : ''}`;

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Order Update: #${data.orderId}</h3>
            <p><strong>Status:</strong> ${data.orderStatus || 'Updated'}</p>
            <p><strong>Payment:</strong> ${data.paymentStatus || 'N/A'}</p>
            ${data.trackingInfo ? `<p><strong>Tracking:</strong> ${data.trackingInfo}</p>` : ''}
            <p>${plainText}</p>
          </div>
        `,
      });
      console.log(`✅ Admin notified by email for order ${data.orderId}`);
    }

    // Notify customer
    if (data.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: data.customerEmail,
        subject: `Your order #${data.orderId} update`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Order Update</h3>
            <p>Hi ${data.customerName || 'Customer'},</p>
            <p>Your order <strong>#${data.orderId}</strong> status has been updated to <strong>${data.orderStatus || 'Updated'}</strong>.</p>
            <p>Payment status: ${data.paymentStatus || 'N/A'}</p>
            ${data.trackingInfo ? `<p>Tracking information: ${data.trackingInfo}</p>` : ''}
            <p>Thank you for shopping with us.</p>
          </div>
        `,
      });
      console.log(`✅ Customer emailed for order ${data.orderId}`);
    }
  } catch (error) {
    console.error('❌ Error sending order status update emails:', error);
  }
}
