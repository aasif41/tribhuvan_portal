import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  GraduationCap,
  UserCheck,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
  Calendar,
  Building,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { COLLEGE, PROGRAMS as FALLBACK_PROGRAMS } from '@tribhuvan/shared';
import { DepartmentMultiSelect } from '../../components/ui/DepartmentMultiSelect';

type RoleType = 'STUDENT' | 'TEACHER';
type TabType = 'LOGIN' | 'SIGNUP';

const serifFont: React.CSSProperties = { fontFamily: "'Source Serif 4', 'Georgia', serif" };

// High-end Apple/Stripe-like cubic-bezier curve for silky smooth movement
const customCubicBezier = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function UnifiedAuthPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthContext();

  /* ─── Admin mode: controls which form panel is visible ─── */
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [role, setRole] = useState<RoleType>('STUDENT');
  const [activeTab, setActiveTab] = useState<TabType>('LOGIN');

  const [availablePrograms, setAvailablePrograms] = useState<{ name: string; code: string }[]>(FALLBACK_PROGRAMS);

  useEffect(() => {
    api.get('/programs')
      .then((res) => {
        if (res.data.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailablePrograms(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to static constants if offline / error
      });
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [studentLoginData, setStudentLoginData] = useState({ enrollmentNumber: '', password: '' });
  const [studentSignupData, setStudentSignupData] = useState({
    name: '', rollNo: '', program: FALLBACK_PROGRAMS[0]?.name || 'B.Tech Computer Science & Engineering',
    year: 1, semester: 1, section: 'A', dateOfBirth: '', hostel: '', email: '', enrollmentNumber: '', password: '', confirmPassword: '',
  });
  const [teacherLoginData, setTeacherLoginData] = useState({ email: '', password: '' });
  const [teacherSignupData, setTeacherSignupData] = useState({
    name: '', email: '', employeeId: '', department: 'Computer Science & Engineering',
    designation: 'Assistant Professor', phone: '', password: '', confirmPassword: '',
  });

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleRoleChange = (newRole: RoleType) => { setRole(newRole); setError(null); setSuccessMsg(null); setPendingNotice(null); };
  const handleTabChange = (newTab: TabType) => { setActiveTab(newTab); setError(null); setSuccessMsg(null); setPendingNotice(null); };
  const handleToggleAdmin = () => { setIsAdminMode(v => !v); setError(null); setSuccessMsg(null); setPendingNotice(null); setAdminError(null); };

  // ── Student handlers ──
  const handleStudentLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setPendingNotice(null);
    try { const res = await api.post('/auth/student/login', studentLoginData); const { token, user } = res.data.data; setSession(token, user); navigate('/student'); }
    catch (err: any) { setError(err.response?.data?.message || 'Login failed. Please verify your credentials.'); }
    finally { setLoading(false); }
  };

  const handleStudentSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentSignupData.password !== studentSignupData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    try { const res = await api.post('/auth/student/signup', studentSignupData); const { token, user } = res.data.data; setSession(token, user); navigate('/student'); }
    catch (err: any) { setError(err.response?.data?.message || 'Signup failed. Please check input values.'); }
    finally { setLoading(false); }
  };

  // ── Teacher handlers ──
  const handleTeacherLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setPendingNotice(null);
    try { const res = await api.post('/auth/teacher/login', teacherLoginData); const { token, user } = res.data.data; setSession(token, user); navigate('/teacher'); }
    catch (err: any) {
      const status = err.response?.status; const code = err.response?.data?.code; const msg = err.response?.data?.message;
      if (status === 403 && code === 'PENDING_APPROVAL') { setPendingNotice(msg || 'Your account is pending admin approval.'); }
      else { setError(msg || 'Login failed. Please check your credentials.'); }
    } finally { setLoading(false); }
  };

  const handleTeacherSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherSignupData.password !== teacherSignupData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError(null);
    try { const res = await api.post('/auth/teacher/signup', teacherSignupData); setSuccessMsg(res.data.message || 'Account created successfully!'); setActiveTab('LOGIN'); setPendingNotice('Your account was submitted and is pending admin approval.'); }
    catch (err: any) { setError(err.response?.data?.message || 'Signup failed. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── Admin handler ──
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAdminLoading(true); setAdminError(null);
    try { const res = await api.post('/auth/admin/login', { email: adminEmail, password: adminPassword }); const { token, user } = res.data.data; setSession(token, user); navigate('/admin'); }
    catch (err: any) { setAdminError(err.response?.data?.message || 'Invalid admin credentials'); }
    finally { setAdminLoading(false); }
  };

  /* ─── Shared CSS tokens ─── */
  const inputBase = 'w-full border bg-[#f7f5f0] border-[#d4c9b0]/50 rounded-lg px-3 py-2.5 text-[13px] text-[#1a2744] placeholder-[#9a917e] focus:outline-none focus:border-[#c8922a] focus:ring-1 focus:ring-[#c8922a]/30 transition-colors font-sans';
  const inputWithIcon = `${inputBase} pl-9`;
  const labelBase = 'block text-[11px] font-semibold tracking-[0.08em] uppercase mb-1.5';
  const labelColor = 'text-[#5a6a80]';
  const labelAccent = 'text-[#b5872a]';
  const submitBtnBase = 'w-full py-3 rounded-lg text-[13px] font-semibold tracking-[0.06em] uppercase transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-sans" style={{ background: '#e8e2d6' }}>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PANEL 1: ADMIN LOGIN FORM (cream background, left side)              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-y-0 w-full lg:w-[58%] flex flex-col z-0"
        style={{
          left: '0%',
          background: '#f0ece4',
          transition: `all 800ms ${customCubicBezier}`,
        }}
      >
        {/* Top accent stripe */}
        <div className="h-[3px] w-full flex">
          <div className="flex-1" style={{ background: '#0d1f3c' }} />
          <div className="w-24" style={{ background: '#c8922a' }} />
          <div className="flex-1" style={{ background: '#0d1f3c' }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 lg:px-14 py-10 overflow-y-auto">
          <div
            className={`w-full max-w-md transition-all duration-700 ${
              isAdminMode ? 'opacity-100 scale-100 translate-x-0 delay-200' : 'opacity-0 scale-[0.96] -translate-x-6 pointer-events-none'
            }`}
            style={{ transitionTimingFunction: customCubicBezier }}
          >
            {/* Admin form card */}
            <div className="bg-white border border-[#d4c9b0]/40 shadow-md rounded-lg overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-center py-4 border-b border-[#e8e2d6]">
                <span className="text-[12px] tracking-[0.08em] uppercase font-semibold text-[#0d1f3c]">
                  Administrator Sign In
                </span>
              </div>

              <div className="p-6 sm:p-8">
                {/* Shield icon + heading */}
                <div className="flex flex-col items-center mb-7">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ border: '1.5px solid #d4c9b0', background: '#f7f5f0' }}
                  >
                    <Shield size={24} className="text-[#0d1f3c]" strokeWidth={1.5} />
                  </div>
                  <h2 style={serifFont} className="text-xl font-semibold text-[#0d1f3c] tracking-tight mb-1">
                    Administrative Access
                  </h2>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#9a917e] font-medium">
                    Authorized Personnel Only
                  </p>
                </div>

                {/* Thin rule */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-[#d4c9b0]/40" />
                  <div className="w-1 h-1 rotate-45 border border-[#c8922a]/50" />
                  <div className="flex-1 h-px bg-[#d4c9b0]/40" />
                </div>

                {/* Admin error */}
                {adminError && (
                  <div className="mb-5 p-3.5 bg-[#fdf2f2] border-l-[3px] border-[#c04040] rounded-r-lg flex items-start gap-2.5 text-[12px] text-[#7a2020]">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#c04040]" />
                    <span className="leading-relaxed">{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
                  <div>
                    <label className={`${labelBase} ${labelColor}`}>Admin Email / Username</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} />
                      <input
                        type="text" required placeholder="admin@tribhuvancollege.ac.in"
                        value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                        className={inputWithIcon}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`${labelBase} ${labelColor}`}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} />
                      <input
                        type={adminShowPassword ? 'text' : 'password'} required placeholder="••••••••"
                        value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                        className={`${inputWithIcon} pr-9`}
                      />
                      <button type="button" onClick={() => setAdminShowPassword(!adminShowPassword)}
                        className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">
                        {adminShowPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={adminLoading}
                    className={`${submitBtnBase} mt-3 text-[#f0ece4] focus:ring-[#0d1f3c] shadow-md`}
                    style={{ background: '#0d1f3c' }}
                    onMouseEnter={(e) => { if (!adminLoading) (e.target as HTMLElement).style.background = '#1a3460'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}
                  >
                    {adminLoading ? (
                      <div className="w-4 h-4 border-2 border-[#f0ece4]/30 border-t-[#f0ece4] rounded-full animate-spin" />
                    ) : (
                      <span>Access Dashboard</span>
                    )}
                  </button>
                </form>

                <p className="text-center text-[10px] text-[#9a917e] mt-6 tracking-wide">
                  Admin accounts are provisioned internally. Self-registration is disabled.
                </p>
              </div>
            </div>

            <p className="text-center text-[10px] text-[#9a917e] mt-5 tracking-wide">
              © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PANEL 2: SLIDING BLUE IDENTITY PANEL (Floats over background)          */}
      {/* Normal: left:0%  |  Admin: left:58%                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-y-0 w-full lg:w-[42%] flex flex-col overflow-hidden z-20"
        style={{
          left: isAdminMode ? '58%' : '0%',
          background: 'linear-gradient(170deg, #0d1f3c 0%, #142d54 50%, #0d1f3c 100%)',
          boxShadow: isAdminMode
            ? '-15px 0 40px -10px rgba(0, 0, 0, 0.35), 0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            : '15px 0 40px -10px rgba(0, 0, 0, 0.35), 0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          transition: `all 800ms ${customCubicBezier}`,
        }}
      >
        {/* Crosshatch texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, #c8922a 1px, #c8922a 2px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Top fine rule */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent 5%, #c8922a40 50%, transparent 95%)' }} />

        {/* Identity content — elegant settling transition */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 py-12 lg:py-0 lg:px-12 text-center">
          {/* Monogram / College Logo seal */}
          <div className="mb-8 relative transform transition-transform duration-700">
            <div
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full flex items-center justify-center shadow-lg"
              style={{ border: '2px solid #c8922a50', background: 'radial-gradient(circle, #c8922a08 0%, transparent 70%)' }}
            >
              <div
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center overflow-hidden p-2"
                style={{ border: '1.5px solid #c8922a40', background: '#0d1f3c' }}
              >
                <img src="/college.png" alt={COLLEGE.name} className="w-full h-full object-contain filter drop-shadow-md" />
              </div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1 h-1 rounded-full bg-[#c8922a]/50" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-1 h-1 rounded-full bg-[#c8922a]/50" />
          </div>

          <h1 style={serifFont} className="text-2xl lg:text-3xl font-semibold text-[#f0ece4] tracking-tight leading-tight mb-3">
            {COLLEGE.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#c8922a]/40" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#c8922a]/50" />
            <div className="w-8 h-px bg-[#c8922a]/40" />
          </div>

          <p className="text-[11px] tracking-[0.2em] uppercase text-[#8a9bb7] font-medium mb-1">College Portal</p>
          <p style={serifFont} className="text-sm italic text-[#7a8da8] max-w-xs leading-relaxed hidden lg:block">
            Secure authentication gateway for students & faculty members
          </p>
        </div>

        {/* Bottom rail — toggle link */}
        <div className="relative z-10 px-8 py-5 flex items-center justify-between">
          <div className="h-px flex-1 bg-[#c8922a]/15" />
          <button
            type="button"
            onClick={handleToggleAdmin}
            className="flex items-center gap-2 px-4 py-1.5 text-[10px] tracking-[0.12em] uppercase text-[#8a9bb7] hover:text-[#c8922a] transition-all duration-300 font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a] group"
          >
            {isAdminMode ? (
              <>
                <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Students & Teachers</span>
              </>
            ) : (
              <>
                <span>Administrative Access</span>
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
          <div className="h-px flex-1 bg-[#c8922a]/15" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PANEL 3: STUDENT / TEACHER FORM (cream background, right side)         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-y-0 w-full lg:w-[58%] flex flex-col z-0"
        style={{
          left: '42%',
          background: '#f0ece4',
          transition: `all 800ms ${customCubicBezier}`,
        }}
      >
        {/* Top accent stripe */}
        <div className="h-[3px] w-full flex">
          <div className="flex-1" style={{ background: '#0d1f3c' }} />
          <div className="w-24" style={{ background: '#c8922a' }} />
          <div className="flex-1" style={{ background: '#0d1f3c' }} />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center px-5 sm:px-8 lg:px-12 py-8 lg:py-10 overflow-y-auto">
          <div
            className={`w-full max-w-lg transition-all duration-700 ${
              !isAdminMode ? 'opacity-100 scale-100 translate-x-0 delay-200' : 'opacity-0 scale-[0.96] translate-x-6 pointer-events-none'
            }`}
            style={{ transitionTimingFunction: customCubicBezier }}
          >

            {/* Role toggle */}
            <div className="flex mb-8 border border-[#c4b99a]/50 overflow-hidden rounded-lg">
              <button type="button" onClick={() => handleRoleChange('STUDENT')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-[12px] tracking-[0.1em] uppercase font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8922a] focus-visible:ring-inset ${role === 'STUDENT' ? 'text-[#f0ece4]' : 'text-[#7a7060] hover:text-[#0d1f3c] hover:bg-[#e8e2d6]'}`}
                style={role === 'STUDENT' ? { background: '#0d1f3c' } : { background: 'transparent' }}>
                <GraduationCap size={16} strokeWidth={1.8} /><span>Student</span>
              </button>
              <div className="w-px" style={{ background: '#c4b99a70' }} />
              <button type="button" onClick={() => handleRoleChange('TEACHER')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-[12px] tracking-[0.1em] uppercase font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8922a] focus-visible:ring-inset ${role === 'TEACHER' ? 'text-[#f0ece4]' : 'text-[#7a7060] hover:text-[#0d1f3c] hover:bg-[#e8e2d6]'}`}
                style={role === 'TEACHER' ? { background: '#0d1f3c' } : { background: 'transparent' }}>
                <UserCheck size={16} strokeWidth={1.8} /><span>Faculty</span>
              </button>
            </div>

            {/* Form card */}
            <div className="bg-white border border-[#d4c9b0]/40 shadow-md rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-[#e8e2d6]">
                <button type="button" onClick={() => handleTabChange('LOGIN')}
                  className={`flex-1 py-3.5 text-[12px] tracking-[0.08em] uppercase font-semibold transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8922a] focus-visible:ring-inset ${activeTab === 'LOGIN' ? 'text-[#0d1f3c]' : 'text-[#9a917e] hover:text-[#5a6a80]'}`}>
                  Sign In
                  {activeTab === 'LOGIN' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#c8922a]" />}
                </button>
                <div className="w-px bg-[#e8e2d6]" />
                <button type="button" onClick={() => handleTabChange('SIGNUP')}
                  className={`flex-1 py-3.5 text-[12px] tracking-[0.08em] uppercase font-semibold transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8922a] focus-visible:ring-inset ${activeTab === 'SIGNUP' ? 'text-[#0d1f3c]' : 'text-[#9a917e] hover:text-[#5a6a80]'}`}>
                  New Registration
                  {activeTab === 'SIGNUP' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#c8922a]" />}
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {/* Alerts */}
                {error && (
                  <div className="mb-5 p-3.5 bg-[#fdf2f2] border-l-[3px] border-[#c04040] rounded-r-lg flex items-start gap-2.5 text-[12px] text-[#7a2020]">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#c04040]" /><span className="leading-relaxed">{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-5 p-3.5 bg-[#f0f7f0] border-l-[3px] border-[#2d7a2d] rounded-r-lg flex items-start gap-2.5 text-[12px] text-[#2d5a2d]">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-[#2d7a2d]" /><span className="leading-relaxed">{successMsg}</span>
                  </div>
                )}
                {pendingNotice && (
                  <div className="mb-5 p-3.5 bg-[#fdf8ed] border-l-[3px] border-[#c8922a] rounded-r-lg flex items-start gap-2.5 text-[12px] text-[#6a5420]">
                    <ShieldAlert size={15} className="shrink-0 mt-0.5 text-[#c8922a]" />
                    <div><p className="font-semibold text-[#5a4818] mb-0.5 text-[11px] uppercase tracking-wide">Approval Pending</p><p className="leading-relaxed">{pendingNotice}</p></div>
                  </div>
                )}

                {/* ── STUDENT LOGIN ── */}
                {role === 'STUDENT' && activeTab === 'LOGIN' && (
                  <form onSubmit={handleStudentLoginSubmit} className="space-y-5">
                    <div>
                      <label className={`${labelBase} ${labelColor}`}>Enrollment Number</label>
                      <div className="relative"><Hash className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} />
                        <input type="text" required placeholder="e.g. EN2024001" value={studentLoginData.enrollmentNumber} onChange={(e) => setStudentLoginData({ ...studentLoginData, enrollmentNumber: e.target.value })} className={inputWithIcon} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className={`${labelBase} ${labelColor} mb-0`}>Password</label>
                        <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[11px] text-[#b5872a] hover:text-[#0d1f3c] transition-colors font-medium underline underline-offset-2 decoration-[#b5872a]/30 hover:decoration-[#0d1f3c]/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">Forgot Password?</button>
                      </div>
                      <div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} />
                        <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={studentLoginData.password} onChange={(e) => setStudentLoginData({ ...studentLoginData, password: e.target.value })} className={`${inputWithIcon} pr-9`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className={`${submitBtnBase} mt-3 text-[#f0ece4] focus:ring-[#0d1f3c] shadow-md`} style={{ background: '#0d1f3c' }} onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.background = '#1a3460'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}>
                      {loading ? <div className="w-4 h-4 border-2 border-[#f0ece4]/30 border-t-[#f0ece4] rounded-full animate-spin" /> : <span>Sign In to Student Portal</span>}
                    </button>
                  </form>
                )}

                {/* ── STUDENT SIGNUP ── */}
                {role === 'STUDENT' && activeTab === 'SIGNUP' && (
                  <form onSubmit={handleStudentSignupSubmit} className="space-y-4">
                    <div><label className={`${labelBase} ${labelColor}`}>Full Name *</label><div className="relative"><User className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type="text" required placeholder="e.g. Rahul Verma" value={studentSignupData.name} onChange={(e) => setStudentSignupData({ ...studentSignupData, name: e.target.value })} className={inputWithIcon} /></div></div>
                    <div><label className={`${labelBase} ${labelColor}`}>Programme *</label><div className="relative"><BookOpen className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><select value={studentSignupData.program} onChange={(e) => setStudentSignupData({ ...studentSignupData, program: e.target.value })} className={inputWithIcon}>{availablePrograms.map((p) => (<option key={p.code} value={p.name}>{p.name}</option>))}</select></div></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>Year *</label><select value={studentSignupData.year} onChange={(e) => setStudentSignupData({ ...studentSignupData, year: Number(e.target.value) })} className={inputBase}>{[1,2,3,4].map((y) => (<option key={y} value={y}>Year {y}</option>))}</select></div>
                      <div><label className={`${labelBase} ${labelColor}`}>Semester *</label><select value={studentSignupData.semester} onChange={(e) => setStudentSignupData({ ...studentSignupData, semester: Number(e.target.value) })} className={inputBase}>{[1,2,3,4,5,6,7,8].map((s) => (<option key={s} value={s}>Sem {s}</option>))}</select></div>
                    </div>
                    <div className="flex items-center gap-3 py-1"><div className="flex-1 h-px bg-[#d4c9b0]/40" /><span className="text-[9px] tracking-[0.2em] uppercase text-[#9a917e] font-medium">Credentials</span><div className="flex-1 h-px bg-[#d4c9b0]/40" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>College Email *</label><div className="relative"><Mail className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type="email" required placeholder="student@tribhuvancollege.ac.in" value={studentSignupData.email} onChange={(e) => setStudentSignupData({ ...studentSignupData, email: e.target.value })} className={inputWithIcon} /></div></div>
                      <div><label className={`${labelBase} ${labelAccent}`}>Enrollment No. (Login ID) *</label><div className="relative"><Hash className="absolute left-2.5 top-2.5 text-[#b5872a]" size={15} /><input type="text" required placeholder="e.g. EN2024001" value={studentSignupData.enrollmentNumber} onChange={(e) => setStudentSignupData({ ...studentSignupData, enrollmentNumber: e.target.value })} className={`${inputWithIcon} border-[#c8922a]/40 focus:border-[#c8922a]`} /></div></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>Password *</label><div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type={showPassword ? 'text' : 'password'} required placeholder="Min 6 characters" value={studentSignupData.password} onChange={(e) => setStudentSignupData({ ...studentSignupData, password: e.target.value })} className={`${inputWithIcon} pr-8`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
                      <div><label className={`${labelBase} ${labelColor}`}>Confirm Password *</label><div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type={showConfirmPassword ? 'text' : 'password'} required placeholder="Re-type password" value={studentSignupData.confirmPassword} onChange={(e) => setStudentSignupData({ ...studentSignupData, confirmPassword: e.target.value })} className={`${inputWithIcon} pr-8`} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
                    </div>
                    <button type="submit" disabled={loading} className={`${submitBtnBase} mt-2 text-[#f0ece4] focus:ring-[#0d1f3c] shadow-md`} style={{ background: '#0d1f3c' }} onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.background = '#1a3460'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}>
                      {loading ? <div className="w-4 h-4 border-2 border-[#f0ece4]/30 border-t-[#f0ece4] rounded-full animate-spin" /> : <span>Create Student Account</span>}
                    </button>
                  </form>
                )}

                {/* ── TEACHER LOGIN ── */}
                {role === 'TEACHER' && activeTab === 'LOGIN' && (
                  <form onSubmit={handleTeacherLoginSubmit} className="space-y-5">
                    <div><label className={`${labelBase} ${labelColor}`}>College Gmail Address</label><div className="relative"><Mail className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} /><input type="email" required placeholder="professor@tribhuvancollege.ac.in" value={teacherLoginData.email} onChange={(e) => setTeacherLoginData({ ...teacherLoginData, email: e.target.value })} className={inputWithIcon} /></div></div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5"><label className={`${labelBase} ${labelColor} mb-0`}>Password</label><button type="button" onClick={() => setShowForgotPassword(true)} className="text-[11px] text-[#b5872a] hover:text-[#0d1f3c] transition-colors font-medium underline underline-offset-2 decoration-[#b5872a]/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">Forgot Password?</button></div>
                      <div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={16} /><input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={teacherLoginData.password} onChange={(e) => setTeacherLoginData({ ...teacherLoginData, password: e.target.value })} className={`${inputWithIcon} pr-9`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                    </div>
                    <button type="submit" disabled={loading} className={`${submitBtnBase} mt-3 text-[#f0ece4] focus:ring-[#0d1f3c] shadow-md`} style={{ background: '#0d1f3c' }} onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.background = '#1a3460'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}>
                      {loading ? <div className="w-4 h-4 border-2 border-[#f0ece4]/30 border-t-[#f0ece4] rounded-full animate-spin" /> : <span>Sign In to Faculty Portal</span>}
                    </button>
                  </form>
                )}

                {/* ── TEACHER SIGNUP ── */}
                {role === 'TEACHER' && activeTab === 'SIGNUP' && (
                  <form onSubmit={handleTeacherSignupSubmit} className="space-y-4">
                    <div className="p-3 bg-[#fdf8ed] border-l-[3px] border-[#c8922a] rounded-r-lg text-[11px] text-[#6a5420] flex items-start gap-2"><ShieldAlert size={14} className="shrink-0 mt-0.5 text-[#c8922a]" /><span className="leading-relaxed">Faculty registrations require administrative approval before login access is granted.</span></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>Full Name *</label><div className="relative"><User className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type="text" required placeholder="e.g. Prof. Anil Kumar" value={teacherSignupData.name} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, name: e.target.value })} className={inputWithIcon} /></div></div>
                      <div><label className={`${labelBase} ${labelAccent}`}>College Gmail (Login ID) *</label><div className="relative"><Mail className="absolute left-2.5 top-2.5 text-[#b5872a]" size={15} /><input type="email" required placeholder="teacher@tribhuvancollege.ac.in" value={teacherSignupData.email} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, email: e.target.value })} className={`${inputWithIcon} border-[#c8922a]/40 focus:border-[#c8922a]`} /></div></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>Employee ID *</label><div className="relative"><Hash className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type="text" required placeholder="e.g. TCH-001" value={teacherSignupData.employeeId} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, employeeId: e.target.value })} className={inputWithIcon} /></div></div>
                      <div><label className={`${labelBase} ${labelColor}`}>Designation</label><input type="text" placeholder="e.g. Asst. Professor" value={teacherSignupData.designation} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, designation: e.target.value })} className={inputBase} /></div>
                    </div>
                    <div>
                      <DepartmentMultiSelect
                        value={teacherSignupData.department}
                        onChange={(val) => setTeacherSignupData({ ...teacherSignupData, department: val })}
                        label="Department / Program(s) *"
                        required
                      />
                    </div>
                    <div><label className={`${labelBase} ${labelColor}`}>Phone Number</label><div className="relative"><Phone className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type="text" placeholder="+91-9876543210" value={teacherSignupData.phone} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, phone: e.target.value })} className={inputWithIcon} /></div></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={`${labelBase} ${labelColor}`}>Password *</label><div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type={showPassword ? 'text' : 'password'} required placeholder="Min 6 characters" value={teacherSignupData.password} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, password: e.target.value })} className={`${inputWithIcon} pr-8`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
                      <div><label className={`${labelBase} ${labelColor}`}>Confirm Password *</label><div className="relative"><Lock className="absolute left-2.5 top-2.5 text-[#9a917e]" size={15} /><input type={showConfirmPassword ? 'text' : 'password'} required placeholder="Re-type password" value={teacherSignupData.confirmPassword} onChange={(e) => setTeacherSignupData({ ...teacherSignupData, confirmPassword: e.target.value })} className={`${inputWithIcon} pr-8`} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-2.5 text-[#9a917e] hover:text-[#5a6a80] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8922a]">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
                    </div>
                    <button type="submit" disabled={loading} className={`${submitBtnBase} mt-2 text-[#f0ece4] focus:ring-[#0d1f3c] shadow-md`} style={{ background: '#0d1f3c' }} onMouseEnter={(e) => { if (!loading) (e.target as HTMLElement).style.background = '#1a3460'; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}>
                      {loading ? <div className="w-4 h-4 border-2 border-[#f0ece4]/30 border-t-[#f0ece4] rounded-full animate-spin" /> : <span>Submit Faculty Registration</span>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] text-[#9a917e] mt-5 tracking-wide">
              © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FORGOT PASSWORD MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13, 31, 60, 0.85)' }}>
          <div className="bg-white border border-[#d4c9b0]/50 p-7 max-w-sm w-full shadow-xl rounded-lg">
            <h3 style={serifFont} className="text-lg font-semibold text-[#0d1f3c] mb-2">Password Reset Assistance</h3>
            <div className="w-8 h-[2px] bg-[#c8922a] mb-4" />
            <p className="text-[12px] text-[#5a6a80] mb-6 leading-relaxed">
              Please contact the college IT administration desk or your department coordinator to have your credentials reset.
            </p>
            <button onClick={() => setShowForgotPassword(false)}
              className="w-full py-2.5 rounded-lg text-[12px] font-semibold tracking-[0.06em] uppercase text-[#f0ece4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0d1f3c] focus:ring-offset-2"
              style={{ background: '#0d1f3c' }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#1a3460'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0d1f3c'; }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
