import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import deckRoutes from './routes/deckRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/review', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
