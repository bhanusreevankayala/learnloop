import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI, submissionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Users, Trophy, Target, TrendingDown, CheckCircle, XCircle } from 'lucide-react';

export default function QuizAnalytics() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([quizAPI.get(id), submissionAPI.getByQuiz(id)])
      .then(([qRes, sRes]) => {
        setQuiz(qRes.data.quiz);
        setSubmissions(sRes.data.submissions || []);
        setStats(sRes.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" text="Loading analytics..." />;
  if (!quiz) return <div className="text-center py-12 text-slate-500">Quiz not found</div>;

  // Topic-wise analysis across all submissions
  const topicMap = {};
  submissions.forEach(sub => {
    sub.topicScores?.forEach(ts => {
      if (!topicMap[ts.topic]) topicMap[ts.topic] = { correct: 0, total: 0 };
      topicMap[ts.topic].correct += ts.correct;
      topicMap[ts.topic].total += ts.total;
    });
  });
  const topicData = Object.entries(topicMap).map(([topic, d]) => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + '…' : topic,
    score: Math.round((d.correct / d.total) * 100),
  }));

  const scoreDistribution = [
    { name: '80-100%', value: submissions.filter(s => s.percentage >= 80).length, color: '#10B981' },
    { name: '60-79%', value: submissions.filter(s => s.percentage >= 60 && s.percentage < 80).length, color: '#3B82F6' },
    { name: '40-59%', value: submissions.filter(s => s.percentage >= 40 && s.percentage < 60).length, color: '#F59E0B' },
    { name: '0-39%', value: submissions.filter(s => s.percentage < 40).length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to quizzes
      </Link>

      <div>
        <h1 className="page-title">{quiz.title}</h1>
        <p className="text-slate-500 mt-1">{quiz.class?.name} · {quiz.subject}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Submissions" value={stats?.totalSubmissions || 0} icon={Users} color="primary" />
        <StatCard title="Avg Score" value={`${stats?.avgScore || 0}%`} icon={Trophy}
          color={stats?.avgScore >= 70 ? 'emerald' : 'amber'} />
        <StatCard title="Pass Rate" value={`${stats?.passRate || 0}%`} icon={CheckCircle}
          color={stats?.passRate >= 60 ? 'emerald' : 'rose'} />
        <StatCard title="Score Range" value={`${stats?.lowestScore || 0}-${stats?.topScore || 0}%`} icon={Target} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Score Distribution</h2>
          {scoreDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={scoreDistribution} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {scoreDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {scoreDistribution.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No submissions yet</div>
          )}
        </div>

        {/* Topic difficulty */}
        <div className="card p-6">
          <h2 className="section-title mb-1">Topic Difficulty</h2>
          <p className="text-slate-400 text-xs mb-4">Class average per topic — identify learning gaps</p>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => [`${v}%`, 'Avg Score']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {topicData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.score < 60 ? '#EF4444' : entry.score < 80 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">No topic data yet</div>
          )}
        </div>
      </div>

      {/* Student submissions table */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Student Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No submissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">Student</th>
                  <th className="table-th">Score</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Time Taken</th>
                  <th className="table-th">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {submissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                          {sub.student?.name?.charAt(0)}
                        </div>
                        {sub.student?.name}
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge font-bold ${
                        sub.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        sub.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                        sub.percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>{sub.percentage}%</span>
                    </td>
                    <td className="table-td">
                      {sub.passed ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle size={13} /> Passed</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle size={13} /> Failed</span>
                      )}
                    </td>
                    <td className="table-td text-slate-500">{Math.floor(sub.timeTaken / 60)}m {sub.timeTaken % 60}s</td>
                    <td className="table-td text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
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