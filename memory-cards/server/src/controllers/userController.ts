import { Request, Response } from 'express';
import { updateProfile, changePassword } from '../services/userService.js';

interface AuthRequest extends Request {
  userId?: string;
}

export async function getProfileHandler(req: AuthRequest, res: Response) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
        createdAt: true
      }
    });
    res.json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateProfileHandler(req: AuthRequest, res: Response) {
  try {
    const { nickname, email, avatar } = req.body;
    const user = await updateProfile(req.userId!, { nickname, email, avatar });
    res.json({ user, message: '个人信息更新成功' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function changePasswordHandler(req: AuthRequest, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请填写所有密码字段' });
    }
    const result = await changePassword(req.userId!, oldPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
