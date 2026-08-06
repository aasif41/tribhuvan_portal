import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="page-container animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
