import { Router } from 'express';
import { getUsers, createUser, updateUser, toggleBlockUser, deleteUser } from './user.controller';
import { verifyToken, requireAdmin } from '../../middlewares/auth.middleware';

export const userRoute = Router();

// All user routes require Admin privileges
userRoute.use(verifyToken, requireAdmin);

userRoute.get('/', getUsers);
userRoute.post('/', createUser);
userRoute.put('/:id', updateUser);
userRoute.patch('/:id/block', toggleBlockUser);
userRoute.delete('/:id', deleteUser);
