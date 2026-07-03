import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../../config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const generate2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();
    
    // The keyuri creates the provisioning URL for Google Authenticator
    const otpauth = authenticator.keyuri(user.email, 'ClassicGadgets Admin', secret);
    
    // Generate QR Code data URI
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    res.status(200).json({
      secret,
      qrCodeUrl
    });
  } catch (error) {
    console.error('Error generating 2FA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const enable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { secret, token } = req.body;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!secret || !token) {
      res.status(400).json({ error: 'Secret and token are required' });
      return;
    }

    // Verify the token
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      res.status(400).json({ error: 'Invalid 2FA code' });
      return;
    }

    // Save secret and enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        isTwoFactorEnabled: true
      }
    });

    res.status(200).json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const disable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        isTwoFactorEnabled: false
      }
    });

    res.status(200).json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verify2FALogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      res.status(400).json({ error: 'Token and OTP are required' });
      return;
    }

    // Verify temp token
    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    if (!decoded.temp2FA || !decoded.id) {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      res.status(400).json({ error: '2FA is not enabled for this user' });
      return;
    }

    const isValid = authenticator.verify({ token: otp, secret: user.twoFactorSecret });

    if (!isValid) {
      res.status(401).json({ error: 'Invalid 2FA code' });
      return;
    }

    // Success - Issue final token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setup2FALogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tempToken, otp, secret } = req.body;

    if (!tempToken || !otp || !secret) {
      res.status(400).json({ error: 'Token, OTP, and secret are required' });
      return;
    }

    // Verify temp token
    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
      res.status(401).json({ error: 'Setup session expired or invalid' });
      return;
    }

    if (!decoded.temp2FASetup || !decoded.id) {
      res.status(401).json({ error: 'Invalid token type for setup' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify the OTP against the provided secret
    const isValid = authenticator.verify({ token: otp, secret });

    if (!isValid) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    // Save secret and enable 2FA for this user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        isTwoFactorEnabled: true
      }
    });

    // Issue final token
    const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: '2FA setup successful and logged in',
      token,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error('Error in setup 2FA login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
