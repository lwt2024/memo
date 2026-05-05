import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function updateProfile(userId: string, data: {
  nickname?: string;
  email?: string;
  avatar?: string;
}) {
  const updateData: any = {};
  
  if (data.nickname !== undefined) {
    updateData.nickname = data.nickname;
  }
  
  if (data.email !== undefined) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } }
    });
    if (existing) {
      throw new Error('该邮箱已被其他用户使用');
    }
    updateData.email = data.email;
  }
  
  if (data.avatar !== undefined) {
    updateData.avatar = data.avatar;
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      nickname: true,
      avatar: true,
      createdAt: true
    }
  });
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new Error('用户不存在');
  }
  
  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    throw new Error('原密码错误');
  }
  
  if (newPassword.length < 6) {
    throw new Error('新密码长度不能少于6位');
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });
  
  return { message: '密码修改成功' };
}
