import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, updatePassword } from './profile.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const profileRoute = Router();

// All profile routes require authentication
profileRoute.use(verifyToken);

profileRoute.get('/', getProfile);
profileRoute.put('/', upload.single('avatar'), updateProfile);
profileRoute.put('/password', updatePassword);
