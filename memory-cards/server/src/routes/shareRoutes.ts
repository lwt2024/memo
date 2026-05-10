import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as shareController from '../controllers/shareController.js';

const router = Router();

router.get('/public', shareController.getPublicDecks);

router.use(authMiddleware);

router.post('/import', shareController.importByCode);
router.post('/import/public', shareController.importPublicDeck);
router.post('/:deckId/public', shareController.setPublic);
router.post('/:deckId/invite', shareController.generateInvite);

export default router;
