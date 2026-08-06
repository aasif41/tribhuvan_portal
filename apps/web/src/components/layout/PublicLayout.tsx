import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export function PublicLayout() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student';
      case 'TEACHER': return '/teacher';
      case 'ADMIN': return '/admin';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/college.png" alt="Logo" className="w-12 h-12 object-contain" />
              <Link to="/" className="flex flex-col">
                <span className="text-xl font-bold text-navy leading-tight">Tribhuvan</span>
                <span className="text-xs font-medium text-brand-muted uppercase tracking-wider">College</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-slate-600 hover:text-navy font-medium transition-colors">Home</Link>
              <Link to="/about" className="text-slate-600 hover:text-navy font-medium transition-colors">About Us</Link>
              <Link to="/admissions" className="text-slate-600 hover:text-navy font-medium transition-colors">Admissions</Link>
              
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              
              {user ? (
                <Link 
                  to={getDashboardLink()}
                  className="bg-navy text-white px-5 py-2.5 rounded-lg font-medium hover:bg-navy/90 transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/login"
                    className="text-navy font-semibold hover:text-gold transition-colors"
                  >
                    Login to Portal
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-navy p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full">
            <Link to="/" className="block text-slate-600 font-medium py-2">Home</Link>
            <Link to="/about" className="block text-slate-600 font-medium py-2">About Us</Link>
            <Link to="/admissions" className="block text-slate-600 font-medium py-2">Admissions</Link>
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <Link to={getDashboardLink()} className="block w-full text-center bg-navy text-white px-4 py-3 rounded-lg font-medium">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/login" className="block w-full text-center bg-navy text-white px-4 py-3 rounded-lg font-medium">
                  Login to Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-slate-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/college.png" alt="Logo" className="w-10 h-10 object-contain bg-white/10 rounded-lg p-1" />
              <span className="text-xl font-bold text-white">Tribhuvan College</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Empowering the next generation of leaders and innovators through world-class education and research.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/admissions" className="hover:text-gold transition-colors">Admissions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Portals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-gold transition-colors">Student Portal</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Faculty Portal</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Tribhuvan College. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
