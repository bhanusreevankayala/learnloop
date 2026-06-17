import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Search, BookOpen, Users, Hash } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getClasses()
      .then(({ data }) => setClasses(data.classes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="lg" text="Loading classes..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">All Classes</h1>
        <p className="text-slate-500 mt-1">{classes.length} classes across the school</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by class, teacher, or subject..." className="input pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No classes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(cls => (
            <div key={cls._id} className="card-hover overflow-hidden">
              <div className="h-20 relative" style={{ backgroundColor: cls.coverColor || '#6366F1' }}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="text-white font-bold font-display text-sm truncate max-w-[200px]">{cls.name}</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {cls.subject}</span>
                  <span>·</span>
                  <span>{cls.grade}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users size={11} /> {cls.students?.length || 0} students
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-400">Teacher: <strong className="text-slate-600">{cls.teacher?.name}</strong></span>
                  <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                    <Hash size={10} /> {cls.joinCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}