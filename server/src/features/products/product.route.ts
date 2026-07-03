import { Router } from 'express';
import multer from 'multer';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './product.controller';
import { verifyToken, requireAdmin } from '../../middlewares/auth.middleware';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const productRoute = Router();

// Public route to get products (optional, but typically products are public)
productRoute.get('/', getProducts);
productRoute.get('/:id', getProductById);

// Protected routes (Admin only)
productRoute.use(verifyToken, requireAdmin);

productRoute.post('/', upload.array('images', 5), createProduct);
productRoute.put('/:id', upload.array('images', 5), updateProduct);
productRoute.delete('/:id', deleteProduct);
