import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as tagController from '../controllers/tagController.js';
const router = Router();
router.use(authMiddleware);
router.get('/', tagController.getUserTagsHandler);
router.post('/', tagController.createTagHandler);
router.get('/deck/:deckId', tagController.getDeckTagsHandler);
router.post('/card-tags', tagController.addTagToCardHandler);
router.delete('/card-tags/:cardId/:tagId', tagController.removeTagFromCardHandler);
router.delete('/:tagId', tagController.deleteTagHandler);
export default router;
//# sourceMappingURL=tagRoutes.js.map