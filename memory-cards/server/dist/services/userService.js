import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const AVATAR_DIR = path.join(__dirname, '../../uploads/avatars');
// 确保上传目录存在
if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
}
export async function updateProfile(userId, data) {
    const updateData = {};
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
    if (data.avatarFile && data.avatarFileName) {
        const ext = path.extname(data.avatarFileName);
        const fileName = `${userId}${ext}`;
        const filePath = path.join(AVATAR_DIR, fileName);
        fs.writeFileSync(filePath, data.avatarFile);
        updateData.avatar = `/uploads/avatars/${fileName}`;
    }
    else if (data.avatar !== undefined) {
        updateData.avatar = data.avatar;
    }
    return prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            nickname: true,
            avatar: true,
            createdAt: true
        }
    });
}
export async function changePassword(userId, oldPassword, newPassword) {
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
export async function deleteUser(userId, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error('用户不存在');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw new Error('密码错误');
    }
    if (user.avatar) {
        const avatarPath = path.join(__dirname, '../../', user.avatar.replace('/', ''));
        if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
        }
    }
    await prisma.reviewRecord.deleteMany({ where: { userId } });
    await prisma.card.deleteMany({ where: { deck: { userId } } });
    await prisma.deck.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    return { message: '账号注销成功' };
}
//# sourceMappingURL=userService.js.map