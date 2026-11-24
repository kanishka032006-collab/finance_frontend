import React from 'react';
import { Menu, Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from './StatusBadge';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FDF9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left section: Hamburger for mobile + current date */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-stone-200/60 lg:hidden transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs text-slate-500 font-medium">{todayFormatted}</span>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Finance Collection Management</h2>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Live Secure Portal
            </span>
          </div>
        </div>
      </div>

      {/* Right section: System branding, user badge & quick role info */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {user?.role && <StatusBadge status={user.role} />}

        {/* User name display */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-bold text-slate-800">{user?.name}</span>
          <span className="text-[10px] text-slate-500">{user?.email}</span>
        </div>

        {/* Quick accent dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#BFE23A] ring-2 ring-[#BFE23A]/30" title="System Online" />
      </div>
    </header>
  );
};

export default Navbar;
