import { Router } from 'express';
import { registerHandler, loginHandler, sendCodeHandler, verifyCodeHandler, resetPasswordHandler } from '../controllers/authController.js';

const router = Router();

router.post('/send-code', sendCodeHandler);
router.post('/verify-code', verifyCodeHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/reset-password', resetPasswordHandler);

export default router;
