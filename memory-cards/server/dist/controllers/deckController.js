import * as deckService from '../services/deckService.js';
export async function createDeck(req, res) {
    try {
        const { name, description } = req.body;
        const deck = await deckService.createDeck(req.userId, name, description);
        res.status(201).json(deck);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getDecks(req, res) {
    try {
        const decks = await deckService.getUserDecks(req.userId);
        res.json(decks);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getDeck(req, res) {
    try {
        const { sortBy, sortOrder, masteryLevel } = req.query;
        const filters = {};
        if (sortBy === 'createdAt' || sortBy === 'masteryLevel') {
            filters.sortBy = sortBy;
        }
        if (sortOrder === 'asc' || sortOrder === 'desc') {
            filters.sortOrder = sortOrder;
        }
        if (masteryLevel !== undefined && masteryLevel !== null && masteryLevel !== '') {
            filters.masteryLevel = parseInt(masteryLevel);
        }
        const deck = await deckService.getDeckById(req.params.id, req.userId, filters);
        if (!deck) {
            return res.status(404).json({ error: '卡片组不存在' });
        }
        res.json(deck);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function updateDeck(req, res) {
    try {
        const { name, description } = req.body;
        const result = await deckService.updateDeck(req.params.id, req.userId, { name, description });
        if (result.count === 0) {
            return res.status(404).json({ error: '卡片组不存在' });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function deleteDeck(req, res) {
    try {
        const result = await deckService.deleteDeck(req.params.id, req.userId);
        if (result.count === 0) {
            return res.status(404).json({ error: '卡片组不存在' });
        }
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
//# sourceMappingURL=deckController.js.map