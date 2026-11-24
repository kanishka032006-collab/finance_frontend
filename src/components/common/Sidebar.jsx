import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  Users,
  UserPlus,
  Landmark,
  BadgePercent,
  Wallet,
  BookOpenText,
  History,
  BarChart3,
  Settings,
  ClipboardList,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navigation = [
    {
      group: 'Dedicated Role Portals',
      items: [
        {
          name: 'Admin Dashboard',
          to: '/admin/dashboard',
          icon: UserCog,
          hideFor: ['COLLECTION_STAFF', 'READ_ONLY_AUDITOR'],
        },
        {
          name: 'Collector Portal',
          to: '/collector/dashboard',
          icon: Wallet,
          highlight: true,
          hideFor: ['READ_ONLY_AUDITOR'],
        },
        {
          name: 'Auditor Portal',
          to: '/auditor/dashboard',
          icon: ShieldCheck,
          hideFor: ['COLLECTION_STAFF'],
        },
      ],
    },
    {
      group: 'Customer & Accounts',
      items: [
        {
          name: 'Customers',
          to: '/customers',
          icon: Users,
        },
        {
          name: 'Add Customer',
          to: '/customers/new',
          icon: UserPlus,
          hideFor: ['READ_ONLY_AUDITOR'],
        },
        {
          name: 'Finance Accounts',
          to: '/accounts',
          icon: Landmark,
        },
        {
          name: 'Create Account',
          to: '/accounts/new',
          icon: BadgePercent,
          hideFor: ['READ_ONLY_AUDITOR'],
        },
      ],
    },
    {
      group: 'Collections & Ledger',
      items: [
        {
          name: 'Record Collection',
          to: '/collections',
          icon: Wallet,
        },
        {
          name: 'Collection Ledger',
          to: '/ledger',
          icon: BookOpenText,
        },
        {
          name: 'Payment History',
          to: '/payments',
          icon: History,
        },
      ],
    },
    {
      group: 'Analytics & Administration',
      items: [
        {
          name: 'Reports & Analytics',
          to: '/reports',
          icon: BarChart3,
          hideFor: ['COLLECTION_STAFF'],
        },
        {
          name: 'Staff Management',
          to: '/staff',
          icon: UserCog,
          hideFor: ['COLLECTION_STAFF'],
        },
        {
          name: 'Settings',
          to: '/settings',
          icon: Settings,
          hideFor: ['COLLECTION_STAFF', 'READ_ONLY_AUDITOR'],
        },
        {
          name: 'Audit Logs',
          to: '/audit-logs',
          icon: ClipboardList,
          hideFor: ['COLLECTION_STAFF'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-[#BFE23A] text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
            T
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white flex items-center gap-1.5">
              TRIDIN <span className="text-[#BFE23A] font-extrabold text-xs px-1 py-0.5 rounded bg-[#BFE23A]/10">FINANCE</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Collection Management</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigation.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.hideFor || !item.hideFor.includes(user?.role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.group}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition group ${
                          isActive
                            ? 'bg-[#BFE23A] text-slate-950 shadow-sm font-bold'
                            : item.highlight
                            ? 'bg-slate-800/80 text-[#BFE23A] hover:bg-slate-800'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#FAF2E9] text-slate-900 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#E10600] hover:bg-red-500/10 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
