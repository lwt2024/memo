import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { tagApi, deckApi } from '../services/api';
import { Card, Deck, Tag as TagType } from '../types';
import Layout from '../components/common/Layout';
import TagSelector from '../components/common/TagSelector';
import TagDisplay from '../components/common/TagDisplay';
import TagFilter from '../components/common/TagFilter';
import CodeEditor from '../components/common/CodeEditor';
import CardContent from '../components/common/CardContent';
import ShareModal from '../components/common/ShareModal';

interface DeckStats {
  totalCards: number;
  learningCount: number;
  masteredCount: number;
  notLearnedCount: number;
  difficultCount: number;
  dueReviewCount: number;
  todayNewCount: number;
  todayReviewedCount: number;
  masteredPercent: number;
  estimatedMinutes: number;
}

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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [deckTags, setDeckTags] = useState<TagType[]>([]);
  const [tagError, setTagError] = useState('');
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [pastingImage, setPastingImage] = useState(false);
  const frontEditorRef = useRef<HTMLDivElement>(null);
  const backEditorRef = useRef<HTMLDivElement>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeEditorTarget, setCodeEditorTarget] = useState<'front' | 'back'>('front');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeckData();
      fetchDeckTags();
      fetchStats();
    }
  }, [id, sortBy, sortOrder, masteryFilter]);

  const fetchStats = async () => {
    try {
      const res = await deckApi.getDeckStats(id!);
      setStats(res.data);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  // 过滤卡片
  const filteredCards = deck?.cards?.filter(card => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!(card.front.toLowerCase().includes(query) ||
            card.back.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // 标签过滤
    if (tagFilter.length > 0) {
      const cardTagIds = card.cardTags?.map(ct => ct.tagId) || [];
      const hasAllTags = tagFilter.every(tagId => cardTagIds.includes(tagId));
      if (!hasAllTags) return false;
    }
    
    return true;
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

  const fetchDeckTags = async () => {
    try {
      const res = await tagApi.getDeckTags(id!);
      setDeckTags(res.data.tags);
    } catch (error) {
      console.error('获取标签失败', error);
    }
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setCardFront('');
    setCardBack('');
    setShowModal(true);
    setSelectedTagIds([]);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>, field: 'front' | 'back') => {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        setPastingImage(true);
        
        const file = items[i].getAsFile();
        if (!file) {
          setPastingImage(false);
          return;
        }
        
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              
              const img = document.createElement('img');
              img.src = base64;
              img.style.maxWidth = '100%';
              img.style.maxHeight = '150px';
              img.style.objectFit = 'contain';
              img.style.display = 'block';
              img.style.margin = '8px 0';
              img.className = 'pasted-image';
              range.insertNode(img);
              
              const br = document.createElement('br');
              range.insertNode(br);
            }
            
            updateContent(field);
            setPastingImage(false);
          };
          reader.onerror = () => {
            console.error('读取图片失败');
            setPastingImage(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('处理图片失败', error);
          setPastingImage(false);
        }
        
        return;
      }
    }
  };

  const updateContent = (field: 'front' | 'back') => {
    if (field === 'front' && frontEditorRef.current) {
      setCardFront(frontEditorRef.current.innerHTML);
    } else if (field === 'back' && backEditorRef.current) {
      setCardBack(backEditorRef.current.innerHTML);
    }
  };

  const handleInsertCode = (codeHtml: string) => {
    if (codeEditorTarget === 'front') {
      setCardFront(prev => prev + codeHtml);
    } else {
      setCardBack(prev => prev + codeHtml);
    }
  };

  const openCodeEditor = (target: 'front' | 'back') => {
    setCodeEditorTarget(target);
    setShowCodeEditor(true);
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setSelectedTagIds(card.cardTags?.map(ct => ct.tagId) || []);
    setShowModal(true);
  };

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError('');
    
    try {
      let cardId: string;
      
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, { front: cardFront, back: cardBack });
        cardId = editingCard.id;
        
        const existingTagIds = editingCard.cardTags?.map(ct => ct.tagId) || [];
        for (const tagId of existingTagIds) {
          try {
            await tagApi.removeTagFromCard(cardId, tagId);
          } catch {}
        }
      } else {
        const res = await api.post('/cards', { deckId: id, front: cardFront, back: cardBack });
        const newCard = res.data;
        cardId = newCard.id || newCard.card?.id;
      }
      
      for (const tagId of selectedTagIds) {
        try {
          await tagApi.addTagToCard(cardId, tagId);
        } catch (error: any) {
          setTagError(error.response?.data?.error || '添加标签失败');
        }
      }
      
      setShowModal(false);
      fetchDeckData();
      fetchDeckTags();
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
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}
            >
              + 添加卡片
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text)' }}
            >
              分享
            </button>
          </div>
        </div>

        {stats && (
          <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span style={{ color: '#3b82f6' }}>学习中</span>
                <span className="font-bold" style={{ color: '#3b82f6' }}>{stats.learningCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#22c55e' }}>已掌握</span>
                <span className="font-bold" style={{ color: '#22c55e' }}>{stats.masteredCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#9ca3af' }}>未学习</span>
                <span className="font-bold" style={{ color: '#9ca3af' }}>{stats.notLearnedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#ef4444' }}>疑难</span>
                <span className="font-bold" style={{ color: '#ef4444' }}>{stats.difficultCount}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <span>已掌握 {stats.masteredPercent}%</span>
                <span>{stats.masteredCount}/{stats.totalCards}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.masteredPercent}%`,
                    background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#22c55e' }}>{stats.todayNewCount}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>今日新卡</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>{stats.dueReviewCount}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>今日待复习</div>
              </div>
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <div className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{stats.estimatedMinutes}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>预计耗时(分)</div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/decks/${id}/review`)}
              className="w-full py-4 rounded-xl text-white text-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              开始学习
            </button>
          </div>
        )}
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
        <div className="mt-4">
          <TagFilter
            tags={deckTags}
            selectedTagIds={tagFilter}
            onChange={setTagFilter}
          />
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
                  borderBottom: '1px solid var(--color-border)',
                  marginBottom: index < (filteredCards?.length || 0) - 1 ? '0.5rem' : '0'
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="font-medium min-w-[2rem] flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <CardContent content={card.front} />
                    {/* 卡片元数据 */}
                    <div className="flex flex-wrap gap-2 mt-2 items-center text-sm">
                      {card.cardTags && card.cardTags.length > 0 && (
                        <TagDisplay
                          tags={card.cardTags.map(ct => ct.tag)}
                          size="sm"
                        />
                      )}
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
                        <CardContent content={card.back} />
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
          <div className="rounded-lg w-full my-4 mx-auto shadow-2xl" style={{ 
            backgroundColor: 'var(--color-card)',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-border) transparent'
          }}>
            <div className="p-6 sm:p-8">
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {editingCard ? '编辑卡片' : '添加卡片'}
            </h3>
            <form onSubmit={saveCard}>
              <div className="mb-6">
                <label className="block mb-3 text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  正面（问题）
                  <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                    (支持粘贴图片)
                  </span>
                  <button
                    type="button"
                    onClick={() => openCodeEditor('front')}
                    className="ml-3 px-3 py-1 text-sm rounded-full border transition-colors hover:bg-gray-100"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                      插入代码
                    </>
                  </button>
                </label>
                <div
                  ref={frontEditorRef}
                  contentEditable
                  className="w-full px-4 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                    height: '200px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb transparent'
                  }}
                  onPaste={(e) => handlePaste(e, 'front')}
                  onInput={() => updateContent('front')}
                  dangerouslySetInnerHTML={{ __html: cardFront || '<br>' }}
                />
                {pastingImage && (
                  <p className="text-sm mt-2" style={{ color: 'var(--color-primary)' }}>
                    正在处理图片...
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label className="block mb-3 text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  背面（答案）
                  <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                    (支持粘贴图片)
                  </span>
                  <button
                    type="button"
                    onClick={() => openCodeEditor('back')}
                    className="ml-3 px-3 py-1 text-sm rounded-full border transition-colors hover:bg-gray-100"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                      插入代码
                    </>
                  </button>
                </label>
                <div
                  ref={backEditorRef}
                  contentEditable
                  className="w-full px-4 py-3 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                    height: '250px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb transparent'
                  }}
                  onPaste={(e) => handlePaste(e, 'back')}
                  onInput={() => updateContent('back')}
                  dangerouslySetInnerHTML={{ __html: cardBack || '<br>' }}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-3 text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  标签
                </label>
                <TagSelector
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                  deckId={id!}
                  onTagsUpdated={fetchDeckTags}
                />
                {tagError && <p className="text-red-500 mt-2">{tagError}</p>}
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
        </div>
      )}

      {showCodeEditor && (
        <CodeEditor
          onInsert={handleInsertCode}
          onClose={() => setShowCodeEditor(false)}
        />
      )}

      {showShareModal && deck && (
        <ShareModal
          deckId={deck.id}
          deckName={deck.name}
          isPublic={(deck as any).isPublic || false}
          inviteCode={(deck as any).inviteCode}
          onClose={() => setShowShareModal(false)}
          onShareChange={(isPublic) => {
            setDeck((prev: any) => ({ ...prev, isPublic }));
          }}
        />
      )}
    </Layout>
  );
}
