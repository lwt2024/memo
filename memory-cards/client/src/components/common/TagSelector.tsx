import { useState, useEffect } from 'react';
import { Tag } from '../../types';
import { tagApi } from '../../services/api';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onTagsUpdated?: () => void;
  error?: string;
  tags?: Tag[];
  deckId?: string;
}

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export default function TagSelector({ selectedTagIds, onChange, onTagsUpdated, error, tags: externalTags }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>(externalTags || []);
  const [loading, setLoading] = useState(!externalTags);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[0]);
  const [createError, setCreateError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (externalTags) {
      setTags(externalTags);
      setLoading(false);
    } else {
      loadTags();
    }
  }, [externalTags]);

  const loadTags = async () => {
    try {
      const res = await tagApi.getUserTags();
      setTags(res.data.tags || []);
    } catch (error: any) {
      console.error('加载标签失败:', error);
      console.error('错误详情:', error.response?.data);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < 3) {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleDeleteClick = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setTagToDelete(tag);
    setShowDeleteConfirm(true);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;
    
    try {
      await tagApi.deleteTag(tagToDelete.id);
      setTags(tags.filter(t => t.id !== tagToDelete.id));
      onChange(selectedTagIds.filter(id => id !== tagToDelete.id));
      onTagsUpdated?.();
      setShowDeleteConfirm(false);
      setTagToDelete(null);
    } catch (error: any) {
      setDeleteError(error.response?.data?.error || '删除标签失败');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTagToDelete(null);
    setDeleteError('');
  };

  const createTag = async () => {
    if (newTagName.length < 2 || newTagName.length > 20) {
      setCreateError('标签名称需要2-20个字符');
      return;
    }
    
    setCreateError('');
    try {
      const res = await tagApi.createTag(newTagName, newTagColor);
      const newTag = res.data;
      if (newTag && newTag.id) {
        setTags([...tags, newTag]);
      }
      setShowCreateModal(false);
      setNewTagName('');
      setNewTagColor(COLOR_OPTIONS[0]);
    } catch (error: any) {
      setCreateError(error.response?.data?.error || '创建标签失败');
    }
  };

  if (loading) return <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          标签
        </label>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          已选 {selectedTagIds?.length || 0}/3
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {(tags || []).filter(Boolean).map((tag) => {
          if (!tag || !tag.id) return null;
          const isSelected = selectedTagIds?.includes(tag.id);
          const canSelect = isSelected || (selectedTagIds?.length || 0) < 3;
          const canDelete = !tag.isPreset;
          
          return (
            <div
              key={tag.id}
              className={`relative inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isSelected ? 'ring-2 ring-offset-1' : ''
              } ${!canSelect && !isSelected ? 'opacity-50' : ''}`}
              style={{
                backgroundColor: isSelected ? tag.color : 'transparent',
                color: isSelected ? 'white' : tag.color,
                border: `2px solid ${tag.color}`,
              }}
            >
              <button
                type="button"
                onClick={() => canSelect && toggleTag(tag.id)}
                className={`${!canSelect && !isSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={!canSelect}
              >
                {tag.name}
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(tag, e)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold hover:bg-white hover:bg-opacity-30 transition-colors"
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed transition-all"
          style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
        >
          + 新建标签
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'var(--color-card)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              新建标签
            </h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                标签名称
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                }}
                placeholder="输入标签名称（2-20字符）"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                标签颜色
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newTagColor === color ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
            </div>

            {createError && (
              <div className="mb-4 text-sm text-red-500">{createError}</div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                  setNewTagName('');
                }}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={createTag}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: newTagColor }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'var(--color-card)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              删除标签
            </h3>
            
            <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
              确定要删除标签 "<span style={{ color: tagToDelete?.color }}>{tagToDelete?.name}</span>" 吗？
              此操作将同时移除该标签在所有卡片上的关联。
            </p>

            {deleteError && (
              <div className="mb-4 text-sm text-red-500">{deleteError}</div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#ef4444' }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
