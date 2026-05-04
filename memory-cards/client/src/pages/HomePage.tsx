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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: '待复习', value: stats?.dueCount || 0, color: 'from-red-500 to-orange-500', emoji: '📚' },
    { label: '学习中', value: stats?.learningCount || 0, color: 'from-orange-500 to-yellow-500', emoji: '📖' },
    { label: '已掌握', value: stats?.masteredCount || 0, color: 'from-green-500 to-emerald-500', emoji: '🎯' },
    { label: '新卡片', value: stats?.newCount || 0, color: 'from-blue-500 to-indigo-500', emoji: '✨' },
  ];

  const quickActions = [
    { icon: '📚', title: '我的卡片组', desc: '管理你的卡片', path: '/decks', gradient: 'from-violet-500 to-purple-500' },
    { icon: '🌐', title: '社区广场', desc: '发现优质卡片', path: '/community', gradient: 'from-cyan-500 to-blue-500' },
    { icon: '⚙️', title: '设置', desc: '个性化配置', path: '/settings', gradient: 'from-gray-500 to-slate-500' },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            欢迎回来！
          </span>
        </h2>
        <p className="text-gray-500">继续保持学习的热情 🎉</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer`}
            onClick={() => stat.label === '待复习' && (stats?.dueCount ?? 0) > 0 && navigate('/review')}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.emoji}</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-white/80 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats && stats.dueCount > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">📚 今日待复习</h3>
              <p className="text-white/80">你有 <span className="font-bold text-white">{stats.dueCount}</span> 张卡片需要复习</p>
            </div>
            <button
              onClick={() => navigate('/review')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              开始复习
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {stats && stats.dueCount === 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎉</span>
            <div>
              <h3 className="text-xl font-bold mb-1">太棒了！</h3>
              <p className="text-white/80">今日所有卡片都已复习完毕，继续保持！</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`bg-gradient-to-br ${action.gradient} p-6 rounded-xl text-white text-left hover:shadow-lg transition-all hover:scale-[1.02]`}
            >
              <span className="text-3xl mb-3 block">{action.icon}</span>
              <p className="font-bold text-lg mb-1">{action.title}</p>
              <p className="text-white/80 text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>记忆卡片 · 艾宾浩斯记忆法 · 让学习更高效</p>
      </div>
    </Layout>
  );
}
