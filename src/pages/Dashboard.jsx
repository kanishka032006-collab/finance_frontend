import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import CollectorDashboard from './CollectorDashboard';
import AuditorDashboard from './AuditorDashboard';
import { UserCog, Wallet, ShieldCheck, Layers } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const getDefaultRoleView = () => {
    if (user?.role === 'COLLECTION_STAFF') return 'collector';
    if (user?.role === 'READ_ONLY_AUDITOR') return 'auditor';
    return 'admin';
  };

  const [activeRoleView, setActiveRoleView] = useState(getDefaultRoleView);

  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(getDefaultRoleView());
    }
  }, [user?.role]);

  return (
    <div className="space-y-4">
      {/* Role Portal Switcher Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E2E8F4] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FC] text-[#2446A8] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#17233C]">Dedicated Role Portals:</span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 sm:inline-flex items-center gap-1.5 p-1 bg-[#F5F7FC] border border-[#E2E8F4] rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveRoleView('admin')}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'admin'
                ? 'bg-gradient-to-r from-[#2446A8] to-[#345BD1] text-white shadow-sm'
                : 'text-[#718096] hover:text-[#17233C] hover:bg-white/60'
            }`}
          >
            <UserCog className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Admin Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleView('collector')}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'collector'
                ? 'bg-gradient-to-r from-[#13A89E] to-[#0E8F86] text-white shadow-sm'
                : 'text-[#718096] hover:text-[#17233C] hover:bg-white/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Collector Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleView('auditor')}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'auditor'
                ? 'bg-gradient-to-r from-[#8566D6] to-[#A58BEA] text-white shadow-sm'
                : 'text-[#718096] hover:text-[#17233C] hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Auditor Portal</span>
          </button>
        </div>
      </div>

      {/* Render the selected dedicated role page */}
      {activeRoleView === 'admin' && <AdminDashboard />}
      {activeRoleView === 'collector' && <CollectorDashboard />}
      {activeRoleView === 'auditor' && <AuditorDashboard />}
    </div>
  );
};

export default Dashboard;
