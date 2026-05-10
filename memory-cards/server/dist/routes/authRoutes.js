import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/authController.js';
const router = Router();
router.post('/register', registerHandler);
router.post('/login', loginHandler);
export default router;
//# sourceMappingURL=authRoutes.js.map