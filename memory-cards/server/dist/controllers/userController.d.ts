import { Request, Response } from 'express';
interface AuthRequest extends Request {
    userId?: string;
}
export declare function getProfileHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function updateProfileHandler(req: AuthRequest, res: Response): Promise<void>;
export declare function changePasswordHandler(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteUserHandler(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=userController.d.ts.map