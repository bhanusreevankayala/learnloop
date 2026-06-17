import React, { useState, useEffect } from 'react';
import { classAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Users, BookOpen, Hash, Plus, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchClasses = () => {
    classAPI.getAll()
      .then(({ data }) => setClasses(data.classes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      await classAPI.join(joinCode);
      toast.success('Successfully joined class!');
      setShowJoin(false);
      setJoinCode('');
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join class');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading your classes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Classes</h1>
          <p className="text-slate-500 mt-1">Classes you're enrolled in</p>
        </div>
        <button onClick={() => setShowJoin(true)} className="btn-primary self-start">
          <Plus size={16} /> Join Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No classes yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Join a class using a code from your teacher</p>
          <button onClick={() => setShowJoin(true)} className="btn-primary mx-auto">
            <Plus size={16} /> Join Your First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <div key={cls._id} className="card-hover overflow-hidden">
              <div className="h-24 relative" style={{ backgroundColor: cls.coverColor || '#6366F1' }}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold font-display truncate">{cls.name}</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-500 line-clamp-2">{cls.description || 'No description provided'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {cls.subject}</span>
                  <span>·</span>
                  <span>{cls.grade}</span>
                </div>
                {cls.schedule && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={12} /> {cls.schedule}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold">
                      {cls.teacher?.name?.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-slate-600">{cls.teacher?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Join modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 font-display">Join a Class</h3>
              <button onClick={() => setShowJoin(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="label">Class Join Code</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123" className="input pl-9 uppercase" required maxLength={6} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Ask your teacher for the class code</p>
              </div>
              <button type="submit" disabled={joining} className="btn-primary w-full">
                {joining ? 'Joining...' : 'Join Class'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}