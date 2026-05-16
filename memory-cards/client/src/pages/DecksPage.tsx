import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { shareApi } from '../services/api';
import { Deck } from '../types';
import Layout from '../components/common/Layout';
import ConfirmModal from '../components/common/ConfirmModal';

export default function DecksPage() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [createError, setCreateError] = useState('');

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
    setCreateError('');
    try {
      await api.post('/decks', { name: newDeckName, description: newDeckDesc });
      setShowModal(false);
      setNewDeckName('');
      setNewDeckDesc('');
      setCreateError('');
      fetchDecks();
    } catch (err: any) {
      console.error('创建卡片组失败', err);
      setCreateError(err.response?.data?.error || '创建失败，请重试');
    }
  };

  const importDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setImportError('请输入邀请码');
      return;
    }

    setImporting(true);
    setImportError('');

    try {
      const res = await shareApi.importByCode(inviteCode.trim());
      setShowImportModal(false);
      setInviteCode('');
      fetchDecks();
      setTimeout(() => {
        navigate(`/decks/${res.data.id}`);
      }, 500);
    } catch (err: any) {
      setImportError(err.response?.data?.error || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteClick = (deckId: string) => {
    setDeckToDelete(deckId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;
    try {
      await api.delete(`/decks/${deckToDelete}`);
      fetchDecks();
    } catch (err) {
      console.error('删除卡片组失败', err);
    } finally {
      setShowConfirmModal(false);
      setDeckToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDeckToDelete(null);
  };

  // const handleShareClick = async (deckId: string) => {
  //   try {
  //     const res = await shareApi.generateInvite(deckId);
  //     if (res.data && res.data.inviteCode) {
  //       const shareUrl = `${window.location.origin}/import/${res.data.inviteCode}`;
  //       await navigator.clipboard.writeText(shareUrl);
  //       alert('分享链接已复制到剪贴板！');
  //     } else {
  //       console.error('生成分享链接失败：邀请码为空');
  //       alert('生成分享链接失败，请稍后重试');
  //     }
  //   } catch (err: any) {
  //     console.error('生成分享链接失败', err);
  //     alert(err.response?.data?.error || '生成分享链接失败，请稍后重试');
  //   }
  // };

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

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            我的卡片组
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>共 {decks.length} 个卡片组</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <span className="text-xl">+</span> 新建卡片组
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            <span className="text-xl">🔗</span> 输入邀请码
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <div 
          className="text-center py-20 rounded-2xl shadow-lg transition-colors"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          <div className="text-8xl mb-6">📚</div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>还没有卡片组</h3>
          <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>创建一个开始你的学习之旅吧</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            创建第一个卡片组
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck, index) => (
            <div
              key={deck.id}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all group overflow-hidden"
              style={{ backgroundColor: 'var(--color-card)', animationDelay: `${index * 100}ms` }}
            >
              <Link to={`/decks/${deck.id}`} className="block p-6">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                  >
                    📚
                  </div>
                  <span 
                    className="text-sm px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-primary)' }}
                  >
                    {deck._count?.cards || 0} 张
                  </span>
                </div>
                <h3 
                  className="font-bold text-lg mb-2 transition-colors"
                  style={{ color: 'var(--color-text)' }}
                >
                  {deck.name}
                </h3>
                <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {deck.description || '暂无描述'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    {(deck.originalCreator?.nickname || deck.user?.nickname || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {deck.originalCreator?.nickname || deck.user?.nickname || '匿名用户'}
                    {deck.originalCreator && ' (导入)'}
                  </span>
                </div>
              </Link>
              <div className="px-6 pb-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteClick(deck.id);
                  }}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-sm transition-colors"
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
          <div 
            className="rounded-2xl p-8 w-full max-w-md shadow-2xl transition-colors" 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--color-card)' }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              新建卡片组
            </h3>
            <form onSubmit={createDeck}>
              <div className="mb-4">
                <label className="block font-medium mb-2" style={{ color: 'var(--color-text)' }}>名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => {
                    setNewDeckName(e.target.value);
                    if (createError) setCreateError('');
                  }}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    borderColor: createError ? '#ef4444' : 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="例如：英语单词、历史年代"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-2" style={{ color: 'var(--color-text)' }}>描述（可选）</label>
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  rows={3}
                  placeholder="简单描述一下这个卡片组的内容..."
                />
              </div>
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-sm">
                  {createError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl transition-colors font-medium"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    color: 'var(--color-text)' 
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowImportModal(false)}>
          <div 
            className="rounded-2xl p-8 w-full max-w-md shadow-2xl transition-colors" 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--color-card)' }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              📥 输入邀请码
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              输入好友分享的卡片组邀请码，即可导入到你的卡片组中
            </p>
            <form onSubmit={importDeck}>
              <div className="mb-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setImportError('');
                  }}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    borderColor: importError ? '#ef4444' : 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  placeholder="请输入邀请码"
                />
              </div>
              {importError && (
                <p className="text-sm text-red-500 mb-4">{importError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-3 rounded-xl transition-colors font-medium"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)', 
                    color: 'var(--color-text)' 
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="flex-1 py-3 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
                >
                  {importing ? '导入中...' : '导入'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          title="确认删除"
          message="确定要删除这个卡片组吗？所有卡片都将被删除！"
          confirmText="删除"
          cancelText="取消"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </Layout>
  );
}
