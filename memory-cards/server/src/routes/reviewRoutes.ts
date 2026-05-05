import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

router.use(authMiddleware);

router.get('/due', reviewController.getDueCards);
router.get('/deck/:deckId', reviewController.getDeckReviewCards);
router.post('/submit', reviewController.submitReview);
router.get('/stats', reviewController.getStats);
router.get('/daily-stats', reviewController.getDailyStats);

export default router;
