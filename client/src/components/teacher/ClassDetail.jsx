import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { classAPI, analyticsAPI, notificationAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Trophy, AlertTriangle, Hash, Copy, ArrowLeft, Megaphone,
  X, TrendingUp, TrendingDown, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClassDetail() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnnounce, setShowAnnounce] = useState(false);

  useEffect(() => {
    Promise.all([classAPI.get(id), analyticsAPI.getClassAnalytics(id)])
      .then(([cRes, aRes]) => {
        setCls(cRes.data.class);
        setAnalytics(aRes.data.analytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const copyCode = () => {
    navigator.clipboard.writeText(cls.joinCode);
    toast.success('Join code copied!');
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading class details..." />;
  if (!cls) return <div className="text-center py-12 text-slate-500">Class not found</div>;

  const { studentsNeedingAttention = [], topPerformers = [], topicPerformance = [], classAvgScore = 0, totalSubmissions = 0, totalQuizzes = 0 } = analytics || {};

  const topicChartData = topicPerformance.map(t => ({
    topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '…' : t.topic,
    score: t.avgScore,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/teacher/classes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to classes
      </Link>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="h-28 relative" style={{ backgroundColor: cls.coverColor }}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-white text-2xl font-bold font-display">{cls.name}</h1>
            <p className="text-white/80 text-sm">{cls.subject} · {cls.grade}</p>
          </div>
        </div>
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={copyCode} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors">
            <Hash size={14} className="text-slate-400" />
            <span className="font-mono font-semibold text-slate-700">{cls.joinCode}</span>
            <Copy size={13} className="text-slate-400" />
          </button>
          <button onClick={() => setShowAnnounce(true)} className="btn-primary">
            <Megaphone size={16} /> Send Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Students" value={cls.students?.length || 0} icon={Users} color="primary" />
        <StatCard title="Class Average" value={`${classAvgScore}%`} icon={Trophy}
          color={classAvgScore >= 70 ? 'emerald' : classAvgScore >= 50 ? 'amber' : 'rose'} />
        <StatCard title="Quizzes Given" value={totalQuizzes} icon={TrendingUp} color="cyan" />
        <StatCard title="Need Attention" value={studentsNeedingAttention.length} icon={AlertTriangle}
          color={studentsNeedingAttention.length === 0 ? 'emerald' : 'rose'} />
      </div>

      {/* Topic performance */}
      {topicChartData.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-1">Topic-wise Class Performance</h2>
          <p className="text-slate-400 text-xs mb-4">Average score per topic across the class</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => [`${v}%`, 'Avg Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students needing attention */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="section-title">Needs Attention</h2>
          </div>
          {studentsNeedingAttention.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">All students are doing well! 🎉</p>
          ) : (
            <div className="space-y-3">
              {studentsNeedingAttention.map((sp, i) => (
                <Link key={i} to={`/teacher/students/${sp.student._id}/progress`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                  <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">
                    {sp.student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{sp.student.name}</p>
                    <p className="text-xs text-slate-400">Weak: {sp.weakTopics.slice(0, 2).join(', ') || 'Multiple topics'}</p>
                  </div>
                  <span className="badge bg-red-100 text-red-600 font-bold flex-shrink-0">{sp.avgScore}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-amber-500" />
            <h2 className="section-title">Top Performers</h2>
          </div>
          {topPerformers.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((sp, i) => (
                <Link key={i} to={`/teacher/students/${sp.student._id}/progress`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : sp.student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{sp.student.name}</p>
                    <p className="text-xs text-slate-400">{sp.quizzesTaken} quizzes taken</p>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-700 font-bold flex-shrink-0">{sp.avgScore}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All students */}
      <div className="card p-6">
        <h2 className="section-title mb-4">All Students ({cls.students?.length || 0})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th">Student</th>
                <th className="table-th">Email</th>
                <th className="table-th">Grade</th>
                <th className="table-th">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cls.students?.map(student => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="table-td">
                    <Link to={`/teacher/students/${student._id}/progress`} className="flex items-center gap-2 font-medium text-slate-900 hover:text-primary-600">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                        {student.name.charAt(0)}
                      </div>
                      {student.name}
                    </Link>
                  </td>
                  <td className="table-td text-slate-500">{student.email}</td>
                  <td className="table-td">{student.grade || '-'}</td>
                  <td className="table-td">
                    <span className={`badge ${
                      student.averageScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      student.averageScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{student.averageScore || 0}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAnnounce && (
        <AnnouncementModal classId={id} onClose={() => setShowAnnounce(false)} />
      )}
    </div>
  );
}

function AnnouncementModal({ classId, onClose }) {
  const [form, setForm] = useState({ title: '', message: '', priority: 'medium' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await notificationAPI.sendAnnouncement({ ...form, classId });
      toast.success(data.message);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
            <Megaphone size={18} className="text-primary-600" /> Send Announcement
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="input" placeholder="e.g. Quiz reminder" required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="input resize-none" rows={3} placeholder="Type your announcement..." required />
          </div>
          <div>
            <label className="label">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                  className={`py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    form.priority === p ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send to All Students'}
          </button>
        </form>
      </div>
    </div>
  );
}