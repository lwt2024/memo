import { useState } from 'react';
import { shareApi } from '../../services/api';

interface ShareModalProps {
  deckId: string;
  deckName: string;
  isPublic: boolean;
  inviteCode?: string | null;
  onClose: () => void;
  onShareChange: (isPublic: boolean) => void;
}

export default function ShareModal({ deckId, deckName, isPublic, inviteCode, onClose, onShareChange }: ShareModalProps) {
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [currentCode, setCurrentCode] = useState(inviteCode);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePublicToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !publicStatus;
      await shareApi.setPublic(deckId, newStatus);
      setPublicStatus(newStatus);
      onShareChange(newStatus);
    } catch (err) {
      console.error('设置公开失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setLoading(true);
    try {
      const res = await shareApi.generateInvite(deckId);
      setCurrentCode(res.data.inviteCode);
    } catch (err) {
      console.error('生成邀请码失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          分享设置
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {deckName}
        </p>

        <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>公开分享</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>在社区广场展示</p>
          </div>
          <button
            onClick={handlePublicToggle}
            disabled={loading}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              publicStatus ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform absolute top-0.5 ${
              publicStatus ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>私密分享</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>生成邀请码</p>
            </div>
          </div>

          {currentCode ? (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 px-4 py-2 rounded-lg font-mono text-lg tracking-wider" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-primary)' }}>
                {currentCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="w-full mt-3 px-4 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              生成邀请码
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium"
          style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text)' }}
        >
          关闭
        </button>
      </div>
    </div>
  );
}
