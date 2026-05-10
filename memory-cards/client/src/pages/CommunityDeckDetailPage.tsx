import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareApi } from '../services/api';
import Layout from '../components/common/Layout';
import ToastModal from '../components/common/ToastModal';
import { useUser } from '../context/UserContext';

interface Card {
  id: string;
  front: string;
  back: string;
  cardType: string;
}

interface PublicDeckDetail {
  id: string;
  name: string;
  description?: string;
  user: {
    id: string;
    nickname?: string;
    avatar?: string;
  };
  cards: Card[];
  createdAt: string;
}

export default function CommunityDeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [deck, setDeck] = useState<PublicDeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isOwnDeck, setIsOwnDeck] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeckDetail();
    }
  }, [id]);

  const fetchDeckDetail = async () => {
    setLoading(true);
    try {
      const res = await shareApi.getPublicDeckDetail(id!);
      setDeck(res.data);
      setIsOwnDeck(res.data.user.id === user?.id);
    } catch (err) {
      console.error('获取卡片组详情失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!id) return;
    try {
      const res = await shareApi.importPublicDeck(id);
      setToast({ type: 'success', message: `导入成功！卡片组 "${res.data.name}" 已添加到您的账户` });
      setTimeout(() => {
        setToast(null);
        navigate('/decks');
      }, 2000);
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.error || '导入失败' });
      setTimeout(() => setToast(null), 2000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
        </div>
      </Layout>
    );
  }

  if (!deck) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-6xl mb-4">😢</p>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            卡片组不存在或已删除
          </p>
          <button
            onClick={() => navigate('/community')}
            className="mt-6 px-6 py-3 rounded-xl text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            返回社区广场
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center gap-2 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ← 返回社区广场
        </button>

        <div 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                {deck.name}
              </h2>
              {deck.description && (
                <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                    {(deck.user?.nickname || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {deck.user?.nickname || '匿名用户'}
                  </span>
                </div>
                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  {deck.cards.length} 张卡片
                </span>
              </div>
            </div>
            {!isOwnDeck && (
              <button
                onClick={handleImport}
                className="px-6 py-3 rounded-xl text-white font-medium hover:shadow-lg transition-all whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                导入到我的卡片组
              </button>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-4" style={{ color: 'var(--color-text)' }}>卡片预览</h3>
            <div className="space-y-3">
              {deck.cards.slice(0, 10).map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: 'var(--color-background-secondary)' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                        {card.front}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {card.back}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {deck.cards.length > 10 && (
                <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  还有 {deck.cards.length - 10} 张卡片...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <ToastModal
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </Layout>
  );
}