import * as reviewService from '../services/reviewService.js';
export async function getDueCards(req, res) {
    try {
        const cards = await reviewService.getDueCards(req.userId);
        res.json(cards);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getDeckReviewCards(req, res) {
    try {
        const cards = await reviewService.getDeckReviewCards(req.params.deckId, req.userId);
        res.json(cards);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function submitReview(req, res) {
    try {
        const { cardId, easeLevel } = req.body;
        const record = await reviewService.submitReview(cardId, req.userId, easeLevel);
        res.json(record);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getStats(req, res) {
    try {
        const stats = await reviewService.getReviewStats(req.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getDailyStats(req, res) {
    try {
        const stats = await reviewService.getDailyStats(req.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
//# sourceMappingURL=reviewController.js.map