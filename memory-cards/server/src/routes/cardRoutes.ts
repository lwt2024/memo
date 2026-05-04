import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as cardController from '../controllers/cardController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', cardController.createCard);
router.get('/deck/:deckId', cardController.getCards);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

export default router;
