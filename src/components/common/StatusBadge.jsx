import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const config = {
    // Instalment & Payment Statuses
    PAID: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Paid' },
    PARTIAL: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Partial' },
    DUE: { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'Due' },
    UPCOMING: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'Upcoming' },
    OVERDUE: { bg: 'bg-red-50 text-[#E10600] border-red-200', dot: 'bg-[#E10600]', label: 'Overdue' },
    COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Completed' },
    REVERSED: { bg: 'bg-rose-50 text-rose-700 border-rose-200 line-through', dot: 'bg-rose-500', label: 'Reversed' },

    // Account Statuses
    ACTIVE: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500', label: 'Active' },
    DEFAULTED: { bg: 'bg-red-50 text-[#E10600] border-red-200', dot: 'bg-[#E10600]', label: 'Defaulted' },
    CLOSED: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: 'Closed' },

    // KYC Statuses
    VERIFIED: { bg: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Verified' },
    PENDING: { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', label: 'Pending' },
    REJECTED: { bg: 'bg-red-50 text-[#E10600] border-red-200', dot: 'bg-[#E10600]', label: 'Rejected' },

    // User Roles
    ADMINISTRATOR: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', label: 'Admin' },
    COLLECTION_STAFF: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', label: 'Collector' },
    READ_ONLY_AUDITOR: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: 'Auditor' }
  };

  const style = config[status] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
