import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as shareService from '../services/shareService.js';

export async function setPublic(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const { isPublic } = req.body;
    const result = await shareService.setDeckPublic(deckId, req.userId!, isPublic);
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true, isPublic });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function generateInvite(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const result = await shareService.generateInviteLink(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function importByCode(req: AuthRequest, res: Response) {
  try {
    const { inviteCode } = req.body;
    const newDeck = await shareService.importDeckByCode(inviteCode, req.userId!);
    res.status(201).json(newDeck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function importPublicDeck(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.body;
    const newDeck = await shareService.importPublicDeck(deckId, req.userId!);
    res.status(201).json(newDeck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getPublicDecks(req: Request, res: Response) {
  try {
    const { sortBy, search } = req.query;
    const decks = await shareService.getPublicDecks({
      sortBy: sortBy as 'latest' | 'popular',
      search: search as string,
    });
    res.json(decks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}