import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
export declare function getUserTagsHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function createTagHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function getDeckTagsHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function addTagToCardHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function removeTagFromCardHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function deleteTagHandler(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=tagController.d.ts.map