import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI, submissionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Clock, CheckCircle, AlertCircle, BookOpen, ArrowRight, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Start Quiz', color: 'btn-primary', icon: ArrowRight },
  attempted: { label: 'Attempted', color: 'badge bg-blue-100 text-blue-700', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'badge bg-red-100 text-red-700', icon: AlertCircle },
};

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([quizAPI.getAll(), submissionAPI.getMy()])
      .then(([qRes, sRes]) => {
        setQuizzes(qRes.data.quizzes || []);
        setSubmissions(sRes.data.submissions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getQuizStatus = (quiz) => {
    const sub = submissions.find(s => s.quiz?._id === quiz._id);
    if (sub) return { status: 'attempted', submission: sub };
    if (quiz.dueDate && new Date(quiz.dueDate) < new Date()) return { status: 'overdue' };
    return { status: 'pending' };
  };

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'pending') return matchSearch && getQuizStatus(q).status === 'pending';
    if (filter === 'attempted') return matchSearch && getQuizStatus(q).status === 'attempted';
    return matchSearch;
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading quizzes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Quizzes</h1>
        <p className="text-slate-500 mt-1">All available quizzes from your classes</p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quizzes..."
            className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'attempted'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No quizzes found</p>
          <p className="text-slate-400 text-sm mt-1">
            {quizzes.length === 0 ? 'Enroll in a class to see quizzes' : 'Try changing your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(quiz => {
            const { status, submission } = getQuizStatus(quiz);
            const isPast = quiz.dueDate && new Date(quiz.dueDate) < new Date();
            return (
              <div key={quiz._id} className="card-hover p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: quiz.class?.coverColor || '#6366F1' }}>
                    {quiz.subject?.[0] || 'Q'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{quiz.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{quiz.class?.name}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    status === 'attempted' ? 'bg-blue-50 text-blue-600' :
                    status === 'overdue' ? 'bg-red-50 text-red-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {status === 'attempted' ? '✓ Done' : status === 'overdue' ? 'Overdue' : 'New'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {quiz.questions?.length} questions</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {quiz.timeLimit} min</span>
                  {quiz.dueDate && (
                    <span className={`flex items-center gap-1 ${isPast ? 'text-red-400' : ''}`}>
                      Due: {format(new Date(quiz.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>

                {submission ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-sm font-bold ${
                        submission.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        submission.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>{submission.percentage}%</span>
                      <span className="text-xs text-slate-400">{submission.passed ? '✓ Passed' : '✗ Failed'}</span>
                    </div>
                    <Link to={`/student/quiz/${quiz._id}/result/${submission._id}`}
                      className="btn-secondary text-xs py-1.5 px-3">
                      View Result
                    </Link>
                  </div>
                ) : (
                  <Link to={`/student/quiz/${quiz._id}`}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isPast
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}>
                    {isPast ? 'Quiz Closed' : <><ArrowRight size={14} /> Start Quiz</>}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}