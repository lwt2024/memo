import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as tagService from '../services/tagService.js';

export async function getUserTagsHandler(req: AuthRequest, res: Response) {
  try {
    const tags = await tagService.getUserTags(req.userId!);
    res.json({ tags });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function createTagHandler(req: AuthRequest, res: Response) {
  try {
    const { name, color } = req.body;
    const tag = await tagService.createTag(req.userId!, name, color);
    res.status(201).json(tag);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeckTagsHandler(req: AuthRequest, res: Response) {
  try {
    const tags = await tagService.getDeckTags(req.params.deckId);
    res.json({ tags });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function addTagToCardHandler(req: AuthRequest, res: Response) {
  try {
    const { cardId, tagId } = req.body;
    const cardTag = await tagService.addTagToCard(cardId, tagId, req.userId!);
    res.json(cardTag);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function removeTagFromCardHandler(req: AuthRequest, res: Response) {
  try {
    const { cardId, tagId } = req.params;
    const cardTag = await tagService.removeTagFromCard(cardId, tagId, req.userId!);
    res.json(cardTag);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
 
export async function deleteTagHandler(req: AuthRequest, res: Response) {
  try {
    const { tagId } = req.params;
    await tagService.deleteTag(tagId, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
