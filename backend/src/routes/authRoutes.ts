import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me
router.get('/me', authenticate, getCurrentUser);

export default router;
