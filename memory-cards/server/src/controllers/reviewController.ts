import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as reviewService from '../services/reviewService.js';

export async function getDueCards(req: AuthRequest, res: Response) {
  try {
    const cards = await reviewService.getDueCards(req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeckReviewCards(req: AuthRequest, res: Response) {
  try {
    const cards = await reviewService.getDeckReviewCards(req.params.deckId, req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function submitReview(req: AuthRequest, res: Response) {
  try {
    const { cardId, easeLevel } = req.body;
    const record = await reviewService.submitReview(cardId, req.userId!, easeLevel);
    res.json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const stats = await reviewService.getReviewStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
