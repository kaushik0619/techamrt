import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../db';
import { User } from '../models/User';
import { WithId, ObjectId } from 'mongodb';
import { sendPasswordResetEmail } from '../services/emailService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser: User = {
      username,
      email,
      password_hash,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    if (!result.insertedId) {
        throw new Error('Failed to insert user');
    }

    const createdUser = await usersCollection.findOne({ _id: result.insertedId });

    if (!createdUser) {
        return res.status(500).json({ message: 'Error retrieving created user' });
    }

    const token = jwt.sign({ userId: createdUser._id, role: createdUser.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    // Create a refresh token (longer lived)
    const refreshToken = jwt.sign({ userId: createdUser._id, purpose: 'refresh' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Store refresh token and expiry in DB
    await usersCollection.updateOne(
      { _id: createdUser._id },
      { $set: { refreshToken, refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 3600 * 1000) } }
    );

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: createdUser._id?.toString(),
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    // Create refresh token and store it
    const refreshToken = jwt.sign({ userId: user._id, purpose: 'refresh' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { refreshToken, refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 3600 * 1000) } }
    );

    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/refresh - exchange a refresh token for a new access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required.' });
    }

    // Verify the refresh token signature
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    } catch (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }

    if (decoded.purpose !== 'refresh') {
      return res.status(400).json({ message: 'Invalid refresh token.' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Make sure the token matches what's stored for the user and hasn't expired
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token not recognized.' });
    }

    if (user.refreshTokenExpiry && new Date(user.refreshTokenExpiry) < new Date()) {
      return res.status(403).json({ message: 'Refresh token expired.' });
    }

    // Issue new access token and rotate refresh token
    const newToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const newRefreshToken = jwt.sign({ userId: user._id, purpose: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { refreshToken: newRefreshToken, refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 3600 * 1000) } }
    );

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error during token refresh.' });
  }
});
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('/api/auth/forgot-password called with', { email, origin: req.headers.origin, ip: req.ip });

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email address.' 
      });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        success: true,
        message: 'If an account exists, a reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'reset' }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Store token with expiry in database
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
        } 
      }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send reset email in background so SMTP delays don't block the HTTP response
    sendPasswordResetEmail(email, resetLink).catch((emailErr) => {
      console.error('Error sending password reset email:', emailErr);
    });

    // Always respond the same for security
    console.log('Returning 200 for forgot-password for', email);
    res.status(200).json({ 
      success: true,
      message: 'If an account exists, a reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during password reset request.' 
    });
  }
});
// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Please provide token and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    
    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // decoded.userId may be a string — convert to ObjectId for the query
    let userIdObj: any = decoded.userId;
    try {
      userIdObj = new ObjectId(String(decoded.userId));
    } catch (err) {
      // If conversion fails, leave as-is and let the query return no result
      console.warn('Could not convert decoded.userId to ObjectId', err);
    }

    const user = await usersCollection.findOne({ 
      _id: userIdObj,
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password_hash,
          updatedAt: new Date()
        },
        $unset: { 
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    );

    res.status(200).json({ message: 'Password successfully reset.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

export default router;