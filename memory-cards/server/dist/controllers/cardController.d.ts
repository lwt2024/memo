import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
export declare function createCard(req: AuthRequest, res: Response): Promise<void>;
export declare function getCards(req: AuthRequest, res: Response): Promise<void>;
export declare function updateCard(req: AuthRequest, res: Response): Promise<void>;
export declare function deleteCard(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=cardController.d.ts.map