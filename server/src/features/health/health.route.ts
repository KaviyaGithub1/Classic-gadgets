import { Router } from 'express';
import { getHealthStatus } from './health.controller';

export const healthRoute = Router();

healthRoute.get('/', getHealthStatus);
