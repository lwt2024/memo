import { updateProfile, changePassword, deleteUser } from '../services/userService.js';
export async function getProfileHandler(req, res) {
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                username: true,
                email: true,
                nickname: true,
                avatar: true,
                createdAt: true
            }
        });
        res.json({ user });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function updateProfileHandler(req, res) {
    try {
        const data = {
            nickname: req.body.nickname,
            email: req.body.email,
        };
        // 处理文件上传
        if (req.file) {
            data.avatarFile = req.file.buffer;
            data.avatarFileName = req.file.originalname;
        }
        const user = await updateProfile(req.userId, data);
        res.json({ user, message: '个人信息更新成功' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function changePasswordHandler(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: '请填写所有密码字段' });
        }
        const result = await changePassword(req.userId, oldPassword, newPassword);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function deleteUserHandler(req, res) {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: '请输入密码以确认注销' });
        }
        const result = await deleteUser(req.userId, password);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
//# sourceMappingURL=userController.js.map