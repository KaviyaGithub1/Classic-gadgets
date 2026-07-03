import { Router } from 'express';
import { registerUser, loginUser, adminInit2FA } from './auth.controller';
import { verify2FALogin, setup2FALogin } from './2fa.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

export const authRoute = Router();

authRoute.post('/register', registerUser);
authRoute.post('/login', loginUser);
authRoute.post('/login/verify-2fa', verify2FALogin);
authRoute.post('/login/setup-2fa', setup2FALogin);
authRoute.post('/admin-init-2fa', verifyToken, adminInit2FA);
