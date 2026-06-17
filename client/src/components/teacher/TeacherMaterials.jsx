import React, { useState, useEffect } from 'react';
import { materialAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import MaterialCard from '../common/MaterialCard';
import MaterialViewerModal from '../common/MaterialViewerModal';
import UploadMaterialModal from './UploadMaterialModal';
import { Plus, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchMaterials = () => {
    materialAPI.getAll()
      .then(({ data }) => setMaterials(data.materials || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try {
      await materialAPI.delete(id);
      toast.success('Material deleted');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="lg" text="Loading materials..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Study Materials</h1>
          <p className="text-slate-500 mt-1">Upload notes, assignments, and resources for your students</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary self-start">
          <Plus size={16} /> Upload Material
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..." className="input pl-9 max-w-md" />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No materials yet</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mx-auto mt-4 inline-flex">
            <Plus size={16} /> Upload Your First Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(m => (
            <MaterialCard key={m._id} material={m} onView={setSelected} onDelete={handleDelete} canDelete />
          ))}
        </div>
      )}

      <MaterialViewerModal material={selected} onClose={() => setSelected(null)} />
      {showUpload && <UploadMaterialModal onClose={() => setShowUpload(false)} onCreated={fetchMaterials} />}
    </div>
  );
}