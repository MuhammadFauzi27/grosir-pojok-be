import express from 'express';
import { login, logout } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login  — Login pengguna (tidak memerlukan token / security: [])
router.post('/login', login);

// POST /api/auth/logout — Logout pengguna
router.post('/logout', authMiddleware, logout);

export default router;
