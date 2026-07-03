import { Router } from 'express';
import { generate2FA, enable2FA, disable2FA } from './2fa.controller';
import { verifyToken, requireAdmin } from '../../middlewares/auth.middleware';

export const twoFactorRoute = Router();

// These routes require admin authentication
twoFactorRoute.use(verifyToken, requireAdmin);

twoFactorRoute.get('/generate', generate2FA);
twoFactorRoute.post('/enable', enable2FA);
twoFactorRoute.post('/disable', disable2FA);
