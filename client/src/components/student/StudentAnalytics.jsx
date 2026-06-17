import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, Legend
} from 'recharts';
import { Trophy, Target, CheckCircle, BookOpen, AlertTriangle, TrendingUp, Star, Lightbulb } from 'lucide-react';

const RECOMMENDATIONS = {
  'Algebra': 'Practice factoring and equation solving daily. Try Khan Academy Algebra.',
  'Geometry': 'Draw diagrams for each problem. Review theorems and postulates.',
  'Calculus': 'Focus on limits before derivatives. Practice 10 problems daily.',
  'Quadratic': 'Master the quadratic formula. Practice completing the square.',
  'Trigonometry': 'Memorize SOH-CAH-TOA. Draw unit circles.',
  'Newton Laws': 'Draw free-body diagrams for every problem.',
  'Kinematics': 'Memorize the kinematic equations and apply them to scenarios.',
  'Functions': 'Practice function notation and transformations.',
  'default': 'Practice this topic daily. Review your class notes and textbook examples.',
};

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getStudentAnalytics()
      .then(r => setAnalytics(r.data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Analyzing your performance..." />;

  const {
    totalQuizzes = 0, avgScore = 0, passRate = 0,
    weakTopics = [], strongTopics = [], topicAnalysis = [],
    progressTrend = [], subjectPerformance = [],
  } = analytics || {};

  const radarData = subjectPerformance.map(s => ({
    subject: s.subject.length > 10 ? s.subject.slice(0, 10) + '…' : s.subject,
    score: s.avgScore,
    fullMark: 100,
  }));

  const barData = topicAnalysis.map(t => ({
    topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '…' : t.topic,
    score: t.percentage,
    full: t.topic,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Learning Analytics</h1>
        <p className="text-slate-500 mt-1">Deep-dive into your performance and identify gaps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score" value={`${avgScore}%`} icon={Trophy}
          color={avgScore >= 70 ? 'emerald' : avgScore >= 50 ? 'amber' : 'rose'} subtitle="Overall average" />
        <StatCard title="Quizzes Taken" value={totalQuizzes} icon={BookOpen} color="primary" subtitle="Total attempts" />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle}
          color={passRate >= 60 ? 'emerald' : 'amber'} subtitle="Quizzes passed" />
        <StatCard title="Strong Topics" value={strongTopics.length} icon={Star} color="emerald" subtitle="Scoring ≥80%" />
      </div>

      {/* Progress trend */}
      <div className="card p-6">
        <h2 className="section-title mb-1">Score Progress Over Time</h2>
        <p className="text-slate-400 text-xs mb-4">Your score trajectory across recent quizzes</p>
        {progressTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={progressTrend}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="quiz" tick={{ fontSize: 11 }} tickLine={false}
                tickFormatter={v => v?.length > 10 ? v.slice(0, 10) + '…' : v} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Score']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5}
                fill="url(#pg)" dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">No data yet — take quizzes to see trends</div>
        )}
      </div>

      {/* Topic performance bar + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-1">Topic-wise Performance</h2>
          <p className="text-slate-400 text-xs mb-4">Score by topic across all quizzes</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(v, _, props) => [`${v}%`, props.payload.full]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}
                  fill="#6366F1"
                  label={{ position: 'right', fontSize: 10, fill: '#64748B', formatter: v => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No topic data yet</div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-1">Subject Radar</h2>
          <p className="text-slate-400 text-xs mb-4">Balanced view across all subjects</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip formatter={v => [`${v}%`, 'Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No subject data yet</div>
          )}
        </div>
      </div>

      {/* Weak topics with recommendations */}
      {weakTopics.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="section-title">Weak Areas & Recommendations</h2>
              <p className="text-slate-400 text-xs">Topics scoring below 60% — personalized tips to improve</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakTopics.map((topic, i) => (
              <div key={i} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 text-sm">{topic.topic}</span>
                  <span className="badge bg-amber-100 text-amber-700 font-bold">{topic.percentage}%</span>
                </div>
                <div className="progress-bar mb-3">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${topic.percentage}%`, background: '#F59E0B' }} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{topic.correct}/{topic.total} correct ({topic.attempts} attempts)</p>
                <div className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-amber-100">
                  <Lightbulb size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {RECOMMENDATIONS[topic.topic] || RECOMMENDATIONS['default']}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strong topics */}
      {strongTopics.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Star size={16} className="text-emerald-600" />
            </div>
            <h2 className="section-title">Strong Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {strongTopics.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                <CheckCircle size={13} className="text-emerald-500" />
                <span className="text-sm font-medium text-emerald-800">{t.topic}</span>
                <span className="text-xs text-emerald-600 font-bold">{t.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}