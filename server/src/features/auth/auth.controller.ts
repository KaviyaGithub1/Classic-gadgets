import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  console.log("----------------------------------------");
  console.log("REGISTRATION ATTEMPT - Request Body:", {
    fullName: req.body.fullName,
    email: req.body.email,
    username: req.body.username,
    phoneNumber: req.body.phoneNumber,
    hasPassword: !!req.body.password
  });

  try {
    const { fullName, email, password, phoneNumber, username } = req.body;

    if (!fullName || !email || !password) {
      console.warn("REGISTRATION FAILED: Missing required fields");
      res.status(400).json({ error: 'FullName, email, and password are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("REGISTRATION: Normalized email:", normalizedEmail);

    console.log("REGISTRATION: Checking if user already exists in DB...");
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: username || normalizedEmail }
        ]
      },
    });

    if (existingUser) {
      console.warn("REGISTRATION FAILED: Email or Username already in use:", {
        emailUsed: existingUser.email === normalizedEmail,
        usernameUsed: existingUser.username === (username || normalizedEmail)
      });
      res.status(409).json({ error: 'Email or Username already in use' });
      return;
    }

    console.log("REGISTRATION: Hashing password using bcrypt...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("REGISTRATION: Password hashed successfully.");

    const adminEmails = [
      'admin@classicgadgets.com',
      'arivarasankaviya@gmail.com',
      'kaviyaarivarasan1@gmail.com'
    ];
    const userRole = adminEmails.includes(normalizedEmail) ? 'ADMIN' : 'USER';
    console.log("REGISTRATION: Assigned role:", userRole);

    console.log("REGISTRATION: Inserting user into database...");
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        username: username || normalizedEmail.split('@')[0],
        phone: phoneNumber || '',
        password: hashedPassword,
        role: userRole,
      },
    });
    console.log("REGISTRATION: User created in DB successfully. ID:", newUser.id);

    console.log("REGISTRATION: Generating JWT token...");
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log("REGISTRATION: JWT token generated successfully.");

    console.log("REGISTRATION SUCCESS: User registered and authenticated.");
    console.log("----------------------------------------");
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log("----------------------------------------");
  console.log("LOGIN ATTEMPT - Request Body:", {
    email: req.body.email,
    hasPassword: !!req.body.password
  });

  try {
    const { email, password, isAdminPortal } = req.body;

    if (!email || !password) {
      console.warn("LOGIN FAILED: Missing email or password");
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'Email and password are required'
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("LOGIN: Normalized email:", normalizedEmail);

    console.log("LOGIN: Querying user from database by email...");
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.error(`LOGIN FAILED: User with email ${normalizedEmail} not found in database.`);
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'User not found'
      });
      return;
    }
    console.log("LOGIN: User found in DB. Stored Role:", user.role, "Stored Password Hash:", user.password.substring(0, 10) + "...");

    console.log("LOGIN: Comparing passwords using bcrypt...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("LOGIN: bcrypt match result:", isMatch);

    if (!isMatch) {
      console.error(`LOGIN FAILED: Incorrect password for user ${normalizedEmail}.`);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'Invalid credentials'
      });
      return;
    }

    if (user.isBlocked) {
      console.error(`LOGIN FAILED: Account ${normalizedEmail} is blocked.`);
      res.status(403).json({
        success: false,
        message: 'Your account has been blocked',
        error: 'Your account has been blocked'
      });
      return;
    }
    if (isAdminPortal && user.role !== 'ADMIN') {
      console.warn("LOGIN FAILED: Non-admin user attempted login on Admin Portal");
      res.status(403).json({
        success: false,
        message: 'Access Denied: Admin privileges required',
        error: 'Access Denied: Admin privileges required'
      });
      return;
    }

    // 2FA Check
    if (user.role === 'ADMIN' && isAdminPortal) {
      console.log("LOGIN: Admin account detected. Initiating 2FA flow...");
      if (user.isTwoFactorEnabled) {
        console.log("LOGIN: 2FA is enabled. Generating temporary token...");
        const tempToken = jwt.sign(
          { id: user.id, temp2FA: true }, 
          JWT_SECRET, 
          { expiresIn: '5m' }
        );
        
        console.log("LOGIN 2FA REQUIRED: Sending standard 2FA verification response.");
        console.log("----------------------------------------");
        res.status(200).json({
          success: true,
          requires2FA: true,
          tempToken,
          message: '2FA verification required'
        });
        return;
      } else {
        console.log("LOGIN: 2FA not set up. Initiating 2FA setup and QR code generation...");
        const tempToken = jwt.sign(
          { id: user.id, temp2FASetup: true }, 
          JWT_SECRET, 
          { expiresIn: '10m' }
        );
        
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'ClassicGadgets Admin', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);
  
        console.log("LOGIN 2FA SETUP REQUIRED: Sending 2FA setup details.");
        console.log("----------------------------------------");
        res.status(200).json({
          success: true,
          requires2FASetup: true,
          tempToken,
          secret,
          qrCodeUrl,
          message: '2FA setup required'
        });
        return;
      }
    }

    console.log("LOGIN: Generating JWT token for user...");
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    console.log("LOGIN: JWT token generated successfully.");

    console.log("LOGIN SUCCESS: User authenticated successfully.");
    console.log("----------------------------------------");
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
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const adminInit2FA = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    if (user.isTwoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user.id, temp2FA: true }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
      );
      
      res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        message: '2FA verification required'
      });
      return;
    } else {
      const tempToken = jwt.sign(
        { id: user.id, temp2FASetup: true }, 
        JWT_SECRET, 
        { expiresIn: '10m' }
      );
      
      const secret = authenticator.generateSecret();
      const otpauth = authenticator.keyuri(user.email, 'ClassicGadgets Admin', secret);
      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      res.status(200).json({
        success: true,
        requires2FASetup: true,
        tempToken,
        secret,
        qrCodeUrl,
        message: '2FA setup required'
      });
      return;
    }
  } catch (error) {
    console.error("ADMIN 2FA INIT ERROR:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
