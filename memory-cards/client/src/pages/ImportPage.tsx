import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareApi } from '../services/api';
import Layout from '../components/common/Layout';

export default function ImportPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deckName, setDeckName] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      handleImport();
    }
  }, [code]);

  const handleImport = async () => {
    if (!code) return;

    setImporting(true);
    setError(null);

    try {
      const res = await shareApi.importByCode(code);
      setDeckName(res.data.name);
      setTimeout(() => {
        navigate(`/decks/${res.data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || '导入失败');
    } finally {
      setLoading(false);
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center py-20">
        {loading || importing ? (
          <>
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              正在导入卡片组...
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              邀请码: {code}
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-6xl mb-4">😢</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              导入失败
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-3 rounded-xl text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              浏览社区
            </button>
          </>
        ) : deckName ? (
          <>
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              导入成功！
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {deckName}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              即将跳转到卡片组...
            </p>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
