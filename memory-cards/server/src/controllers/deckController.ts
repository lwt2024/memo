import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as deckService from '../services/deckService.js';

export async function createDeck(req: AuthRequest, res: Response) {
  try {
    console.log('Creating deck for user:', req.userId);
    console.log('Request body:', req.body);
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '卡片组名称不能为空' });
    }
    
    const deck = await deckService.createDeck(req.userId!, name.trim(), description);
    console.log('Deck created:', deck.id);
    res.status(201).json(deck);
  } catch (error: any) {
    console.error('Error creating deck:', error);
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
    console.log('Getting deck:', req.params.id, 'for user:', req.userId);
    const { sortBy, sortOrder, masteryLevel } = req.query;
    const filters: any = {};
    
    if (sortBy === 'createdAt' || sortBy === 'masteryLevel') {
      filters.sortBy = sortBy;
    }
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      filters.sortOrder = sortOrder;
    }
    if (masteryLevel !== undefined && masteryLevel !== null && masteryLevel !== '') {
      filters.masteryLevel = parseInt(masteryLevel as string);
    }

    const deck = await deckService.getDeckById(req.params.id, req.userId!, filters);
    if (!deck) {
      console.log('Deck not found');
      return res.status(404).json({ error: '卡片组不存在' });
    }
    console.log('Deck found:', deck.id);
    res.json(deck);
  } catch (error: any) {
    console.error('Error getting deck:', error);
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

export async function getDeckStats(req: AuthRequest, res: Response) {
  try {
    const stats = await deckService.getDeckStats(req.params.id, req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function togglePublic(req: AuthRequest, res: Response) {
  try {
    const result = await deckService.toggleDeckPublic(req.params.id, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getShareInfo(req: AuthRequest, res: Response) {
  try {
    const shareInfo = await deckService.getDeckShareInfo(req.params.id, req.userId!);
    res.json(shareInfo);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
