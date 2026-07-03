import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRoute } from './features/health/health.route';
import { authRoute } from './features/auth/auth.route';
import { twoFactorRoute } from './features/auth/2fa.route';
import { userRoute } from './features/users/user.route';
import { profileRoute } from './features/users/profile.route';
import { productRoute } from './features/products/product.route';
import { orderRoute } from './features/orders/order.route';
import { analyticsRoute } from './features/admin/analytics.route';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/auth/2fa', twoFactorRoute);
app.use('/api/users', userRoute);
app.use('/api/profile', profileRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/admin/analytics', analyticsRoute);

// Server Route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
