import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function register(username: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error('用户名已被注册');
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
      username,
      passwordHash,
      nickname: nickname || username,
    },
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, username: user.username, nickname: user.nickname }, token };
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error('账号不存在，请检查用户名或先注册账号');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('密码错误，请重新输入正确的密码');
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, username: user.username, nickname: user.nickname }, token };
}

function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}
