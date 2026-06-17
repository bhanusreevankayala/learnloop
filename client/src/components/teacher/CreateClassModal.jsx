import React, { useState } from 'react';
import { classAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];

export default function CreateClassModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', grade: '', subject: '', schedule: '', coverColor: COLORS[0] });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await classAPI.create(form);
      toast.success(`Class created! Join code: ${data.class.joinCode}`);
      onCreated?.(data.class);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900 font-display">Create New Class</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Class Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Mathematics - Grade 10" className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input value={form.subject} onChange={set('subject')} placeholder="Mathematics" className="input" required />
            </div>
            <div>
              <label className="label">Grade</label>
              <input value={form.grade} onChange={set('grade')} placeholder="10th" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Brief description of the class"
              className="input resize-none" rows={2} />
          </div>
          <div>
            <label className="label">Schedule</label>
            <input value={form.schedule} onChange={set('schedule')} placeholder="Mon, Wed, Fri - 9:00 AM" className="input" />
          </div>
          <div>
            <label className="label">Cover Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, coverColor: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.coverColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  );
}