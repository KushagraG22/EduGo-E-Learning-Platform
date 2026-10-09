import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User, IUser } from '../models/User';
import { PasswordResetToken } from '../models/PasswordResetToken';
import { generateToken } from '../utils/jwt';
import { config } from '../config/env';
import { sendPasswordResetEmail } from '../services/emailService';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const googleClient = new OAuth2Client(config.googleClientId);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
      return;
    }

    if (!['student', 'teacher'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "student" or "teacher".',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential, role = 'student' } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Google credential token is required.',
      });
      return;
    }

    if (!config.googleClientId) {
      res.status(400).json({
        success: false,
        message: 'Google OAuth is not configured on this server. Please configure GOOGLE_CLIENT_ID in server environment.',
      });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({
        success: false,
        message: 'Invalid Google authentication token payload.',
      });
      return;
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split('@')[0];
    const avatar = payload.picture || '';
    const googleId = payload.sub;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: ['student', 'teacher'].includes(role) ? role : 'student',
      });
    } else if (!user.googleId) {
      // Safe account linking
      user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        headline: user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        bio: req.user.bio,
        headline: req.user.headline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with identical generic response to prevent email enumeration
    const genericResponse = {
      success: true,
      message: 'If that email address is registered, password reset instructions have been sent.',
    };

    if (!user) {
      res.status(200).json(genericResponse);
      return;
    }

    // Invalidate existing unused tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${config.clientUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
      usedAt: null,
    });

    if (!resetRecord) {
      res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, expired, or already used.',
      });
      return;
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'User associated with this reset token could not be found.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully reset. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};
