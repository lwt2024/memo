import { register, login } from '../services/authService.js';
export async function registerHandler(req, res) {
    try {
        const { username, password, nickname } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        const result = await register(username, password, nickname);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function loginHandler(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        const result = await login(username, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
}
//# sourceMappingURL=authController.js.map