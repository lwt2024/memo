import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as checkInService from '../services/checkInService.js';

export async function handleCheckIn(req: AuthRequest, res: Response) {
  try {
    const result = await checkInService.checkIn(req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getUserStats(req: AuthRequest, res: Response) {
  try {
    const stats = await checkInService.getUserStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getCheckInCalendar(req: AuthRequest, res: Response) {
  try {
    const months = parseInt(req.query.months as string) || 3;
    const calendar = await checkInService.getCheckInCalendar(req.userId!, months);
    res.json(calendar);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}