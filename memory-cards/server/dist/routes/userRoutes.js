import { Router } from 'express';
import multer from 'multer';
import { getProfileHandler, updateProfileHandler, changePasswordHandler, deleteUserHandler } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(authMiddleware);
router.get('/profile', getProfileHandler);
router.put('/profile', upload.single('avatar'), updateProfileHandler);
router.put('/password', changePasswordHandler);
router.delete('/account', deleteUserHandler);
export default router;
//# sourceMappingURL=userRoutes.js.map