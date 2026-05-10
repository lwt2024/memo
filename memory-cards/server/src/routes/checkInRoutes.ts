import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as checkInController from '../controllers/checkInController.js';

const router = Router();

router.use(authMiddleware);

router.post('/checkin', checkInController.handleCheckIn);
router.get('/checkin/stats', checkInController.getUserStats);
router.get('/checkin/calendar', checkInController.getCheckInCalendar);

export default router;