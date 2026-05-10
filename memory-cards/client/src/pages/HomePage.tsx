import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/common/Layout';

interface ReviewStats {
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  totalCards: number;
}

interface DailyStats {
  date: string;
  reviewed: number;
  learned: number;
  predictedDue?: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    Promise.all([fetchStats(), fetchDailyStats()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/review/stats');
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败', err);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const res = await api.get('/review/daily-stats');
      setDailyStats(res.data);
    } catch (err) {
      console.error('获取每日统计失败', err);
      // Mock数据
      const today = new Date();
      const mockData: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          reviewed: Math.floor(Math.random() * 20) + 5,
          learned: Math.floor(Math.random() * 10) + 2,
        });
      }
      // 添加未来3天的预测
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        mockData.push({
          date: date.toISOString().split('T')[0],
          reviewed: 0,
          learned: 0,
          predictedDue: Math.floor(Math.random() * 15) + 10,
        });
      }
      setDailyStats(mockData);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return '今天';
    if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getMaxValue = () => {
    const values = dailyStats.flatMap(d => [d.reviewed, d.learned, d.predictedDue || 0]);
    return Math.max(...values, 1);
  };

  const handleStatClick = (label: string) => {
    switch (label) {
      case '待复习':
        if (stats?.dueCount && stats.dueCount > 0) {
          navigate('/review');
        }
        break;
      case '学习中':
        navigate('/decks?filter=learning');
        break;
      case '已掌握':
        navigate('/decks?filter=mastered');
        break;
      case '卡片总数':
        navigate('/decks');
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div 
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            ></div>
            <p style={{ color: 'var(--color-text-secondary)' }}>加载中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { label: '待复习', value: stats?.dueCount || 0, color: 'var(--color-stat-due)', emoji: '📚' },
    { label: '学习中', value: stats?.learningCount || 0, color: 'var(--color-stat-learning)', emoji: '📖' },
    { label: '已掌握', value: stats?.masteredCount || 0, color: 'var(--color-stat-mastered)', emoji: '🎯' },
    { label: '卡片总数', value: stats?.totalCards || 0, color: 'var(--color-stat-new)', emoji: '📊' },
  ];

  const maxValue = getMaxValue();

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          欢迎回来！
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>继续保持学习的热情 🎉</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer ${
              stat.label === '待复习' && (stats?.dueCount ?? 0) === 0 ? 'opacity-60' : ''
            }`}
            style={{ 
              background: stat.color,
              boxShadow: 'var(--color-stat-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
              border: stat.color === '#ffffff' ? '1px solid var(--color-border)' : 'none'
            }}
            onClick={() => handleStatClick(stat.label)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">{stat.emoji}</span>
            </div>
            <p className="text-4xl font-bold mb-1" style={{ color: 'var(--color-stat-text)' }}>{stat.value}</p>
            <p className="text-sm" style={{ color: 'var(--color-stat-text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {stats && stats.dueCount > 0 && (
        <div 
          className="rounded-2xl p-6 mb-8 cursor-pointer transition-all"
          style={{ 
            background: 'var(--color-card)',
            boxShadow: 'var(--color-stat-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
            border: '1px solid var(--color-border)'
          }}
          onClick={() => navigate('/review')}
        >
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>📚 今日待复习</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>你有 <span className="font-bold" style={{ color: 'var(--color-text)' }}>{stats.dueCount}</span> 张卡片需要复习，点击进入复习</p>
          </div>
        </div>
      )}

      {stats && stats.dueCount === 0 && (
        <div 
          className="rounded-2xl p-6 mb-8"
          style={{ 
            background: 'var(--color-card)',
            boxShadow: 'var(--color-stat-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎉</span>
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>太棒了！</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>今日所有卡片都已复习完毕，继续保持！</p>
            </div>
          </div>
        </div>
      )}

      {/* 学习数据分析模块 */}
      <div 
        className="rounded-2xl p-6 transition-colors mb-8"
        style={{ 
          backgroundColor: 'var(--color-card)',
          boxShadow: 'var(--color-stat-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
          border: '1px solid var(--color-border)'
        }}
      >
        <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--color-text)' }}>📈 学习数据分析</h3>
        
        {/* 曲线图 */}
        <div className="relative h-56 px-4">
          {/* Y轴网格线 */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div 
              key={i}
              className="absolute left-0 right-0 border-t border-dashed"
              style={{ 
                top: `${(1 - ratio) * 100}%`,
                borderColor: 'var(--color-border)'
              }}
            />
          ))}
          
          {/* Y轴刻度 */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-2">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <div key={i} className="text-xs text-right pr-2" style={{ color: 'var(--color-text-secondary)' }}>
                {Math.round(maxValue * ratio)}
              </div>
            ))}
          </div>
          
          {/* 曲线图区域 */}
          <div 
            className="absolute left-14 right-0 top-0 bottom-0"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const index = Math.round((x / rect.width) * (dailyStats.length - 1));
              if (index >= 0 && index < dailyStats.length) {
                setHoveredDay(index);
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }
            }}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {/* 已复习曲线 */}
            <svg className="w-full h-full" viewBox={`0 0 ${dailyStats.length * 60} 200`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="reviewGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="learnGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="predictGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* 已复习面积 */}
              <path
                d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - (d.reviewed / maxValue) * 200}`).join(' L ')} L ${(dailyStats.length - 1) * 60},200 L 0,200 Z`}
                fill="url(#reviewGradient)"
              />
              {/* 已复习曲线 */}
              <path
                d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - (d.reviewed / maxValue) * 200}`).join(' L ')}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* 新学习面积 */}
              <path
                d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - (d.learned / maxValue) * 200}`).join(' L ')} L ${(dailyStats.length - 1) * 60},200 L 0,200 Z`}
                fill="url(#learnGradient)"
              />
              {/* 新学习曲线 */}
              <path
                d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - (d.learned / maxValue) * 200}`).join(' L ')}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* 预测复习曲线 */}
              {dailyStats.some(d => d.predictedDue !== undefined) && (
                <>
                  <path
                    d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - ((d.predictedDue || 0) / maxValue) * 200}`).join(' L ')} L ${(dailyStats.length - 1) * 60},200 L 0,200 Z`}
                    fill="url(#predictGradient)"
                  />
                  <path
                    d={`M ${dailyStats.map((d, i) => `${i * 60},${200 - ((d.predictedDue || 0) / maxValue) * 200}`).join(' L ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              
              {/* 数据点 */}
              {dailyStats.map((d, i) => (
                <g key={i}>
                  <circle 
                    cx={i * 60} 
                    cy={200 - (d.reviewed / maxValue) * 200} 
                    r={hoveredDay === i ? 6 : 4} 
                    fill="#3b82f6" 
                    className="transition-all cursor-pointer"
                  />
                  <circle 
                    cx={i * 60} 
                    cy={200 - (d.learned / maxValue) * 200} 
                    r={hoveredDay === i ? 6 : 4} 
                    fill="#22c55e" 
                    className="transition-all cursor-pointer"
                  />
                  {d.predictedDue !== undefined && (
                    <circle 
                      cx={i * 60} 
                      cy={200 - ((d.predictedDue || 0) / maxValue) * 200} 
                      r={hoveredDay === i ? 6 : 4} 
                      fill="#f59e0b" 
                      className="transition-all cursor-pointer"
                    />
                  )}
                </g>
              ))}
            </svg>
            
            {/* 悬停提示 */}
            {hoveredDay !== null && (
              <div 
                className="absolute px-3 py-2 rounded-lg text-xs shadow-lg z-10 pointer-events-none backdrop-blur-sm"
                style={{
                  left: `${(hoveredDay / (dailyStats.length - 1)) * 100}%`,
                  top: '10%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--color-card-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
                }}
              >
                <div className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  {dailyStats[hoveredDay].predictedDue !== undefined ? `预测${formatDate(dailyStats[hoveredDay].date)}` : formatDate(dailyStats[hoveredDay].date)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>已复习: {dailyStats[hoveredDay].reviewed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>新学习: {dailyStats[hoveredDay].learned}</span>
                  </div>
                  {dailyStats[hoveredDay].predictedDue !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>预测复习: {dailyStats[hoveredDay].predictedDue}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* X轴日期标签 */}
          <div className="absolute left-14 right-0 bottom-0 flex justify-between pb-2">
            {dailyStats.map((day, index) => (
              <div 
                key={index} 
                className={`text-xs ${day.predictedDue !== undefined ? '' : ''}`} 
                style={{ color: day.predictedDue !== undefined ? '#f59e0b' : 'var(--color-text-secondary)' }}
              >
                {day.predictedDue !== undefined ? `预测${formatDate(day.date)}` : formatDate(day.date)}
              </div>
            ))}
          </div>
        </div>
        
        {/* 图例 */}
        <div className="flex justify-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0ea5e9' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>已复习</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>新学习</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded opacity-60" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>预测复习</span>
          </div>
        </div>
        
        {/* 艾宾浩斯遗忘曲线提示 */}
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>艾宾浩斯遗忘曲线</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                根据艾宾浩斯遗忘曲线规律，系统预测未来3天你需要复习的卡片数量。建议每天保持规律复习，
                在遗忘临界点前巩固记忆效果最佳。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <p>记忆卡片 · 艾宾浩斯记忆法 · 让学习更高效</p>
      </div>
    </Layout>
  );
}
