import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, Deck } from '../types';
import Layout from '../components/common/Layout';

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'masteryLevel'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [masteryFilter, setMasteryFilter] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) fetchDeckData();
  }, [id, sortBy, sortOrder, masteryFilter]);

  // 过滤卡片
  const filteredCards = deck?.cards?.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.front.toLowerCase().includes(query) || 
      card.back.toLowerCase().includes(query)
    );
  });

  const fetchDeckData = async () => {
    try {
      const params: any = { sortBy, sortOrder };
      if (masteryFilter !== '') {
        params.masteryLevel = masteryFilter;
      }
      const res = await api.get(`/decks/${id}`, { params });
      setDeck(res.data);
    } catch (error) {
      console.error('获取卡片组失败', error);
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
    } catch (error) {
      console.error('保存卡片失败', error);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      fetchDeckData();
    } catch (error) {
      console.error('删除卡片失败', error);
    }
  };

  const toggleCard = (cardId: string) => {
    setExpandedCardId(prev => prev === cardId ? null : cardId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getMasteryLevelColor = (level: number) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getMasteryLabel = (level: number) => {
    const labels = ['未学习', '初识', '熟悉', '掌握', '熟练', '精通'];
    return labels[Math.min(level, labels.length - 1)];
  };

  if (loading) return <Layout><div className="text-center py-10" style={{ color: 'var(--color-text)' }}>加载中...</div></Layout>;
  if (!deck) return null;

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate('/decks')} className="mb-4" style={{ color: 'var(--color-primary)' }}>
          ← 返回卡片组列表
        </button>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{deck.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{deck.description || '暂无描述'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/decks/${id}/review`)}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              开始复习
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              + 添加卡片
            </button>
          </div>
        </div>
      </div>

      {/* 搜索、筛选和排序 */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>搜索:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索卡片内容..."
                className="flex-1 px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-2 rounded border hover:bg-gray-100"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {/* 排序和筛选 */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              >
                <option value="createdAt">创建时间</option>
                <option value="masteryLevel">掌握程度</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 rounded border hover:bg-gray-100"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>掌握程度:</span>
              <select
                value={masteryFilter}
                onChange={(e) => setMasteryFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              >
                <option value="">全部</option>
                <option value="0">未学习</option>
                <option value="1">初识</option>
                <option value="2">熟悉</option>
                <option value="3">掌握</option>
                <option value="4">熟练</option>
                <option value="5">精通</option>
              </select>
            </div>
          </div>
        </div>
        {/* 搜索结果计数 */}
        {searchQuery && filteredCards && (
          <div className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            找到 {filteredCards.length} 张卡片
          </div>
        )}
      </div>

      {/* 卡片列表 */}
      <div className="rounded-lg shadow" style={{ backgroundColor: 'var(--color-card)' }}>
        {filteredCards?.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-4xl mb-4">🔍</p>
            {searchQuery ? (
              <p>没有找到匹配的卡片</p>
            ) : (
              <p>还没有卡片，添加第一张吧！</p>
            )}
          </div>
        ) : (
          <div>
            {filteredCards?.map((card, index) => (
              <div
                key={card.id}
                className="p-4 cursor-pointer transition-colors"
                onClick={() => toggleCard(card.id)}
                style={{
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="font-medium min-w-[2rem] flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                      {card.front}
                    </p>
                    {/* 卡片元数据 */}
                    <div className="flex flex-wrap gap-2 mt-2 items-center text-sm">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        📅 {formatDate(card.createdAt)}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        🔄 复习 {card.reviewRecord?.reviewCount || 0} 次
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getMasteryLevelColor(card.reviewRecord?.masteryLevel || 0),
                          color: 'white'
                        }}
                      >
                        {getMasteryLabel(card.reviewRecord?.masteryLevel || 0)}
                      </span>
                    </div>
                    {/* 展开的背面 */}
                    {expandedCardId === card.id && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <p
                          className="whitespace-pre-wrap font-mono text-sm"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {card.back}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEditModal(card)}
                      className="hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="hover:underline"
                      style={{ color: '#ef4444' }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="rounded-lg p-8 w-full max-w-4xl my-8" style={{ backgroundColor: 'var(--color-card)' }}>
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {editingCard ? '编辑卡片' : '添加卡片'}
            </h3>
            <form onSubmit={saveCard}>
              <div className="mb-6">
                <label className="block mb-3 text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  正面（问题）
                </label>
                <textarea
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-4 py-3 rounded border font-mono"
                  rows={8}
                  required
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-3 text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  背面（答案）
                </label>
                <textarea
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-4 py-3 rounded border font-mono"
                  rows={12}
                  required
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)'
                  }}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-lg text-lg"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-white text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                  }}
                >
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
