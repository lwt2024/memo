import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as deckService from '../services/deckService.js';

export async function createDeck(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;
    const deck = await deckService.createDeck(req.userId!, name, description);
    res.status(201).json(deck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDecks(req: AuthRequest, res: Response) {
  try {
    const decks = await deckService.getUserDecks(req.userId!);
    res.json(decks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeck(req: AuthRequest, res: Response) {
  try {
    const deck = await deckService.getDeckById(req.params.id, req.userId!);
    if (!deck) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json(deck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateDeck(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;
    const result = await deckService.updateDeck(req.params.id, req.userId!, { name, description });
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDeck(req: AuthRequest, res: Response) {
  try {
    const result = await deckService.deleteDeck(req.params.id, req.userId!);
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
