import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '@tribhuvan/shared';
import { 
  LayoutDashboard, Calendar, ClipboardCheck, Megaphone, User, 
  BookOpen, Clock, GraduationCap, Users, Book, LogOut, ShieldCheck, X
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Timetable', path: '/student/timetable', icon: Calendar },
    { label: 'Attendance', path: '/student/attendance', icon: ClipboardCheck },
    { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { label: 'Profile', path: '/student/profile', icon: User },
  ],
  TEACHER: [
    { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { label: 'My Classes', path: '/teacher/classes', icon: BookOpen },
    { label: 'Mark Attendance', path: '/teacher/attendance', icon: ClipboardCheck },
    { label: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
    { label: 'Profile', path: '/teacher/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Approvals', path: '/admin/approvals', icon: Clock },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Teachers', path: '/admin/teachers', icon: Users },
    { label: 'Programs', path: '/admin/programs', icon: BookOpen },
    { label: 'Subjects', path: '/admin/subjects', icon: Book },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Timetable', path: '/admin/timetable', icon: Calendar },
    { label: 'Audit Logs', path: '/admin/audit', icon: ShieldCheck },
    { label: 'Profile', path: '/admin/profile', icon: User },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role || 'STUDENT') as Role;
  const items = navItems[role] || [];

  const handleSignOut = async () => {
    if (onClose) onClose();
    await signOut();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/college.png" alt="Logo" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-sm font-bold text-brand-text">Tribhuvan</h1>
            <p className="text-xs text-brand-muted">College Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${role.toLowerCase()}`}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="text-base text-brand-muted group-hover:text-gold transition-colors">
              <item.icon size={18} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Redesigned Sign Out section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-3">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gold/30"
            />
          ) : (
            <div className="w-9 h-9 bg-navy text-gold font-bold text-sm rounded-full flex items-center justify-center shadow-xs">
              {user?.name?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-text truncate">{user?.name}</p>
            <p className="text-xs text-brand-muted truncate capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold tracking-wide uppercase text-slate-700 bg-white hover:bg-slate-100 hover:text-navy border border-slate-200/80 hover:border-gold/40 rounded-lg shadow-2xs transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut size={15} className="text-brand-muted group-hover:text-gold transition-colors" />
            <span>Sign Out</span>
          </span>
          <span className="text-xs text-brand-muted group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-gray-100 flex-col z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay & Smooth Slide-in / Slide-out Panel */}
      <div
        className={`fixed inset-0 z-50 md:hidden flex transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-navy/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        {/* Drawer Content Panel */}
        <div
          className={`relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 transform transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {navContent}
        </div>
      </div>
    </>
  );
}
