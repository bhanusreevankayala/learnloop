import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Phone, GraduationCap, BookOpen, Lock, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const roleConfig = {
  student: { color: 'bg-blue-100 text-blue-700', icon: GraduationCap },
  teacher: { color: 'bg-emerald-100 text-emerald-700', icon: BookOpen },
  admin: { color: 'bg-violet-100 text-violet-700', icon: Shield },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', grade: user?.grade || '',
    subjects: user?.subjects?.join(', ') || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const RoleIcon = roleConfig[user?.role]?.icon || User;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (user.role === 'teacher') payload.subjects = form.subjects.split(',').map(s => s.trim()).filter(Boolean);
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile header */}
      <div className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className={`badge gap-1 mt-1.5 capitalize ${roleConfig[user?.role]?.color}`}>
            <RoleIcon size={11} /> {user?.role}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input pl-9" />
            </div>
          </div>
          <div>
            <label className="label">Email (cannot be changed)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={user?.email} disabled className="input pl-9 bg-slate-50 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input pl-9" placeholder="+1-555-0100" />
            </div>
          </div>
          {user?.role === 'student' && (
            <div>
              <label className="label">Grade</label>
              <input value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} className="input" placeholder="10th" />
            </div>
          )}
          {user?.role === 'teacher' && (
            <div>
              <label className="label">Subjects (comma-separated)</label>
              <input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))} className="input" placeholder="Mathematics, Physics" />
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password change */}
      <div className="card p-6">
        <h2 className="section-title mb-4 flex items-center gap-2"><Lock size={16} /> Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} className="input" required minLength={6} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input" required minLength={6} />
            </div>
          </div>
          <button type="submit" disabled={changingPwd} className="btn-secondary">
            {changingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}