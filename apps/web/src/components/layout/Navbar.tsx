import { useAuth } from '../../hooks/useAuth';
import { Hand, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
}

export function Navbar({ onOpenMobileSidebar }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 text-brand-text hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <img src="/college.png" alt="Logo" className="w-8 h-8 object-contain md:hidden" />
          <h2 className="text-sm sm:text-lg font-semibold text-brand-text truncate">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} <Hand size={18} className="inline-block mb-1 text-gold ml-1 animate-bounce" />
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-brand-muted hover:text-navy rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
          </button>

          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gold/20"
            />
          ) : (
            <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center">
              <span className="text-gold font-semibold text-xs">
                {user?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
