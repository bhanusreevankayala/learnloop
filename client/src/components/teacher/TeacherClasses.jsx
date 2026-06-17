import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateClassModal from './CreateClassModal';
import { Plus, Users, BookOpen, Hash, Copy, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchClasses = () => {
    classAPI.getAll()
      .then(({ data }) => setClasses(data.classes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading classes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Classes</h1>
          <p className="text-slate-500 mt-1">Manage your classes and students</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary self-start">
          <Plus size={16} /> Create Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No classes yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Create your first class to start teaching</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto">
            <Plus size={16} /> Create Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <div key={cls._id} className="card-hover overflow-hidden">
              <div className="h-24 relative" style={{ backgroundColor: cls.coverColor }}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold font-display truncate">{cls.name}</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">{cls.description || 'No description'}</p>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users size={12} /> {cls.students?.length || 0} students</span>
                  <span>·</span>
                  <span>{cls.grade}</span>
                </div>

                <button onClick={() => copyCode(cls.joinCode)}
                  className="flex items-center justify-between w-full bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2 text-xs transition-colors">
                  <span className="flex items-center gap-1.5 text-slate-500"><Hash size={12} /> Join Code</span>
                  <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                    {cls.joinCode} <Copy size={11} />
                  </span>
                </button>

                <Link to={`/teacher/classes/${cls._id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors">
                  Manage Class <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClassModal onClose={() => setShowCreate(false)} onCreated={fetchClasses} />
      )}
    </div>
  );
}