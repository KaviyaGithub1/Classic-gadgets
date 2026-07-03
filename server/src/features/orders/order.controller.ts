import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import jwt from 'jsonwebtoken';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity, deliveryAddress, paymentMethod } = req.body;

    let userId: string | undefined = undefined;

    // Extract user ID from token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret') as { id: string };
        userId = decoded.id;
      } catch (e) {
        // Ignore invalid token, just treat as guest
      }
    }

    if (!productId || !quantity || !deliveryAddress || !paymentMethod) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      res.status(400).json({ error: 'Invalid quantity' });
      return;
    }

    // Use a transaction to ensure stock is checked and decremented atomically
    const order = await prisma.$transaction(async (tx) => {
      // 1. Fetch product
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      if (product.stock < parsedQuantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // Calculate total price including discount
      const finalPrice = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;
      const totalPrice = finalPrice * parsedQuantity;

      // 2. Decrement stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: parsedQuantity
          },
          status: product.stock - parsedQuantity === 0 ? 'OUT_OF_STOCK' : product.status
        }
      });

      // 3. Create order
      const newOrder = await tx.order.create({
        data: {
          productId,
          userId,
          quantity: parsedQuantity,
          totalPrice,
          deliveryAddress,
          paymentMethod,
          status: 'PENDING'
        }
      });

      return newOrder;
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ error: 'Insufficient stock available' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            images: true,
            price: true,
            discount: true,
          }
        }
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
