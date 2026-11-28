import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen tridin-3d-canvas flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-black flex items-center justify-center text-2xl animate-pulse shadow-premium border border-white/30">
            T
          </div>
          <p className="text-xs font-bold text-[#17233C] tracking-wider uppercase">
            Loading TamilFins System...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="relative min-h-screen tridin-3d-canvas flex overflow-x-hidden">
      {/* Subtle Layered Ambient Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden" aria-hidden="true">
        <div className="absolute -top-16 right-8 w-72 h-72 rounded-3xl tridin-3d-shape-1 opacity-70 hidden md:block" />
        <div className="absolute top-1/3 -right-12 w-56 h-56 rounded-full tridin-3d-orb opacity-60" />
        <div className="absolute bottom-10 left-72 w-64 h-44 rounded-3xl tridin-3d-shape-2 opacity-50 hidden lg:block" />
      </div>

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content wrapper */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 px-3 py-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* One-handed mobile bottom navigation bar */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
