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

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
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