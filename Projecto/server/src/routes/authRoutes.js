import { Router } from 'express';
import { changePassword, login, recoverPassword, register } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/change-password', changePassword);

export default router;
