import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Plus, ClipboardList, Clock, Users, BarChart3, Send, Lock, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge = {
  draft: 'bg-slate-100 text-slate-500',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-red-100 text-red-600',
};

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchQuizzes = () => {
    quizAPI.getAll()
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const handlePublish = async (id) => {
    try {
      await quizAPI.publish(id);
      toast.success('Quiz published! Students have been notified.');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to publish quiz');
    }
  };

  const handleClose = async (id) => {
    try {
      await quizAPI.close(id);
      toast.success('Quiz closed');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to close quiz');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz permanently?')) return;
    try {
      await quizAPI.delete(id);
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  const filtered = filter === 'all' ? quizzes : quizzes.filter(q => q.status === filter);

  if (loading) return <LoadingSpinner size="lg" text="Loading quizzes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Quizzes</h1>
          <p className="text-slate-500 mt-1">Create and manage quizzes for your classes</p>
        </div>
        <Link to="/teacher/quizzes/create" className="btn-primary self-start">
          <Plus size={16} /> Create Quiz
        </Link>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'active', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No quizzes found</p>
          <Link to="/teacher/quizzes/create" className="btn-primary mx-auto mt-4 inline-flex">
            <Plus size={16} /> Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(quiz => (
            <div key={quiz._id} className="card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{quiz.class?.name}</p>
                </div>
                <span className={`badge flex-shrink-0 capitalize ${statusBadge[quiz.status]}`}>{quiz.status}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><ClipboardList size={12} /> {quiz.questions?.length} Qs</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimit}min</span>
                <span className="flex items-center gap-1"><Users size={12} /> {quiz.submissions?.length || 0} submissions</span>
              </div>

              <div className="flex gap-2">
                {quiz.status === 'draft' && (
                  <button onClick={() => handlePublish(quiz._id)} className="btn-primary flex-1 text-xs py-2">
                    <Send size={13} /> Publish
                  </button>
                )}
                {quiz.status === 'active' && (
                  <>
                    <Link to={`/teacher/quizzes/${quiz._id}/analytics`} className="btn-secondary flex-1 text-xs py-2">
                      <BarChart3 size={13} /> Analytics
                    </Link>
                    <button onClick={() => handleClose(quiz._id)} className="btn-secondary text-xs py-2 px-3">
                      <Lock size={13} />
                    </button>
                  </>
                )}
                {quiz.status === 'closed' && (
                  <Link to={`/teacher/quizzes/${quiz._id}/analytics`} className="btn-secondary flex-1 text-xs py-2">
                    <BarChart3 size={13} /> View Results
                  </Link>
                )}
                <button onClick={() => handleDelete(quiz._id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}