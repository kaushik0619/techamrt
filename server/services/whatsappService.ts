import axios from 'axios';

/**
 * WhatsApp service using Meta WhatsApp Cloud API
 * - Expects environment variables:
 *   - WHATSAPP_PHONE_NUMBER_ID: phone number id from WhatsApp Cloud
 *   - WHATSAPP_ACCESS_TOKEN: Graph API access token
 *   - ADMIN_WHATSAPP: admin phone number in international format (e.g. 91XXXXXXXXXX)
 *
 * This module mirrors the high-level API of emailService.ts but sends concise
 * WhatsApp text messages instead. It fails gracefully (logs) and will not throw
 * so it doesn't break the main request flow.
 */

interface OrderData {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
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

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP; // e.g. '9199xxxxxxx'

const GRAPH_API_BASE = 'https://graph.facebook.com/v16.0';

async function sendWhatsAppText(to: string, text: string): Promise<void> {
  try {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      console.warn('⚠️ WhatsApp configuration missing (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN). Skipping message.');
      return;
    }

    const url = `${GRAPH_API_BASE}/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    };

    await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ WhatsApp message sent to ${to}`);
  } catch (error: any) {
    console.error(`❌ Error sending WhatsApp message to ${to}:`, error?.response?.data || error.message || error);
  }
}

function summarizeItems(items: OrderData['items'], max = 5) {
  const lines = items.slice(0, max).map(i => `${i.quantity}× ${i.name} (₹${i.price.toFixed(2)})`);
  if (items.length > max) lines.push(`+ ${items.length - max} more items`);
  return lines.join('\n');
}

export async function sendOrderConfirmationWhatsApp(data: OrderData): Promise<void> {
  try {
    // Notify admin
    if (ADMIN_NUMBER) {
      const adminMsg = `📦 New order received\nOrder: #${data.orderId}\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone || 'N/A'}\nAmount: ₹${data.totalAmount.toFixed(2)}\nPayment: ${data.paymentMethod} (${data.paymentStatus})\nItems:\n${summarizeItems(data.items)}`;
      await sendWhatsAppText(ADMIN_NUMBER, adminMsg);
    } else {
      console.warn('⚠️ ADMIN_WHATSAPP not configured; skipping admin WhatsApp notification.');
    }

    // Notify customer (if phone provided)
    if (data.customerPhone) {
      const custMsg = `Hi ${data.customerName}, thanks for your order!\nOrder #: ${data.orderId}\nTotal: ₹${data.totalAmount.toFixed(2)}\nWe'll update you when your order ships.`;
      await sendWhatsAppText(data.customerPhone, custMsg);
    } else {
      console.warn(`⚠️ Customer phone missing for order ${data.orderId}; skipping customer WhatsApp.`);
    }

    console.log(`✅ WhatsApp notifications processed for order ${data.orderId}`);
  } catch (error) {
    console.error('❌ Error processing WhatsApp order notifications:', error);
  }
}

export async function sendPasswordResetWhatsApp(toPhone: string, resetLink: string): Promise<void> {
  try {
    if (!toPhone) {
      console.warn('⚠️ No phone provided for password reset WhatsApp');
      return;
    }
    const text = `Reset your password\nClick here: ${resetLink}\nThis link expires in 1 hour.`;
    await sendWhatsAppText(toPhone, text);
  } catch (error) {
    console.error('❌ Error sending password reset WhatsApp:', error);
  }
}

export async function sendNewsletterConfirmationWhatsApp(toPhone: string, name?: string): Promise<void> {
  try {
    if (!toPhone) {
      console.warn('⚠️ No phone provided for newsletter confirmation WhatsApp');
      return;
    }
    const text = `Hi ${name || ''}, thanks for subscribing to our newsletter! We'll keep you updated with new arrivals and offers.`;
    await sendWhatsAppText(toPhone, text);
  } catch (error) {
    console.error('❌ Error sending newsletter WhatsApp:', error);
  }
}

export async function notifyAdminNewSubscriberWhatsApp(subscriberInfo: string): Promise<void> {
  try {
    if (!ADMIN_NUMBER) {
      console.warn('⚠️ ADMIN_WHATSAPP not configured; cannot notify admin of new subscriber.');
      return;
    }
    const text = `📰 New subscriber: ${subscriberInfo}`;
    await sendWhatsAppText(ADMIN_NUMBER, text);
  } catch (error) {
    console.error('❌ Error notifying admin of new subscriber via WhatsApp:', error);
  }
}

export async function sendRepairRequestWhatsApp(details: { brand: string; model: string; problem: string; name: string; phone: string; email?: string; }): Promise<void> {
  try {
    if (!ADMIN_NUMBER) {
      console.warn('⚠️ ADMIN_WHATSAPP not configured; skipping repair WhatsApp.');
      return;
    }
    const text = `🔧 Repair request\nCustomer: ${details.name}\nPhone: ${details.phone}${details.email ? `\nEmail: ${details.email}` : ''}\nDevice: ${details.brand} ${details.model}\nProblem: ${details.problem.substring(0, 800)}`;
    await sendWhatsAppText(ADMIN_NUMBER, text);
  } catch (error) {
    console.error('❌ Error sending repair request WhatsApp:', error);
  }
}

export async function sendContactUsWhatsApp(details: { firstName: string; lastName?: string; email: string; message: string; phone?: string; }): Promise<void> {
  try {
    if (!ADMIN_NUMBER) {
      console.warn('⚠️ ADMIN_WHATSAPP not configured; skipping contact-us WhatsApp.');
      return;
    }
    const text = `📩 Contact form\nFrom: ${details.firstName} ${details.lastName || ''}\nPhone: ${details.phone || 'N/A'}\nEmail: ${details.email}\nMessage: ${details.message.substring(0, 800)}`;
    await sendWhatsAppText(ADMIN_NUMBER, text);
  } catch (error) {
    console.error('❌ Error sending contact-us WhatsApp:', error);
  }
}
