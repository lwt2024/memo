import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, Deck } from '../types';
import Layout from '../components/common/Layout';
import { useTheme } from '../context/ThemeContext';

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mode } = useTheme();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCardId(prev => prev === cardId ? null : cardId);
  };

  useEffect(() => {
    if (id) fetchDeckData();
  }, [id]);

  const fetchDeckData = async () => {
    try {
      const res = await api.get(`/decks/${id}`);
      setDeck(res.data);
      setCards(res.data.cards || []);
    } catch (err) {
      console.error('获取卡片组失败', err);
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setCardFront('');
    setCardBack('');
    setShowModal(true);
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setShowModal(true);
  };

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, { front: cardFront, back: cardBack });
      } else {
        await api.post('/cards', { deckId: id, front: cardFront, back: cardBack });
      }
      setShowModal(false);
      fetchDeckData();
    } catch (err) {
      console.error('保存卡片失败', err);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      fetchDeckData();
    } catch (err) {
      console.error('删除卡片失败', err);
    }
  };

  if (loading) return <Layout><div className="text-center py-10">加载中...</div></Layout>;
  if (!deck) return null;

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate('/decks')} className="text-blue-500 hover:underline mb-4">
          ← 返回卡片组列表
        </button>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold">{deck.name}</h2>
            <p className="text-gray-500">{deck.description || '暂无描述'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/decks/${id}/review`)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              开始复习
            </button>
            <button
              onClick={openCreateModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + 添加卡片
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow" style={{ backgroundColor: 'var(--color-card)' }}>
        {cards.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-4xl mb-4">📝</p>
            <p>还没有卡片，添加第一张吧！</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {cards.map((card, index) => (
              <div 
                key={card.id} 
                className="p-4 flex items-start gap-4 cursor-pointer transition-colors"
                style={{ 
                  borderBottomColor: 'var(--color-border)',
                }}
                onClick={() => toggleCard(card.id)}
              >
                <span className="font-medium min-w-[2rem] flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                    {card.front}
                  </p>
                  {expandedCardId === card.id && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="whitespace-pre-wrap font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
                        {card.back}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEditModal(card)} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                    编辑
                  </button>
                  <button onClick={() => deleteCard(card.id)} className="hover:underline" style={{ color: '#ef4444' }}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingCard ? '编辑卡片' : '添加卡片'}</h3>
            <form onSubmit={saveCard}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">正面（问题）</label>
                <textarea
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">背面（答案）</label>
                <textarea
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
