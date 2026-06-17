import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classAPI, quizAPI } from '../../services/api';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Users, BookOpen, ClipboardList, AlertTriangle, Plus,
  ArrowRight, TrendingUp, Award, Megaphone
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([classAPI.getAll(), quizAPI.getAll()])
      .then(([cRes, qRes]) => {
        setClasses(cRes.data.classes || []);
        setQuizzes(qRes.data.quizzes || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const totalStudents = new Set(classes.flatMap(c => c.students?.map(s => s._id) || [])).size;
  const activeQuizzes = quizzes.filter(q => q.status === 'active').length;
  const draftQuizzes = quizzes.filter(q => q.status === 'draft').length;

  const classChartData = classes.map(c => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    students: c.students?.length || 0,
    color: c.coverColor,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 👩‍🏫</h1>
          <p className="text-slate-500 mt-1">Here's an overview of your classes and student progress</p>
        </div>
        <div className="flex gap-2">
          <Link to="/teacher/classes" className="btn-secondary"><Plus size={16} /> New Class</Link>
          <Link to="/teacher/quizzes/create" className="btn-primary"><Plus size={16} /> New Quiz</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Classes" value={classes.length} icon={BookOpen} color="primary" subtitle="Active classes" />
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="emerald" subtitle="Across all classes" />
        <StatCard title="Active Quizzes" value={activeQuizzes} icon={ClipboardList} color="cyan" subtitle={`${draftQuizzes} drafts`} />
        <StatCard title="Total Quizzes" value={quizzes.length} icon={Award} color="violet" subtitle="Created so far" />
      </div>

      {/* Class enrollment chart */}
      <div className="card p-6">
        <h2 className="section-title mb-1">Class Enrollment</h2>
        <p className="text-slate-400 text-xs mb-4">Number of students per class</p>
        {classChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
              <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                {classChartData.map((entry, idx) => <Cell key={idx} fill={entry.color || '#6366F1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400">
            <Link to="/teacher/classes" className="text-primary-600 hover:underline">Create your first class</Link>
          </div>
        )}
      </div>

      {/* Classes grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">My Classes</h2>
          <Link to="/teacher/classes" className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {classes.length === 0 ? (
          <div className="card p-12 text-center">
            <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No classes yet</p>
            <Link to="/teacher/classes" className="btn-primary mx-auto mt-4 inline-flex">
              <Plus size={16} /> Create Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.slice(0, 6).map(cls => (
              <Link key={cls._id} to={`/teacher/classes/${cls._id}`} className="card-hover overflow-hidden group">
                <div className="h-20 relative" style={{ backgroundColor: cls.coverColor }}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-white font-bold font-display text-sm">{cls.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{cls.students?.length || 0} students · {cls.subject}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}