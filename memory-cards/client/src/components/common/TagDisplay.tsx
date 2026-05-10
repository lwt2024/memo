import { Tag } from '../../types';

interface TagDisplayProps {
  tags: Tag[];
  maxTags?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

export default function TagDisplay({
  tags,
  maxTags = 3,
  showCount = false,
  size = 'md',
}: TagDisplayProps) {
  const displayTags = tags.slice(0, maxTags);
  const extraCount = tags.length - maxTags;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <span
          key={tag.id}
          className={`${sizeClasses[size]} rounded-full text-white whitespace-nowrap`}
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          {showCount && tag.count && ` (${tag.count})`}
        </span>
      ))}
      {extraCount > 0 && (
        <span
          className={`${sizeClasses[size]} rounded-full bg-gray-500 text-white whitespace-nowrap`}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
}
