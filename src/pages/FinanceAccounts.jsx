import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Search,
  Plus,
  Filter,
  Eye,
  Wallet,
  Calendar,
  AlertOctagon,
  FileText
} from 'lucide-react';
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
        ...(statusFilter && { status: statusFilter })
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credit Accounts</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance Account Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage disbursement contracts, weekly schedules & outstanding credit</p>
        </div>
        {canPerformTransactions && (
          <button
            onClick={() => navigate('/accounts/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Create Finance Account
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by account number, customer name or code..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-700"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DEFAULTED">Defaulted</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF2E9]/60 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-[#BFE23A] rounded-full animate-spin mr-2" />
                    Loading finance accounts...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No finance accounts found matching filter.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#FAF2E9]/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {acc.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span
                          onClick={() => navigate(`/customers/${acc.customerId}`)}
                          className="font-bold text-slate-900 hover:underline cursor-pointer block"
                        >
                          {acc.customer?.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{acc.customer?.customerCode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      ₹{acc.actualDisbursed?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{acc.agreedRepayment?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-purple-700">
                      ₹{acc.grossDifference?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                      ₹{acc.weeklyInstalment?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                      {acc.totalWeeks}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                      ₹{acc.outstandingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {acc.overdueAmount > 0 ? (
                        <span className="font-bold text-[#E10600]">
                          ₹{acc.overdueAmount?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={acc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/ledger?accountId=${acc.id}`)}
                          title="View Collection Ledger"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canPerformTransactions && acc.status === 'ACTIVE' && (
                          <button
                            onClick={() => navigate(`/collections?accountId=${acc.id}`)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg text-slate-900 bg-[#BFE23A]/40 hover:bg-[#BFE23A] transition"
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
