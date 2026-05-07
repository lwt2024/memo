import * as tagService from '../services/tagService.js';
export async function getUserTagsHandler(req, res) {
    try {
        const tags = await tagService.getUserTags(req.userId);
        res.json({ tags });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function createTagHandler(req, res) {
    try {
        const { name, color } = req.body;
        const tag = await tagService.createTag(req.userId, name, color);
        res.status(201).json(tag);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function getDeckTagsHandler(req, res) {
    try {
        const tags = await tagService.getDeckTags(req.params.deckId);
        res.json({ tags });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function addTagToCardHandler(req, res) {
    try {
        const { cardId, tagId } = req.body;
        const cardTag = await tagService.addTagToCard(cardId, tagId, req.userId);
        res.json(cardTag);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function removeTagFromCardHandler(req, res) {
    try {
        const { cardId, tagId } = req.params;
        const cardTag = await tagService.removeTagFromCard(cardId, tagId, req.userId);
        res.json(cardTag);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
//# sourceMappingURL=tagController.js.map