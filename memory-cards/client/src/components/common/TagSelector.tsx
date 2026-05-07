import { useState, useEffect } from 'react';
import { Tag } from '../../types';
import { tagApi } from '../../services/api';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  error?: string;
}

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export default function TagSelector({ selectedTagIds, onChange, error }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[0]);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await tagApi.getUserTags();
      setTags(res.data.tags);
    } catch (error) {
      console.error('加载标签失败', error);
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

  const createTag = async () => {
    if (newTagName.length < 2 || newTagName.length > 20) {
      setCreateError('标签名称需要2-20个字符');
      return;
    }
    
    setCreateError('');
    try {
      const res = await tagApi.createTag(newTagName, newTagColor);
      setTags([...tags, res.data.tag]);
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
          已选 {selectedTagIds.length}/3
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          const canSelect = isSelected || selectedTagIds.length < 3;
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => canSelect && toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isSelected ? 'ring-2 ring-offset-1' : ''
              } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: isSelected ? tag.color : 'transparent',
                color: isSelected ? 'white' : tag.color,
                border: `2px solid ${tag.color}`,
              }}
            >
              {tag.name}
            </button>
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
    </div>
  );
}
