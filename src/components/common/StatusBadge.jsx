import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const config = {
    // Instalment & Payment Statuses
    PAID: {
      bg: 'bg-[#E6F8F7] text-[#0D857D] border-[#13A89E]/30',
      dot: 'bg-[#13A89E]',
      label: 'Paid',
    },
    PARTIAL: {
      bg: 'bg-[#FDF6E8] text-[#A86F19] border-[#E7A94B]/40',
      dot: 'bg-[#E7A94B]',
      label: 'Partial',
    },
    DUE: {
      bg: 'bg-[#FDF6E8] text-[#B87718] border-[#E7A94B]/45',
      dot: 'bg-[#E7A94B]',
      label: 'Due',
    },
    UPCOMING: {
      bg: 'bg-[#EEF2FC] text-[#2446A8] border-[#2446A8]/25',
      dot: 'bg-[#2446A8]',
      label: 'Upcoming',
    },
    OVERDUE: {
      bg: 'bg-[#FDF0F1] text-[#C93D4B] border-[#E45B68]/35',
      dot: 'bg-[#E45B68]',
      label: 'Overdue',
    },
    COMPLETED: {
      bg: 'bg-[#E6F8F7] text-[#0D857D] border-[#13A89E]/30',
      dot: 'bg-[#13A89E]',
      label: 'Completed',
    },
    REVERSED: {
      bg: 'bg-[#FDF0F1] text-[#C93D4B] border-[#E45B68]/35 line-through',
      dot: 'bg-[#E45B68]',
      label: 'Reversed',
    },

    // Account Statuses
    ACTIVE: {
      bg: 'bg-[#E6F8F7] text-[#0D857D] border-[#13A89E]/30',
      dot: 'bg-[#13A89E]',
      label: 'Active',
    },
    DEFAULTED: {
      bg: 'bg-[#FDF0F1] text-[#C93D4B] border-[#E45B68]/35',
      dot: 'bg-[#E45B68]',
      label: 'Defaulted',
    },
    CLOSED: {
      bg: 'bg-[#F5F7FC] text-[#718096] border-[#E2E8F4]',
      dot: 'bg-[#718096]',
      label: 'Closed',
    },

    // KYC Statuses
    VERIFIED: {
      bg: 'bg-[#E6F8F7] text-[#0D857D] border-[#13A89E]/30',
      dot: 'bg-[#13A89E]',
      label: 'Verified',
    },
    PENDING: {
      bg: 'bg-[#FDF6E8] text-[#A86F19] border-[#E7A94B]/40',
      dot: 'bg-[#E7A94B]',
      label: 'Pending',
    },
    REJECTED: {
      bg: 'bg-[#FDF0F1] text-[#C93D4B] border-[#E45B68]/35',
      dot: 'bg-[#E45B68]',
      label: 'Rejected',
    },

    // User Roles
    ADMINISTRATOR: {
      bg: 'bg-[#F4F0FE] text-[#6E4BC4] border-[#A58BEA]/35',
      dot: 'bg-[#A58BEA]',
      label: 'Admin',
    },
    COLLECTION_STAFF: {
      bg: 'bg-[#EEF2FC] text-[#2446A8] border-[#2446A8]/25',
      dot: 'bg-[#2446A8]',
      label: 'Collector',
    },
    READ_ONLY_AUDITOR: {
      bg: 'bg-[#F5F7FC] text-[#17233C] border-[#E2E8F4]',
      dot: 'bg-[#718096]',
      label: 'Auditor',
    },
  };

  const style = config[status] || {
    bg: 'bg-[#F5F7FC] text-[#17233C] border-[#E2E8F4]',
    dot: 'bg-[#718096]',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
