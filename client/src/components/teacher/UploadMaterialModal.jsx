import React, { useState, useEffect } from 'react';
import { classAPI, materialAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadMaterialModal({ onClose, onCreated }) {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', classId: '', subject: '', topic: '',
    type: 'notes', content: '', dueDate: '', tags: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    classAPI.getAll().then(({ data }) => setClasses(data.classes || [])).catch(console.error);
  }, []);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const { data } = await materialAPI.create(payload);
      toast.success('Material uploaded! Students have been notified.');
      onCreated?.(data.material);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 font-display">Upload Study Material</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input value={form.title} onChange={set('title')} className="input" placeholder="e.g. Algebra Basics - Study Notes" required />
          </div>
          <div>
            <label className="label">Class</label>
            <select value={form.classId} onChange={(e) => {
              set('classId')(e);
              const cls = classes.find(c => c._id === e.target.value);
              if (cls) setForm(p => ({ ...p, subject: cls.subject }));
            }} className="input" required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input value={form.subject} onChange={set('subject')} className="input" required />
            </div>
            <div>
              <label className="label">Topic</label>
              <input value={form.topic} onChange={set('topic')} className="input" placeholder="e.g. Algebra" />
            </div>
          </div>
          <div>
            <label className="label">Type</label>
            <select value={form.type} onChange={set('type')} className="input">
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={2} />
          </div>
          <div>
            <label className="label">{form.type === 'link' ? 'URL' : 'Content'}</label>
            <textarea value={form.content} onChange={set('content')} className="input resize-none" rows={4}
              placeholder={form.type === 'link' ? 'https://...' : 'Write notes content here (Markdown supported)...'} />
          </div>
          {form.type === 'assignment' && (
            <div>
              <label className="label">Due Date</label>
              <input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} className="input" />
            </div>
          )}
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input value={form.tags} onChange={set('tags')} className="input" placeholder="algebra, equations" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Uploading...' : 'Upload & Notify Students'}
          </button>
        </form>
      </div>
    </div>
  );
}