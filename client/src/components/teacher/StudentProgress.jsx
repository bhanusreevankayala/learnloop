import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ArrowLeft, Trophy, BookOpen, AlertTriangle, CheckCircle, Star } from 'lucide-react';

export default function StudentProgress() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getStudentAnalyticsById(id)
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading student progress..." />;

  const {
    totalQuizzes = 0, avgScore = 0, passRate = 0,
    weakTopics = [], strongTopics = [], topicAnalysis = [],
    progressTrend = [], recentSubmissions = [],
  } = analytics || {};

  const studentName = recentSubmissions[0]?.student?.name || 'Student';

  const topicBarData = topicAnalysis.map(t => ({
    topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '…' : t.topic,
    score: t.percentage,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back
      </Link>

      <div>
        <h1 className="page-title">Student Progress Report</h1>
        <p className="text-slate-500 mt-1">Detailed performance analysis and learning gaps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score" value={`${avgScore}%`} icon={Trophy}
          color={avgScore >= 70 ? 'emerald' : avgScore >= 50 ? 'amber' : 'rose'} />
        <StatCard title="Quizzes Taken" value={totalQuizzes} icon={BookOpen} color="primary" />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle}
          color={passRate >= 60 ? 'emerald' : 'rose'} />
        <StatCard title="Weak Topics" value={weakTopics.length} icon={AlertTriangle}
          color={weakTopics.length === 0 ? 'emerald' : 'rose'} />
      </div>

      {avgScore < 60 && totalQuizzes > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-red-900 text-sm">This student needs intervention</p>
            <p className="text-red-700 text-sm mt-0.5">
              Consistently scoring below average. Consider scheduling a one-on-one session or assigning extra practice materials.
            </p>
          </div>
        </div>
      )}

      {/* Progress trend */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Score Trend</h2>
        {progressTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={progressTrend}>
              <defs>
                <linearGradient id="spg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="quiz" tick={{ fontSize: 11 }} tickFormatter={v => v?.length > 10 ? v.slice(0, 10) + '…' : v} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5} fill="url(#spg)" dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">No quiz data yet</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic performance */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Topic Performance</h2>
          {topicBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={v => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No topic data</div>
          )}
        </div>

        {/* Weak/strong topics */}
        <div className="card p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-red-500" /> Weak Topics
            </h3>
            {weakTopics.length === 0 ? (
              <p className="text-xs text-slate-400">None — great progress!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {weakTopics.map((t, i) => (
                  <span key={i} className="badge bg-red-50 text-red-600 text-xs">{t.topic} ({t.percentage}%)</span>
                ))}
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
              <Star size={14} className="text-emerald-500" /> Strong Topics
            </h3>
            {strongTopics.length === 0 ? (
              <p className="text-xs text-slate-400">No strong topics identified yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {strongTopics.map((t, i) => (
                  <span key={i} className="badge bg-emerald-50 text-emerald-600 text-xs">{t.topic} ({t.percentage}%)</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Recent Submissions</h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No submissions yet</p>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((sub, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.passed ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{sub.quiz?.title}</p>
                  <p className="text-xs text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge font-bold ${
                  sub.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  sub.percentage >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>{sub.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}