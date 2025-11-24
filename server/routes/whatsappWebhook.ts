import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Environment variables
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP; // Personal WhatsApp number to receive forwarded messages
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'techmart_webhook_verify_token';

const GRAPH_API_BASE = 'https://graph.facebook.com/v16.0';

/**
 * Extract message details from WhatsApp webhook payload
 */
interface MessageDetails {
  senderPhone: string;
  senderName: string;
  timestamp: string;
  messageType: string;
  messageContent: string;
  mediaId?: string;
  rawJson: any;
}

function extractMessageDetails(message: any, contact?: any): MessageDetails | null {
  try {
    const senderPhone = message.from || 'Unknown';
    const senderName = contact?.profile?.name || 'Unknown Sender';
    const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString();

    let messageType = message.type || 'unknown';
    let messageContent = '';
    let mediaId = undefined;

    // Extract content based on message type
    if (messageType === 'text' && message.text) {
      messageContent = message.text.body || '(empty)';
    } else if (messageType === 'image' && message.image) {
      mediaId = message.image.id;
      messageContent = `Image (ID: ${mediaId})\nCaption: ${message.image.caption || '(no caption)'}`;
    } else if (messageType === 'audio' && message.audio) {
      mediaId = message.audio.id;
      messageContent = `Audio (ID: ${mediaId})\nMIME Type: ${message.audio.mime_type || 'unknown'}`;
    } else if (messageType === 'video' && message.video) {
      mediaId = message.video.id;
      messageContent = `Video (ID: ${mediaId})\nCaption: ${message.video.caption || '(no caption)'}\nMIME Type: ${message.video.mime_type || 'unknown'}`;
    } else if (messageType === 'document' && message.document) {
      mediaId = message.document.id;
      messageContent = `Document (ID: ${mediaId})\nFilename: ${message.document.filename || 'unknown'}\nMIME Type: ${message.document.mime_type || 'unknown'}`;
    } else if (messageType === 'button' && message.button) {
      messageContent = `Button response: ${message.button.text}`;
    } else if (messageType === 'interactive' && message.interactive) {
      const interactive = message.interactive;
      if (interactive.button_reply) {
        messageContent = `Button reply: ${interactive.button_reply.title}`;
      } else if (interactive.list_reply) {
        messageContent = `List reply: ${interactive.list_reply.title}`;
      } else {
        messageContent = `Interactive: ${JSON.stringify(interactive).substring(0, 200)}...`;
      }
    } else {
      messageContent = `${messageType}: ${JSON.stringify(message).substring(0, 300)}...`;
    }

    return {
      senderPhone,
      senderName,
      timestamp,
      messageType,
      messageContent,
      mediaId,
      rawJson: message,
    };
  } catch (error) {
    console.error('Error extracting message details:', error);
    return null;
  }
}

/**
 * Forward message to admin WhatsApp with full details
 */
async function forwardMessageToAdmin(details: MessageDetails): Promise<void> {
  try {
    if (!ADMIN_WHATSAPP) {
      console.warn('⚠️ ADMIN_WHATSAPP not configured; cannot forward incoming message.');
      return;
    }

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      console.warn('⚠️ WhatsApp configuration incomplete; cannot forward message.');
      return;
    }

    // Format the forwarded message
    const formattedMessage = formatForwardedMessage(details);

    const url = `${GRAPH_API_BASE}/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: ADMIN_WHATSAPP,
      type: 'text',
      text: { body: formattedMessage },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Forwarded incoming message from ${details.senderPhone} to admin (${ADMIN_WHATSAPP})`);
    console.log(`   Message ID: ${response.data?.messages?.[0]?.id}`);
  } catch (error: any) {
    console.error(
      `❌ Error forwarding message to admin:`,
      error?.response?.data || error.message || error
    );
  }
}

/**
 * Format message details for WhatsApp forwarding
 */
function formatForwardedMessage(details: MessageDetails): string {
  const jsonStr = JSON.stringify(details.rawJson, null, 2);
  const truncatedJson = jsonStr.length > 3000 ? jsonStr.substring(0, 3000) + '\n... (truncated)' : jsonStr;

  const message = `📨 New WhatsApp API Message

👤 From: ${details.senderPhone}
👤 Name: ${details.senderName}
⏰ Time: ${details.timestamp}
💬 Type: ${details.messageType}

📥 Message Content:
${details.messageContent}

📦 Raw Message JSON:
\`\`\`json
${truncatedJson}
\`\`\``;

  return message;
}

/**
 * POST /webhook
 * Receive incoming messages from WhatsApp Cloud API
 * Webhook format: { entry: [ { changes: [ { value: { messages: [...], contacts: [...] } } ] } ] }
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Acknowledge webhook receipt immediately
    res.status(200).json({ received: true });

    if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
      console.warn('Received webhook with no entries');
      return;
    }

    // Iterate through entries
    for (const entry of body.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        const value = change.value;

        // Extract contacts map
        const contactsMap: { [key: string]: any } = {};
        if (value.contacts && Array.isArray(value.contacts)) {
          for (const contact of value.contacts) {
            contactsMap[contact.wa_id] = contact;
          }
        }

        // Process incoming messages
        if (value.messages && Array.isArray(value.messages)) {
          for (const message of value.messages) {
            console.log(`📩 Received message from ${message.from}`);

            // Extract message details
            const contact = contactsMap[message.from];
            const details = extractMessageDetails(message, contact);

            if (details) {
              // Forward to admin
              await forwardMessageToAdmin(details);
            } else {
              console.warn(`⚠️ Could not extract details from message: ${message.id}`);
            }
          }
        }

        // Process message status updates (optional logging)
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const status of value.statuses) {
            console.log(`📊 Message status update - ID: ${status.id}, Status: ${status.status}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /webhook
 * Verify webhook with WhatsApp Cloud API
 * Query params: hub.mode, hub.challenge, hub.verify_token
 */
router.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  console.log(`🔐 Webhook verification attempt - mode: ${mode}, token: ${token}`);

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Invalid webhook verification token or mode');
    res.status(403).json({ error: 'Forbidden' });
  }
});

export default router;
