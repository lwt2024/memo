import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import deckRoutes from './routes/deckRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import checkInRoutes from './routes/checkInRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/share', shareRoutes);
app.use('/api', checkInRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
// 只对非 API 请求返回 index.html
app.get(/^(?!\/api\/).*$/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export default app;
//# sourceMappingURL=index.js.map