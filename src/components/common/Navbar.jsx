import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const todayFormatted = new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 min-h-[64px] bg-white/90 backdrop-blur-xl border-b border-[#E2E8F4] px-3 sm:px-6 flex items-center justify-between gap-2 shadow-[0_4px_20px_-8px_rgba(23,35,60,0.08)]">
      {/* Left section: Mobile Hamburger + Brand + Desktop context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center text-[#17233C] bg-[#F5F7FC] border border-[#E2E8F4] hover:bg-[#EEF2FC] hover:text-[#2446A8] lg:hidden transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact mobile brand */}
        <div className="flex items-center gap-2 lg:hidden min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
            T
          </div>
          <div className="min-w-0 sm:hidden">
            <span className="text-xs font-black tracking-wide text-[#17233C] block truncate">
              TRIDIN FINANCE
            </span>
          </div>
        </div>

        {/* Date & Title on Tablet/Desktop */}
        <div className="hidden sm:block min-w-0">
          <span className="text-[11px] text-[#13A89E] font-semibold block">{todayFormatted}</span>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold text-[#17233C] truncate">Finance Collection Management</h2>
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-[#0D857D] bg-[#E6F8F7] px-2.5 py-0.5 rounded-full font-semibold border border-[#13A89E]/25 shrink-0">
              <ShieldCheck className="w-3 h-3 text-[#13A89E]" /> Live Secure Portal
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Language selector, Role badge & User profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#17233C]" title="Language">
          <span aria-hidden="true" className="text-[#2446A8] hidden xs:inline font-bold">
            文
          </span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label="Language"
            className="min-h-[38px] rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-[#17233C] focus:outline-none focus:ring-2 focus:ring-[#2446A8]"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>

        {/* Role badge */}
        {user?.role && (
          <div className="hidden xs:inline-flex">
            <StatusBadge status={user.role} />
          </div>
        )}

        {/* User name display */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-bold text-[#17233C]">{user?.name}</span>
          <span className="text-[10px] text-[#718096]">{user?.email}</span>
        </div>

        {/* Quick online status dot */}
        <div
          className="w-2.5 h-2.5 rounded-full bg-[#13A89E] ring-4 ring-[#13A89E]/20 shrink-0"
          title="System Online"
        />
      </div>
    </header>
  );
};

export default Navbar;
