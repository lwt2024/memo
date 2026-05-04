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
    if (!confirm('确定要删除这个卡片组吗？')) return;
    try {
      await api.delete(`/decks/${deckId}`);
      fetchDecks();
    } catch (err) {
      console.error('删除卡片组失败', err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的卡片组</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + 新建卡片组
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">加载中...</div>
      ) : decks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p>还没有卡片组，创建一个开始学习吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white rounded-lg shadow p-4">
              <Link to={`/decks/${deck.id}`}>
                <h3 className="font-bold text-lg mb-2 hover:text-blue-500">{deck.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{deck.description || '暂无描述'}</p>
                <p className="text-blue-500 text-sm">{deck._count?.cards || 0} 张卡片</p>
              </Link>
              <button
                onClick={() => deleteDeck(deck.id)}
                className="mt-3 text-red-500 text-sm hover:underline"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">新建卡片组</h3>
            <form onSubmit={createDeck}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">描述（可选）</label>
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
