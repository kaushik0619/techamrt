import express from 'express';
import { sendNewsletterConfirmation, notifyAdminNewSubscriber, sendRepairRequestEmail, sendContactUsEmail } from '../services/emailService';
import {
  notifyAdminNewSubscriberWhatsApp,
  sendRepairRequestWhatsApp,
  sendContactUsWhatsApp
} from '../services/whatsappService';

const router = express.Router();

// POST /api/misc/newsletter
router.post('/newsletter', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Send confirmation to subscriber (non-blocking)
    sendNewsletterConfirmation(email, name).catch((err) => console.error(err));

    // Notify admin (email + WhatsApp)
    notifyAdminNewSubscriber(email).catch((err) => console.error('Error notifying admin (email):', err));
    notifyAdminNewSubscriberWhatsApp(email).catch((err) => console.error('Error notifying admin (WhatsApp):', err));

    return res.json({ message: 'Subscribed' });
  } catch (error) {
    console.error('Error in /newsletter', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/misc/repair
router.post('/repair', async (req, res) => {
  try {
    const { brand, model, problem, name, phone, email } = req.body;
    if (!brand || !model || !problem || !name || !phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Send repair request email in background to avoid blocking the request
    sendRepairRequestEmail({ brand, model, problem, name, phone, email }).catch((err) => console.error('Error sending repair request email:', err));

    // Forward repair request to admin via WhatsApp (non-blocking)
    sendRepairRequestWhatsApp({ brand, model, problem, name, phone, email }).catch((err) => console.error('Error sending repair WhatsApp:', err));

    return res.json({ message: 'Repair request submitted' });
  } catch (error) {
    console.error('Error in /repair', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/misc/contact
router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, message, phone } = req.body;
    if (!firstName || !email || !message) return res.status(400).json({ message: 'Missing required fields' });

    // Send contact email in background to avoid blocking the request
    sendContactUsEmail({ firstName, lastName, email, message, phone }).catch((err) => console.error('Error sending contact-us email:', err));

    // Forward contact form to admin via WhatsApp (non-blocking)
    sendContactUsWhatsApp({ firstName, lastName, email, message, phone }).catch((err) => console.error('Error sending contact-us WhatsApp:', err));

    return res.json({ message: 'Message sent' });
  } catch (error) {
    console.error('Error in /contact', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
