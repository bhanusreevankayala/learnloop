import React, { useState, useEffect } from 'react';
import { materialAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import MaterialCard from '../common/MaterialCard';
import MaterialViewerModal from '../common/MaterialViewerModal';
import { FileText, Search } from 'lucide-react';

const TYPES = ['all', 'notes', 'pdf', 'assignment', 'video', 'link'];

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    materialAPI.getAll()
      .then(({ data }) => setMaterials(data.materials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.topic?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading study materials..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Study Materials</h1>
        <p className="text-slate-500 mt-1">Notes, assignments, and resources from your teachers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
            className="input pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                typeFilter === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No materials found</p>
          <p className="text-slate-400 text-sm mt-1">
            {materials.length === 0 ? 'Your teachers haven\'t uploaded any materials yet' : 'Try different search terms'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(m => (
            <MaterialCard key={m._id} material={m} onView={setSelected} />
          ))}
        </div>
      )}

      <MaterialViewerModal material={selected} onClose={() => setSelected(null)} />
    </div>
  );
}