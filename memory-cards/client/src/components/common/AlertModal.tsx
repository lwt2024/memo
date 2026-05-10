interface AlertModalProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function AlertModal({ message, type, onClose }: AlertModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="rounded-2xl p-6 w-full max-w-sm mx-4 text-center" 
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'var(--color-card)' }}
      >
        <div className="text-5xl mb-4">
          {type === 'success' ? '✅' : '❌'}
        </div>
        <p className="text-lg font-medium mb-6" style={{ color: 'var(--color-text)' }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium"
          style={{ 
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444', 
            color: 'white' 
          }}
        >
          确定
        </button>
      </div>
    </div>
  );
}