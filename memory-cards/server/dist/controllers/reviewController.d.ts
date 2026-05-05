import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
export declare function getDueCards(req: AuthRequest, res: Response): Promise<void>;
export declare function getDeckReviewCards(req: AuthRequest, res: Response): Promise<void>;
export declare function submitReview(req: AuthRequest, res: Response): Promise<void>;
export declare function getStats(req: AuthRequest, res: Response): Promise<void>;
export declare function getDailyStats(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map