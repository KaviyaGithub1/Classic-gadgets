import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/db';
import { sendWelcomeEmail } from '../../config/mailer';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const queryOptions: any = {
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      }
    };

    if (search && typeof search === 'string') {
      queryOptions.where = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const users = await prisma.user.findMany(queryOptions);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, username, email, phone, password, role } = req.body;

    if (!fullName || !username || !email || !password || !phone) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username }]
      },
    });

    if (existingUser) {
      res.status(409).json({ error: 'Email or Username already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        username,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: role || 'USER',
        isBlocked: false,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
      }
    });

    const { emailPreviewUrl, isRealSMTP } = await sendWelcomeEmail(normalizedEmail, fullName, username, password, role || 'USER');

    // SMS Dispatch Simulation
    try {
      console.log("----------------------------------------");
      console.log(`[SMS SIMULATION] Sent credentials SMS to phone number: ${phone}`);
      console.log(`[SMS CONTENT] "Dear ${fullName}, your Classic Gadgets account has been created. Username: ${username}, Temporary Password: ${password}. Log in at http://localhost:3000/login"`);
      console.log("----------------------------------------");
    } catch (smsErr) {
      console.error("Failed to execute SMS simulation:", smsErr);
    }

    res.status(201).json({ message: 'User created successfully', emailPreviewUrl, isRealEmailSent: isRealSMTP, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { fullName, username, email, phone, role } = req.body;

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

    // Check if updating email/username conflicts with another user
    if (normalizedEmail || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
            ...(username ? [{ username }] : [])
          ]
        },
      });

      if (existingUser) {
        res.status(409).json({ error: 'Email or Username already in use by another account' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName && { fullName }),
        ...(username && { username }),
        ...(normalizedEmail && { email: normalizedEmail }),
        ...(phone && { phone }),
        ...(role && { role }),
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
      }
    });

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleBlockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isBlocked } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: { id: true, isBlocked: true }
    });

    res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (error) {
    console.error('Error toggling user block status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
