import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Wallet } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const FinanceAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const navigate = useNavigate();
  const { canPerformTransactions } = useAuth();

  const fetchAccounts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      };
      const res = await api.get('/accounts', { params });
      if (res.data.success) {
        setAccounts(res.data.accounts);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAccounts(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] to-[#A58BEA]" />
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-[#2446A8] uppercase tracking-wider">Credit Accounts</span>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
            Finance Account Management
          </h1>
          <p className="text-xs text-[#718096] mt-0.5">
            Manage disbursement contracts, weekly schedules & outstanding credit
          </p>
        </div>
        {canPerformTransactions && (
          <button
            type="button"
            onClick={() => navigate('/accounts/new')}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-extrabold btn-teal self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span>Create Finance Account</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F4] shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by account number, customer name or code..."
              className="w-full min-h-[42px] pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>
          <div className="flex flex-col xs:flex-row gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[42px] px-3 py-2 text-xs rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DEFAULTED">Defaulted</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold btn-royal"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Accounts Cards (Mobile) & Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#E2E8F4]">
          {loading ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096]">
              <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
              Loading...
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096]">No records found</div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="p-4 space-y-3 hover:bg-[#F5F7FC]/60">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-code font-bold text-xs text-[#2446A8] block">
                      {acc.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${acc.customerId}`)}
                      className="font-bold text-sm text-[#17233C] hover:text-[#2446A8] text-left block truncate max-w-full"
                    >
                      {acc.customer?.name}
                    </button>
                    <span className="font-code text-[10px] text-[#718096]">
                      {acc.customer?.customerCode} • {acc.totalWeeks} Weeks
                    </span>
                  </div>
                  <StatusBadge status={acc.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7FC] border border-[#E2E8F4] rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Disbursed</span>
                    <span className="font-num font-bold text-[#17233C]">
                      ₹{acc.actualDisbursed?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Agreed</span>
                    <span className="font-num font-bold text-[#2446A8]">
                      ₹{acc.agreedRepayment?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Weekly Instalment</span>
                    <span className="font-num font-bold text-[#0D857D]">
                      ₹{acc.weeklyInstalment?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Outstanding</span>
                    <span className="font-num font-extrabold text-[#B87718]">
                      ₹{acc.outstandingBalance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase mr-1">Overdue:</span>
                    <span
                      className={`font-num text-xs font-extrabold ${
                        acc.overdueAmount > 0 ? 'text-[#C93D4B]' : 'text-[#718096]'
                      }`}
                    >
                      ₹{(acc.overdueAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/ledger?accountId=${acc.id}`)}
                      className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-[#EEF2FC] text-[#2446A8] text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Collection Ledger</span>
                    </button>
                    {canPerformTransactions && acc.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => navigate(`/collections?accountId=${acc.id}`)}
                        title="Record Payment"
                        className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl btn-teal"
                      >
                        <Wallet className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Account Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Disbursed (₹)</th>
                <th className="py-3.5 px-4 text-right">Agreed (₹)</th>
                <th className="py-3.5 px-4 text-right">Gross Diff</th>
                <th className="py-3.5 px-4 text-right">Weekly Instalment</th>
                <th className="py-3.5 px-4 text-center">Weeks</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4 text-right">Overdue</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F4]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#718096]">
                    <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
                    Loading...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#718096]">
                    No records found
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#F5F7FC]/70 transition">
                    <td className="py-3.5 px-4 font-code font-bold text-[#2446A8] whitespace-nowrap">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span
                          onClick={() => navigate(`/customers/${acc.customerId}`)}
                          className="font-bold text-[#17233C] hover:text-[#2446A8] hover:underline cursor-pointer block"
                        >
                          {acc.customer?.name}
                        </span>
                        <span className="font-code text-[10px] text-[#718096]">
                          {acc.customer?.customerCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-medium text-[#17233C]">
                      ₹{acc.actualDisbursed?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-bold text-[#17233C]">
                      ₹{acc.agreedRepayment?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-semibold text-[#6E4BC4]">
                      ₹{acc.grossDifference?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-semibold text-[#0D857D]">
                      ₹{acc.weeklyInstalment?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-num font-bold text-[#718096]">
                      {acc.totalWeeks}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-bold text-[#B87718]">
                      ₹{acc.outstandingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num">
                      {acc.overdueAmount > 0 ? (
                        <span className="font-bold text-[#C93D4B]">
                          ₹{acc.overdueAmount?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#718096]">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={acc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/ledger?accountId=${acc.id}`)}
                          title="View Collection Ledger"
                          className="p-1.5 rounded-lg text-[#2446A8] hover:bg-[#EEF2FC] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canPerformTransactions && acc.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/collections?accountId=${acc.id}`)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg text-[#0D857D] bg-[#E6F8F7] hover:bg-[#13A89E] hover:text-white transition"
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(page) => fetchAccounts(page)} />
      </div>
    </div>
  );
};

export default FinanceAccounts;
