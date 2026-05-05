import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from './emailService.js';

const prisma = new PrismaClient();
const USE_REAL_EMAIL = process.env.USE_REAL_EMAIL === 'true';

const emailVerificationCodes = new Map<string, { code: string; expiresAt: number; type: 'register' | 'reset' }>();

export async function sendVerificationCode(email: string, type: 'register' | 'reset' = 'register') {
  if (type === 'register') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('邮箱已被注册');
    }
  } else {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      throw new Error('该邮箱未注册');
    }
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  emailVerificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    type,
  });

  if (USE_REAL_EMAIL) {
    await sendVerificationEmail(email, code, type);
    console.log(`发送${type === 'register' ? '注册' : '重置密码'}验证码到 ${email}: ${code}`);
    return { message: '验证码已发送到您的邮箱' };
  } else {
    console.log(`发送${type === 'register' ? '注册' : '重置密码'}验证码到 ${email}: ${code}`);
    return { message: '验证码已发送（测试模式：验证码为 ' + code + '）' };
  }
}

export async function verifyCode(email: string, code: string) {
  const stored = emailVerificationCodes.get(email);
  if (!stored) {
    throw new Error('请先获取验证码');
  }
  if (Date.now() > stored.expiresAt) {
    throw new Error('验证码已过期，请重新获取');
  }
  if (stored.code !== code) {
    throw new Error('验证码错误');
  }
  emailVerificationCodes.delete(email);
  return { success: true };
}

export async function register(email: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('邮箱已被注册');
  }

  if (password.length < 8) {
    throw new Error('密码长度不能少于8位');
  }

  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  if (!hasNumber || !hasLetter) {
    throw new Error('密码必须包含数字和字母');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || email.split('@')[0],
    },
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, nickname: user.nickname }, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('账号不存在，请检查邮箱或先注册账号');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('密码错误，请重新输入正确的密码');
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, nickname: user.nickname }, token };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const stored = emailVerificationCodes.get(email);
  if (!stored) {
    throw new Error('请先获取验证码');
  }
  if (Date.now() > stored.expiresAt) {
    throw new Error('验证码已过期，请重新获取');
  }
  if (stored.code !== code) {
    throw new Error('验证码错误');
  }
  if (stored.type !== 'reset') {
    throw new Error('验证码类型不匹配，请重新获取');
  }

  if (newPassword.length < 8) {
    throw new Error('密码长度不能少于8位');
  }

  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  if (!hasNumber || !hasLetter) {
    throw new Error('密码必须包含数字和字母');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  emailVerificationCodes.delete(email);
  return { success: true, message: '密码重置成功' };
}

function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}
