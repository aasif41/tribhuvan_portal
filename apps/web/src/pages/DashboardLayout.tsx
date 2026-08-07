import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-bg relative overflow-x-hidden">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 min-w-0 md:ml-64 flex flex-col">
        <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="page-container animate-fade-in flex-1 p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
