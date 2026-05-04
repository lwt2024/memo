import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Deck } from '../types';
import Layout from '../components/common/Layout';

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await api.get('/decks');
      setDecks(res.data);
    } catch (err) {
      console.error('获取卡片组失败', err);
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/decks', { name: newDeckName, description: newDeckDesc });
      setShowModal(false);
      setNewDeckName('');
      setNewDeckDesc('');
      fetchDecks();
    } catch (err) {
      console.error('创建卡片组失败', err);
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm('确定要删除这个卡片组吗？所有卡片都将被删除！')) return;
    try {
      await api.delete(`/decks/${deckId}`);
      fetchDecks();
    } catch (err) {
      console.error('删除卡片组失败', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            我的卡片组
          </h2>
          <p className="text-gray-500">共 {decks.length} 个卡片组</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> 新建卡片组
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <div className="text-8xl mb-6">📚</div>
          <h3 className="text-2xl font-bold mb-4 text-gray-700">还没有卡片组</h3>
          <p className="text-gray-500 mb-6">创建一个开始你的学习之旅吧</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            创建第一个卡片组
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, index) => (
            <div
              key={deck.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link to={`/decks/${deck.id}`} className="block p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                    📚
                  </div>
                  <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                    {deck._count?.cards || 0} 张
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {deck.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {deck.description || '暂无描述'}
                </p>
              </Link>
              <div className="px-6 pb-4 flex gap-2">
                <Link
                  to={`/decks/${deck.id}/review`}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all"
                >
                  开始复习
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteDeck(deck.id);
                  }}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              新建卡片组
            </h3>
            <form onSubmit={createDeck}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例如：英语单词、历史年代"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">描述（可选）</label>
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="简单描述一下这个卡片组的内容..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
