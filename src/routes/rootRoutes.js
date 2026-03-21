import express from 'express';
import authRoutes from './authRoutes.js';
import tableRoutes from './tableRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Set up route modules
router.use('/auth', authRoutes);
router.use('/table', tableRoutes);
router.use('/admin',adminRoutes);

export default router;
