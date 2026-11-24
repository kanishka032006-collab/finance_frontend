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
      <div className="bg-white p-2.5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 pl-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Dedicated Role Portals:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveRoleView('admin')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            Admin Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleView('collector')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'collector'
                ? 'bg-[#BFE23A] text-slate-950 font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Collector Portal
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleView('auditor')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeRoleView === 'auditor'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Auditor Portal
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
