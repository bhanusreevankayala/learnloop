import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, quizAPI, notificationAPI } from '../../services/api';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
  Trophy, Target, BookOpen, TrendingUp, AlertTriangle,
  Clock, CheckCircle, ArrowRight, Zap, Star
} from 'lucide-react';
import { format } from 'date-fns';

const ScoreBadge = ({ score }) => {
  if (score >= 80) return <span className="badge bg-emerald-100 text-emerald-700">{score}%</span>;
  if (score >= 60) return <span className="badge bg-blue-100 text-blue-700">{score}%</span>;
  if (score >= 40) return <span className="badge bg-amber-100 text-amber-700">{score}%</span>;
  return <span className="badge bg-red-100 text-red-700">{score}%</span>;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, quizzesRes, notifRes] = await Promise.all([
          analyticsAPI.getStudentAnalytics(),
          quizAPI.getAll(),
          notificationAPI.getAll(),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setQuizzes(quizzesRes.data.quizzes?.slice(0, 5) || []);
        setNotifications(notifRes.data.notifications?.slice(0, 4) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading your dashboard..." />;

  const { totalQuizzes = 0, avgScore = 0, passRate = 0, weakTopics = [],
    progressTrend = [], subjectPerformance = [], recentSubmissions = [] } = analytics || {};

  const radarData = subjectPerformance.slice(0, 6).map(s => ({
    subject: s.subject.length > 8 ? s.subject.slice(0, 8) + '…' : s.subject,
    score: s.avgScore,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 mt-1">Here's your learning progress at a glance</p>
        </div>
        <Link to="/student/quizzes" className="btn-primary self-start">
          <Zap size={16} /> Take a Quiz
        </Link>
      </div>

      {/* Weak topics alert */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" size={18} />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Topics needing attention</p>
            <p className="text-amber-700 text-sm mt-0.5">
              You're struggling with: <strong>{weakTopics.slice(0, 3).map(t => t.topic).join(', ')}</strong>.
              Focus on these to improve your scores!
            </p>
          </div>
          <Link to="/student/analytics" className="ml-auto btn-ghost text-amber-700 hover:bg-amber-100 text-xs flex-shrink-0">
            View Analysis
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score" value={`${avgScore}%`} icon={Trophy}
          color={avgScore >= 70 ? 'emerald' : avgScore >= 50 ? 'amber' : 'rose'}
          subtitle="Across all quizzes" />
        <StatCard title="Quizzes Taken" value={totalQuizzes} icon={BookOpen}
          color="primary" subtitle="Total attempts" />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle}
          color={passRate >= 70 ? 'emerald' : 'amber'} subtitle="Quizzes passed" />
        <StatCard title="Weak Topics" value={weakTopics.length} icon={Target}
          color={weakTopics.length === 0 ? 'emerald' : 'rose'} subtitle="Need improvement" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress trend */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Score Trend</h2>
              <p className="text-slate-400 text-xs mt-0.5">Your last {progressTrend.length} quizzes</p>
            </div>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          {progressTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={progressTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="quiz" tick={{ fontSize: 11 }} tickLine={false}
                  tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2.5}
                  fill="url(#scoreGrad)" dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No quiz data yet. Take your first quiz!
            </div>
          )}
        </div>

        {/* Subject performance radar */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Subject Overview</h2>
          <p className="text-slate-400 text-xs mb-4">Performance by subject</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip formatter={(val) => [`${val}%`, 'Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              Take quizzes to see subject performance
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Quizzes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Available Quizzes</h2>
            <Link to="/student/quizzes" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No quizzes available right now</div>
          ) : (
            <div className="space-y-3">
              {quizzes.map(quiz => (
                <Link key={quiz._id} to={`/student/quiz/${quiz._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-primary-100 transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: quiz.class?.coverColor || '#6366F1' }}>
                    {quiz.subject?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{quiz.title}</p>
                    <p className="text-xs text-slate-400">{quiz.class?.name} · {quiz.questions?.length} Qs · {quiz.timeLimit}min</p>
                  </div>
                  {quiz.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock size={11} />
                      {format(new Date(quiz.dueDate), 'MMM d')}
                    </div>
                  )}
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Weak Topics */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Weak Topics</h2>
            <Link to="/student/analytics" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
              Full analysis <ArrowRight size={14} />
            </Link>
          </div>
          {weakTopics.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="text-emerald-600" size={22} />
              </div>
              <p className="font-medium text-slate-700">Great job!</p>
              <p className="text-slate-400 text-sm mt-1">No weak topics detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.slice(0, 5).map((topic, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{topic.topic}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      topic.percentage < 40 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>{topic.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${topic.percentage}%`,
                        background: topic.percentage < 40 ? '#EF4444' : '#F59E0B'
                      }} />
                  </div>
                  <p className="text-xs text-slate-400">{topic.correct}/{topic.total} correct · {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {recentSubmissions.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentSubmissions.map((sub, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.passed ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{sub.quiz?.title || 'Quiz'}</p>
                  <p className="text-xs text-slate-400">{sub.quiz?.subject} · {format(new Date(sub.submittedAt), 'MMM d, yyyy')}</p>
                </div>
                <ScoreBadge score={sub.percentage} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}