import { Request, Response } from 'express';
import { register, login, sendVerificationCode, verifyCode } from '../services/authService.js';

export async function sendCodeHandler(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }
    const result = await sendVerificationCode(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function verifyCodeHandler(req: Request, res: Response) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: '邮箱和验证码不能为空' });
    }
    const result = await verifyCode(email, code);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function registerHandler(req: Request, res: Response) {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }
    const result = await register(email, password, nickname);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
