import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/common/Layout';

interface ReviewStats {
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  newCount: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/review/stats');
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-10">加载中...</div></Layout>;

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">欢迎回来！</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-blue-500">{stats?.dueCount || 0}</p>
          <p className="text-gray-500 text-sm">待复习</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-orange-500">{stats?.learningCount || 0}</p>
          <p className="text-gray-500 text-sm">学习中</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-green-500">{stats?.masteredCount || 0}</p>
          <p className="text-gray-500 text-sm">已掌握</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-purple-500">{stats?.newCount || 0}</p>
          <p className="text-gray-500 text-sm">新卡片</p>
        </div>
      </div>

      {stats && stats.dueCount > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-lg mb-2">今日待复习</h3>
          <p className="text-gray-600 mb-4">你有 {stats.dueCount} 张卡片需要复习</p>
          <button
            onClick={() => navigate('/review')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            开始复习
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">快速开始</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/decks')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">📚</p>
            <p className="font-medium">我的卡片组</p>
            <p className="text-sm text-gray-500">管理你的卡片</p>
          </button>
          <button
            onClick={() => navigate('/community')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">🌐</p>
            <p className="font-medium">社区广场</p>
            <p className="text-sm text-gray-500">发现优质卡片</p>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">⚙️</p>
            <p className="font-medium">设置</p>
            <p className="text-sm text-gray-500">个性化配置</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
