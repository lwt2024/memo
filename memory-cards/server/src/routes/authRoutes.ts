import { Router } from 'express';
import { registerHandler, loginHandler, sendCodeHandler, verifyCodeHandler } from '../controllers/authController.js';

const router = Router();

router.post('/send-code', sendCodeHandler);
router.post('/verify-code', verifyCodeHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
