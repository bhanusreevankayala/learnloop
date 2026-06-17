import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Search, Users, GraduationCap, BookOpen, Shield, Ban, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const roleConfig = {
  student: { icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
  teacher: { icon: BookOpen, color: 'bg-emerald-100 text-emerald-700' },
  admin: { icon: Shield, color: 'bg-violet-100 text-violet-700' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then(({ data }) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (id, isActive) => {
    try {
      await adminAPI.updateUserStatus(id, !isActive);
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <LoadingSpinner size="lg" text="Loading users..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="text-slate-500 mt-1">{users.length} total users across the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'student', 'teacher', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                roleFilter === r ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Avg Score</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(user => {
                const RoleIcon = roleConfig[user.role]?.icon || Users;
                return (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge gap-1 capitalize ${roleConfig[user.role]?.color}`}>
                        <RoleIcon size={11} /> {user.role}
                      </span>
                    </td>
                    <td className="table-td">
                      {user.role === 'student' ? (
                        <span className={`badge ${user.averageScore >= 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {user.averageScore || 0}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="table-td">
                      <span className={`badge ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(user._id, user.isActive)}
                          className={`p-1.5 rounded-lg ${user.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}>
                          {user.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">No users found</div>
        )}
      </div>
    </div>
  );
}