import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden py-24 lg:py-32 flex-grow flex items-center">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full mix-blend-multiply filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-gold/20 text-gold text-sm font-semibold tracking-wider mb-6 border border-gold/30">
              EST. 2023 • NEEMRANA, RAJASTHAN
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">Tribhuvan College</span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl">
              Empowering students with world-class education, state-of-the-art facilities, and a commitment to academic excellence in the heart of Rajasthan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-gold text-navy hover:bg-yellow-400 hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Access Portal
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                to="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all duration-200"
              >
                Explore Campus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links / Portals */}
      <section className="py-20 bg-slate-50 relative -mt-10 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Portal Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Student Portal</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">Access your timetable, track attendance, view announcements, and manage your academic profile.</p>
              <Link to="/login" className="text-navy font-semibold flex items-center group-hover:text-gold transition-colors">
                Student Login <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Teacher Portal Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Faculty Portal</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">Manage your classes, mark student attendance, and access faculty-specific announcements.</p>
              <Link to="/login" className="text-navy font-semibold flex items-center group-hover:text-gold transition-colors">
                Teacher Login <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Admin Portal Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-navy mb-3">Admin Portal</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">Manage website content, approve user registrations, and oversee all college operations.</p>
              <Link to="/admin/login" className="text-navy font-semibold flex items-center group-hover:text-gold transition-colors">
                Admin Login <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-navy mb-2">50+</p>
              <p className="text-slate-500 font-medium">Expert Faculty</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-navy mb-2">1000+</p>
              <p className="text-slate-500 font-medium">Active Students</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-navy mb-2">12</p>
              <p className="text-slate-500 font-medium">Academic Programs</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-navy mb-2">100%</p>
              <p className="text-slate-500 font-medium">Placement Assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
