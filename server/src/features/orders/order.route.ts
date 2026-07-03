import { Router } from 'express';
import { createOrder, getMyOrders } from './order.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

export const orderRoute = Router();

// Public route to allow guest checkout
orderRoute.post('/', createOrder);

// Protected route for users to see their orders
orderRoute.get('/my-orders', verifyToken, getMyOrders);
