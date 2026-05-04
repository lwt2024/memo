import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../types';
import Layout from '../components/common/Layout';

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
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
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
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            太棒了！
          </h2>
          <p className="text-gray-500 text-lg mb-8">今日没有待复习的卡片</p>
          <button
            onClick={() => navigate(id ? `/decks/${id}` : '/')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all"
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
    { level: 1, label: '忘记', color: 'from-red-400 to-red-600', emoji: '😵' },
    { level: 2, label: '困难', color: 'from-orange-400 to-orange-600', emoji: '😓' },
    { level: 3, label: '一般', color: 'from-yellow-400 to-yellow-600', emoji: '🤔' },
    { level: 4, label: '简单', color: 'from-green-400 to-green-600', emoji: '😊' },
    { level: 5, label: '太简单', color: 'from-blue-400 to-blue-600', emoji: '🤩' },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(id ? `/decks/${id}` : '/')} 
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <span>←</span> 返回
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            {currentCard.deck?.name || '复习'}
          </span>
          <span className="text-gray-600 font-medium">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <div className="mb-4 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className={`relative cursor-pointer perspective-1000 ${isAnimating ? 'animate-pulse' : ''}`}
          onClick={handleFlip}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl p-8 min-h-80 flex flex-col items-center justify-center transition-all duration-500 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            } hover:shadow-3xl`}
          >
            <div className="absolute inset-0 backface-hidden">
              <p className="text-gray-400 text-sm mb-4 text-center">问题</p>
              <p className="text-xl text-center leading-relaxed">{currentCard.front}</p>
              <p className="text-gray-400 text-sm mt-6 text-center">点击翻转查看答案</p>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <p className="text-gray-400 text-sm mb-4 text-center">答案</p>
              <p className="text-xl text-center leading-relaxed text-blue-600">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="mt-8 animate-fade-in">
            <p className="text-center text-gray-600 mb-4 font-medium">你记得怎么样？</p>
            <div className="grid grid-cols-5 gap-2">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.level}
                  onClick={() => handleRating(btn.level)}
                  className={`bg-gradient-to-br ${btn.color} text-white py-4 rounded-xl hover:scale-105 hover:shadow-lg transition-all flex flex-col items-center gap-1`}
                >
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-xs font-medium">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isFlipped && (
          <div className="mt-8 text-center">
            <button
              onClick={handleFlip}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all"
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
      `}</style>
    </Layout>
  );
}
