import { Router } from 'express';
import { getAnalytics } from './analytics.controller';
import { verifyToken, requireAdmin } from '../../middlewares/auth.middleware';

export const analyticsRoute = Router();

// Analytics requires Admin authentication
analyticsRoute.use(verifyToken, requireAdmin);

analyticsRoute.get('/', getAnalytics);
