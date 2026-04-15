import { Router } from 'express';
import { login, recoverPassword, register } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recover-password', recoverPassword);

export default router;
