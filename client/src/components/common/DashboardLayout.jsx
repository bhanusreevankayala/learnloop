import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart3, FileText,
  Bell, User, LogOut, Menu, X, GraduationCap, Users, Settings,
  ChevronRight, BookMarked, Shield
} from 'lucide-react';

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/classes', icon: BookMarked, label: 'My Classes' },
  { to: '/student/quizzes', icon: ClipboardList, label: 'Quizzes' },
  { to: '/student/analytics', icon: BarChart3, label: 'My Progress' },
  { to: '/student/materials', icon: FileText, label: 'Study Materials' },
];

const teacherNav = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/classes', icon: BookMarked, label: 'My Classes' },
  { to: '/teacher/quizzes', icon: ClipboardList, label: 'Quizzes' },
  { to: '/teacher/materials', icon: FileText, label: 'Materials' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/classes', icon: BookMarked, label: 'Classes' },
];

const roleIcons = { student: GraduationCap, teacher: BookOpen, admin: Shield };
const roleBadgeColors = {
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-emerald-100 text-emerald-700',
  admin: 'bg-violet-100 text-violet-700',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = { student: studentNav, teacher: teacherNav, admin: adminNav }[user?.role] || [];
  const RoleIcon = roleIcons[user?.role] || GraduationCap;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationAPI.getAll();
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4 overflow-y-auto' : 'p-5'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-1">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-slate-900 text-base leading-tight">LearnLoop</h1>
          <p className="text-xs text-slate-400">No Student Left Behind</p>
        </div>
      </div>

      {/* User card */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-primary-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
            <span className={`badge text-xs ${roleBadgeColors[user?.role]}`}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-slate-100 pt-4 space-y-1 mt-auto">
        <NavLink
          to={`/${user?.role}/notifications`}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} relative`}
        >
          <Bell size={18} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to={`/${user?.role}/profile`}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <User size={18} />
          <span>Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-5">
              <span className="font-display font-bold text-slate-900">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            {/* FIXED: mobile sidebar scroll */}
            <div className="h-full overflow-y-auto">
              <Sidebar mobile />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900">LearnLoop</span>
          </div>

          <NavLink to={`/${user?.role}/notifications`} className="relative p-2">
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}