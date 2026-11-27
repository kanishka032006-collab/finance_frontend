import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
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
  MapPin,
  Receipt,
  TrendingUp,
  ArrowRightLeft,
  Banknote,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, setIsOpen]);

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
    {
      group: 'Route & Field Operations',
      items: [
        {
          name: 'Route Management',
          to: '/routes',
          icon: MapPin,
          hideFor: ['READ_ONLY_AUDITOR'],
        },
      ],
    },
    {
      group: 'Finance & Expenses',
      items: [
        {
          name: 'Expenses',
          to: '/expenses',
          icon: Receipt,
          hideFor: ['READ_ONLY_AUDITOR'],
        },
        {
          name: 'Investments',
          to: '/investments',
          icon: TrendingUp,
          hideFor: ['COLLECTION_STAFF'],
        },
        {
          name: 'Cash Flow',
          to: '/cashflow',
          icon: ArrowRightLeft,
          hideFor: ['COLLECTION_STAFF'],
        },
        {
          name: 'Staff Salary',
          to: '/salary',
          icon: Banknote,
          hideFor: ['COLLECTION_STAFF', 'READ_ONLY_AUDITOR'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#17233C]/55 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 bg-gradient-to-b from-[#17233C] via-[#131E35] to-[#0E172A] text-slate-200 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-white/10 shadow-2xl overscroll-contain`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between gap-2 px-4 sm:px-5 border-b border-white/10 bg-[#17233C]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-black flex items-center justify-center text-lg shadow-md shadow-[#2446A8]/40 ring-1 ring-white/20 shrink-0">
              T
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-wider text-white flex items-center gap-1.5">
                TRIDIN
                <span className="text-[#E7A94B] font-extrabold text-[10px] px-1.5 py-0.5 rounded-md bg-[#2446A8]/50 border border-[#E7A94B]/30">
                  FINANCE
                </span>
              </h1>
              <p className="text-[10px] text-[#A58BEA] font-medium tracking-wide truncate">
                Collection Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="lg:hidden min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigation.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.hideFor || !item.hideFor.includes(user?.role)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 pb-1 text-[10px] font-bold text-[#A58BEA]/85 uppercase tracking-wider">
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
                        `flex items-center justify-between min-h-[42px] px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-gradient-to-r from-[#2446A8] to-[#13A89E] text-white shadow-lg shadow-[#2446A8]/35 font-bold border border-white/20'
                            : item.highlight
                            ? 'bg-[#13A89E]/15 text-[#2BC2B8] hover:bg-[#13A89E]/25 border border-[#13A89E]/30'
                            : 'text-slate-200/90 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-45 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-white/10 bg-[#0E172A]/85 shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E7A94B] to-[#C7882C] text-[#17233C] font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-[#A58BEA] truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-slate-300 hover:text-[#E45B68] hover:bg-[#E45B68]/15 transition shrink-0"
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
