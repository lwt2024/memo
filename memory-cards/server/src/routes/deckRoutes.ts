import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as deckController from '../controllers/deckController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', deckController.createDeck);
router.get('/', deckController.getDecks);
router.get('/:id', deckController.getDeck);
router.get('/:id/stats', deckController.getDeckStats);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

export default router;
