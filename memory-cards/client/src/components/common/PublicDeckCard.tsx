import { useNavigate } from 'react-router-dom';

interface PublicDeckCardProps {
  deck: {
    id: string;
    name: string;
    description?: string;
    user: {
      nickname?: string;
      avatar?: string;
    };
    _count: {
      cards: number;
    };
    createdAt: string;
  };
  onImport: (deckId: string) => void;
}

export default function PublicDeckCard({ deck, onImport }: PublicDeckCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer"
      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onClick={() => navigate(`/community/${deck.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
            {deck.name}
          </h3>
          {deck.description && (
            <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {deck.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {(deck.user?.nickname || 'U')[0].toUpperCase()}
          </div>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {deck.user?.nickname || '匿名用户'}
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {deck._count.cards} 张卡片
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onImport(deck.id);
        }}
        className="w-full py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
      >
        导入到我的卡片组
      </button>
    </div>
  );
}
