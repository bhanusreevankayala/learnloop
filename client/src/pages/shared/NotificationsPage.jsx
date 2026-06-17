import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Bell, CheckCheck, ClipboardList, Megaphone, FileText, Award, Clock, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const typeConfig = {
  quiz: { icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
  announcement: { icon: Megaphone, color: 'bg-violet-100 text-violet-600' },
  material: { icon: FileText, color: 'bg-cyan-100 text-cyan-600' },
  grade: { icon: Award, color: 'bg-emerald-100 text-emerald-600' },
  reminder: { icon: Clock, color: 'bg-amber-100 text-amber-600' },
  system: { icon: Bell, color: 'bg-slate-100 text-slate-600' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    notificationAPI.getAll()
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading notifications..." />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-slate-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const config = typeConfig[n.type] || typeConfig.system;
            const Icon = config.icon;
            return (
              <div key={n._id} onClick={() => !n.read && markRead(n._id)}
                className={`card p-4 flex items-start gap-3 cursor-pointer transition-all ${!n.read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}