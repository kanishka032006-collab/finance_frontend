import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  UserCog,
  Wallet,
  ShieldCheck,
  Users,
  Landmark,
  BarChart3,
  History,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getItems = () => {
    if (user.role === 'COLLECTION_STAFF') {
      return [
        {
          name: 'Collector Portal',
          to: '/collector/dashboard',
          altPaths: ['/'],
          icon: Wallet,
        },
        {
          name: 'Customers',
          to: '/customers',
          icon: Users,
        },
        {
          name: 'Record Collection',
          to: '/collections',
          icon: Wallet,
          primary: true,
        },
        {
          name: 'Payment History',
          to: '/payments',
          icon: History,
        },
      ];
    }

    if (user.role === 'READ_ONLY_AUDITOR') {
      return [
        {
          name: 'Auditor Portal',
          to: '/auditor/dashboard',
          altPaths: ['/'],
          icon: ShieldCheck,
        },
        {
          name: 'Finance Accounts',
          to: '/accounts',
          icon: Landmark,
        },
        {
          name: 'Reports & Analytics',
          to: '/reports',
          icon: BarChart3,
        },
        {
          name: 'Audit Logs',
          to: '/audit-logs',
          icon: ClipboardList,
        },
      ];
    }

    return [
      {
        name: 'Admin Dashboard',
        to: '/admin/dashboard',
        altPaths: ['/'],
        icon: UserCog,
      },
      {
        name: 'Customers',
        to: '/customers',
        icon: Users,
      },
      {
        name: 'Record Collection',
        to: '/collections',
        icon: Wallet,
        primary: true,
      },
      {
        name: 'Reports & Analytics',
        to: '/reports',
        icon: BarChart3,
      },
    ];
  };

  const items = getItems();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden print:hidden bg-white/95 backdrop-blur-xl border-t border-[#E2E8F4] shadow-bottom-nav pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 items-stretch max-w-xl mx-auto px-1.5 py-1.5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isMatched =
            location.pathname === item.to ||
            (item.altPaths && item.altPaths.includes(location.pathname)) ||
            (item.to !== '/' &&
              !item.to.endsWith('/dashboard') &&
              location.pathname.startsWith(`${item.to}/`));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                `relative flex flex-col items-center justify-center min-h-[54px] px-1 py-1 rounded-2xl transition-all duration-200 ${
                  isMatched
                    ? item.primary
                      ? 'bg-gradient-to-br from-[#13A89E] to-[#0D857D] text-white shadow-md shadow-[#13A89E]/25'
                      : 'bg-[#EEF2FC] text-[#2446A8]'
                    : item.primary
                    ? 'bg-[#E6F8F7]/80 text-[#0D857D] hover:bg-[#E6F8F7]'
                    : 'text-[#718096] hover:text-[#17233C] hover:bg-[#F5F7FC]'
                }`
              }
            >
              {isMatched && !item.primary && (
                <span className="absolute top-0.5 w-6 h-1 rounded-full bg-[#2446A8]" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isMatched
                    ? item.primary
                      ? 'text-white'
                      : 'text-[#2446A8]'
                    : item.primary
                    ? 'text-[#13A89E]'
                    : 'text-[#718096]'
                }`}
              />
              <span
                title={item.name}
                className={`mt-1 w-full text-center text-[10px] font-bold leading-tight truncate px-0.5 ${
                  isMatched
                    ? item.primary
                      ? 'text-white'
                      : 'text-[#2446A8]'
                    : item.primary
                    ? 'text-[#0D857D]'
                    : 'text-[#718096]'
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
