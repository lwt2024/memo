import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
export declare function createDeck(req: AuthRequest, res: Response): Promise<void>;
export declare function getDecks(req: AuthRequest, res: Response): Promise<void>;
export declare function getDeck(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateDeck(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteDeck(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getDeckStats(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=deckController.d.ts.map