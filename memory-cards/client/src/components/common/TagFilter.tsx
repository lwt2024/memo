import { Tag } from '../../types';

interface TagFilterProps {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagFilter({ tags, selectedTagIds, onChange }: TagFilterProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const isAllSelected = selectedTagIds.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-gray-600 text-sm font-medium">标签:</span>
      
      <button
        onClick={clearAll}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          isAllSelected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>

      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag.name}
            {tag.count !== undefined && ` (${tag.count})`}
          </button>
        );
      })}
    </div>
  );
}
