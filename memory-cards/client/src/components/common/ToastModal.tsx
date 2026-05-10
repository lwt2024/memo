interface ToastModalProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function ToastModal({ message, type, onClose }: ToastModalProps) {
  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${
          type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}
        style={{
          backdropFilter: 'blur(8px)',
          border: `1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
        }}
      >
        <span className="flex items-center gap-2">
          {type === 'success' ? '✅' : '❌'}
          {message}
        </span>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}