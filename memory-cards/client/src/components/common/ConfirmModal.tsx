interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-sm shadow-2xl transition-all animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'var(--color-card)' }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {message}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium transition-all"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-white rounded-xl font-medium transition-all"
            style={{ backgroundColor: '#ef4444' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}