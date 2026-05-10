import { useState, useEffect } from 'react';
import { shareApi } from '../services/api';
import Layout from '../components/common/Layout';
import PublicDeckCard from '../components/common/PublicDeckCard';
import { useUser } from '../context/UserContext';

interface PublicDeck {
  id: string;
  name: string;
  description?: string;
  user: {
    id: string;
    nickname?: string;
    avatar?: string;
  };
  _count: {
    cards: number;
  };
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPublicDecks();
  }, [sortBy]);

  const fetchPublicDecks = async () => {
    setLoading(true);
    try {
      const res = await shareApi.getPublicDecks({ sortBy });
      setDecks(res.data);
    } catch (err) {
      console.error('获取公开卡片组失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPublicDecks();
      return;
    }
    setLoading(true);
    try {
      const res = await shareApi.getPublicDecks({ search: searchQuery });
      setDecks(res.data);
    } catch (err) {
      console.error('搜索失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (deckId: string) => {
    setImportMessage(null);
    try {
      const res = await shareApi.importPublicDeck(deckId);
      setImportMessage({ type: 'success', text: `导入成功！卡片组 "${res.data.name}" 已添加到您的账户` });
      setTimeout(() => setImportMessage(null), 3000);
    } catch (err: any) {
      setImportMessage({ type: 'error', text: err.response?.data?.error || '导入失败' });
      setTimeout(() => setImportMessage(null), 3000);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          社区广场
        </h2>

        {importMessage && (
          <div className={`mb-4 p-4 rounded-xl ${
            importMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {importMessage.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索卡片组..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 rounded-xl pl-10"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                sortBy === 'latest' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'latest' ? 'var(--color-primary)' : 'var(--color-card)',
                color: sortBy === 'latest' ? 'white' : 'var(--color-text)',
                border: `1px solid ${sortBy === 'latest' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                sortBy === 'popular' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'popular' ? 'var(--color-primary)' : 'var(--color-card)',
                color: sortBy === 'popular' ? 'white' : 'var(--color-text)',
                border: `1px solid ${sortBy === 'popular' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              最热
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              暂无公开卡片组
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              快去分享您的卡片组吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <PublicDeckCard
                key={deck.id}
                deck={deck}
                currentUserId={user?.id}
                onImport={handleImport}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
