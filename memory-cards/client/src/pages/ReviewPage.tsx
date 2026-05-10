import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../types';
import Layout from '../components/common/Layout';
import CardContent from '../components/common/CardContent';

interface ReviewCard extends Card {
  deck?: { name: string };
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, [id]);

  const fetchDueCards = async () => {
    try {
      const url = id ? `/review/deck/${id}` : '/review/due';
      const res = await api.get(url);
      setCards(res.data);
    } catch (err) {
      console.error('获取复习卡片失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleRating = async (easeLevel: number) => {
    const card = cards[currentIndex];
    setIsAnimating(true);
    try {
      await api.post('/review/submit', { cardId: card.id, easeLevel });
      setTimeout(() => {
        nextCard();
        setIsAnimating(false);
      }, 300);
    } catch (err) {
      console.error('提交复习结果失败', err);
      setIsAnimating(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate(id ? `/decks/${id}` : '/');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (cards.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            太棒了！
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            今日没有待复习的卡片
          </p>
          <button
            onClick={() => navigate(id ? `/decks/${id}` : '/')}
            className="text-white px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all"
            style={{ background: 'var(--color-button-background)' }}
          >
            返回
          </button>
        </div>
      </Layout>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const ratingButtons = [
    { level: 1, label: '忘记', colorVar: '--color-rating-failed', emoji: '😵' },
    { level: 2, label: '模糊', colorVar: '--color-rating-medium', emoji: '😕' },
    { level: 3, label: '简单', colorVar: '--color-rating-easy', emoji: '😊' },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate(id ? `/decks/${id}` : '/')} 
            className="transition-colors flex items-center gap-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>←</span> 返回
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)' }}>
            {currentCard.deck?.name || '复习'}
          </span>
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="mb-8 rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'var(--color-button-background)'
            }}
          />
        </div>

        {/* 3D 翻转卡片 */}
        <div
          className={`perspective-1000 ${isAnimating ? 'animate-pulse' : ''}`}
        >
          <div
            className={`relative w-full h-[500px] cursor-pointer transform-style-preserve-3d transition-transform duration-1000 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            {/* 问题面 */}
            <div className="absolute inset-0 backface-hidden rounded-2xl shadow-2xl p-8 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
              <p className="text-sm mb-6 text-center flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                问题
              </p>
              <div
                className="flex-1 overflow-auto leading-relaxed text-xl"
                style={{ color: 'var(--color-text)' }}
              >
                <CardContent content={currentCard.front} />
              </div>
              <p className="text-sm mt-6 text-center flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                点击翻转查看答案
              </p>
            </div>

            {/* 答案面 */}
            <div className="absolute inset-0 backface-hidden rounded-2xl shadow-2xl p-8 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-card)', transform: 'rotateY(180deg)' }}>
              <p className="text-sm mb-6 text-center flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                答案
              </p>
              <div
                className="flex-1 overflow-auto leading-relaxed text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                <CardContent content={currentCard.back} />
              </div>
              {currentCard.cardTags && currentCard.cardTags.length > 0 && (
                <div className="flex-shrink-0 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-wrap gap-2">
                    {currentCard.cardTags.map((cardTag) => (
                      <span
                        key={cardTag.tagId}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: 'var(--color-tag-background)',
                          color: cardTag.tag?.color || 'var(--color-primary)',
                          border: '1px solid var(--color-tag-border)'
                        }}
                      >
                        {cardTag.tag?.name || cardTag.tagId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="mt-12 animate-fade-in">
            <p className="text-center mb-6 font-medium text-lg" style={{ color: 'var(--color-text)' }}>
              你记得怎么样？
            </p>
            <div className="grid grid-cols-5 gap-3">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.level}
                  onClick={() => handleRating(btn.level)}
                  className="text-white py-5 rounded-xl hover:scale-105 hover:shadow-lg transition-all flex flex-col items-center gap-2"
                  style={{ background: `var(${btn.colorVar})` }}
                >
                  <span className="text-3xl">{btn.emoji}</span>
                  <span className="text-sm font-medium">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isFlipped && (
          <div className="mt-12 text-center">
            <button
              onClick={handleFlip}
              className="text-white px-10 py-4 rounded-full hover:shadow-lg hover:scale-105 transition-all text-lg font-medium"
              style={{ background: 'var(--color-button-background)' }}
            >
              翻转卡片
            </button>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        /* 美化滚动条 */
        .overflow-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Layout>
  );
}
