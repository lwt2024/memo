import * as cardService from '../services/cardService.js';
export async function createCard(req, res) {
    try {
        const { deckId, front, back, cardType, mediaUrls } = req.body;
        const card = await cardService.createCard(deckId, req.userId, front, back, cardType, mediaUrls);
        res.status(201).json(card);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getCards(req, res) {
    try {
        const cards = await cardService.getDeckCards(req.params.deckId, req.userId);
        res.json(cards);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function updateCard(req, res) {
    try {
        const { front, back, cardType, mediaUrls } = req.body;
        const card = await cardService.updateCard(req.params.id, req.userId, { front, back, cardType, mediaUrls });
        res.json(card);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function deleteCard(req, res) {
    try {
        await cardService.deleteCard(req.params.id, req.userId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
//# sourceMappingURL=cardController.js.map