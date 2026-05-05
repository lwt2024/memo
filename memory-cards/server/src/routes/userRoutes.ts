import { Router } from 'express';
import { getProfileHandler, updateProfileHandler, changePasswordHandler } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileHandler);
router.put('/password', changePasswordHandler);

export default router;
