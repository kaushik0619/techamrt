import express from 'express';
import { sendNewsletterConfirmation, notifyAdminNewSubscriber, sendRepairRequestEmail, sendContactUsEmail } from '../services/emailService';
import {
  notifyAdminNewSubscriberWhatsApp,
  sendRepairRequestWhatsApp,
  sendContactUsWhatsApp
} from '../services/whatsappService';
import { connectToDatabase } from '../db';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';

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

// POST /api/misc/wishlist - Add/Remove product from wishlist
router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });

    const user = (req as any).user;
    const userId = user._id;
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Get current wishlist
    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const wishlist = currentUser.wishlist || [];
    const productIdStr = String(productId);

    // Toggle: Add if not exists, remove if exists
    if (wishlist.includes(productIdStr)) {
      wishlist.splice(wishlist.indexOf(productIdStr), 1);
    } else {
      wishlist.push(productIdStr);
    }

    // Update user wishlist
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { wishlist } }
    );

    return res.json({ message: 'Wishlist updated', wishlist });
  } catch (error) {
    console.error('Error in /wishlist', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/misc/wishlist - Get user's wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const userId = user._id;
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const currentUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    return res.json({ wishlist: currentUser.wishlist || [] });
  } catch (error) {
    console.error('Error in GET /wishlist', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
