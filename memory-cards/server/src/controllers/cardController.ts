import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as cardService from '../services/cardService.js';

export async function createCard(req: AuthRequest, res: Response) {
  try {
    const { deckId, front, back, cardType, mediaUrls } = req.body;
    const card = await cardService.createCard(deckId, req.userId!, front, back, cardType, mediaUrls);
    res.status(201).json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getCards(req: AuthRequest, res: Response) {
  try {
    const cards = await cardService.getDeckCards(req.params.deckId, req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateCard(req: AuthRequest, res: Response) {
  try {
    const { front, back, cardType, mediaUrls } = req.body;
    const card = await cardService.updateCard(req.params.id, req.userId!, { front, back, cardType, mediaUrls });
    res.json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCard(req: AuthRequest, res: Response) {
  try {
    await cardService.deleteCard(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
