import React, { useState, useEffect } from 'react';
import { analyticsAPI, adminAPI } from '../../services/api';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, GraduationCap, BookOpen, ClipboardList, TrendingUp, Award, Shield } from 'lucide-react';
import { format } from 'date-fns';

const SUBJECT_COLORS = ['#6366F1', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getSchoolAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading school analytics..." />;

  const { overview = {}, avgScore = 0, subjectPerformance = [], monthlyActivity = [], recentSubmissions = [] } = analytics || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">School Overview</h1>
        <p className="text-slate-500 mt-1">System-wide analytics and performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={overview.studentCount || 0} icon={GraduationCap} color="primary" />
        <StatCard title="Total Teachers" value={overview.teacherCount || 0} icon={Users} color="emerald" />
        <StatCard title="Active Classes" value={overview.classCount || 0} icon={BookOpen} color="cyan" />
        <StatCard title="School Avg Score" value={`${avgScore}%`} icon={Award}
          color={avgScore >= 65 ? 'emerald' : 'amber'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Quizzes" value={overview.quizCount || 0} icon={ClipboardList} color="violet" />
        <StatCard title="Total Submissions" value={overview.submissionCount || 0} icon={TrendingUp} color="primary" />
        <StatCard title="Admins" value={overview.admins || 0} icon={Shield} color="rose" />
        <StatCard title="Total Users" value={overview.userCount || 0} icon={Users} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly activity */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Activity Trend</h2>
          <p className="text-slate-400 text-xs mb-4">Submissions and average score over time</p>
          {monthlyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="submissions" stroke="#6366F1" strokeWidth={2.5} name="Submissions" dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#10B981" strokeWidth={2.5} name="Avg Score %" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No activity data yet</div>
          )}
        </div>

        {/* Subject performance */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Performance by Subject</h2>
          <p className="text-slate-400 text-xs mb-4">Average score across all subjects</p>
          {subjectPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={subjectPerformance} dataKey="avgScore" nameKey="subject" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {subjectPerformance.map((entry, idx) => <Cell key={idx} fill={SUBJECT_COLORS[idx % SUBJECT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No subject data yet</div>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {subjectPerformance.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                {s.subject} ({s.avgScore}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Recent Quiz Activity</h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No activity yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Student</th>
                  <th className="table-th">Quiz</th>
                  <th className="table-th">Subject</th>
                  <th className="table-th">Score</th>
                  <th className="table-th">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSubmissions.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-td font-medium text-slate-900">{sub.student?.name}</td>
                    <td className="table-td text-slate-500">{sub.quiz?.title}</td>
                    <td className="table-td"><span className="badge bg-slate-100 text-slate-600">{sub.quiz?.subject}</span></td>
                    <td className="table-td">
                      <span className={`badge font-bold ${
                        sub.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        sub.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{sub.percentage}%</span>
                    </td>
                    <td className="table-td text-slate-400">{format(new Date(sub.submittedAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}