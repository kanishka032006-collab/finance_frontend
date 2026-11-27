import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Edit,
  UserX,
  Phone,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const navigate = useNavigate();
  const { canPerformTransactions, isAdmin } = useAuth();

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(kycFilter && { kycStatus: kycFilter }),
        ...(activeFilter !== '' && { active: activeFilter }),
      };
      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.customers);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [kycFilter, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(1);
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate customer "${name}"? Active accounts cannot be deleted.`)) {
      return;
    }
    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        alert(res.data.message);
        fetchCustomers(pagination.page);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate customer.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] to-[#13A89E]" />
        <div className="min-w-0">
          <span className="text-[11px] font-bold text-[#2446A8] uppercase tracking-wider">Client Portfolio</span>
          <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">Customer Management</h1>
          <p className="text-xs text-[#718096] mt-0.5">
            Directory of registered borrowers, KYC verification & credit balances
          </p>
        </div>
        {canPerformTransactions && (
          <button
            type="button"
            onClick={() => navigate('/customers/new')}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-extrabold btn-teal self-stretch sm:self-auto"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F4] shadow-card">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, code (CUST-0001), or mobile..."
              className="w-full min-h-[42px] pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex gap-2">
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="min-h-[42px] px-3 py-2 text-xs rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
            >
              <option value="">All KYC Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="min-h-[42px] px-3 py-2 text-xs rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
            >
              <option value="">All Accounts</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated</option>
            </select>
            <button
              type="submit"
              className="xs:col-span-2 sm:col-span-1 min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold btn-royal"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Customer Cards (Mobile) & Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-[#E2E8F4]">
          {loading ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096]">
              <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
              Loading...
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096] font-medium">
              No records found
            </div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="p-4 space-y-3 hover:bg-[#F5F7FC]/60 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 font-extrabold flex items-center justify-center text-sm shrink-0">
                      {c.name ? c.name[0] : 'C'}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${c.id}`)}
                        className="font-bold text-sm text-[#17233C] hover:text-[#2446A8] text-left block truncate max-w-full"
                      >
                        {c.name}
                      </button>
                      <span className="font-code text-[11px] text-[#718096]">{c.customerCode}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.kycStatus} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#718096]">
                  <a href={`tel:${c.mobile}`} className="flex items-center gap-1 text-[#2446A8] font-semibold font-num">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{c.mobile}</span>
                  </a>
                  <span className="flex items-center gap-1 truncate max-w-full">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7FC] border border-[#E2E8F4] rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Total Agreed</span>
                    <span className="font-num font-bold text-[#17233C]">
                      ₹{c.totalAgreed?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Total Paid</span>
                    <span className="font-num font-bold text-[#0D857D]">
                      ₹{c.totalPaid?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Outstanding</span>
                    <span className="font-num font-extrabold text-[#B87718]">
                      ₹{c.outstandingBalance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">Overdue</span>
                    <span className={`font-num font-extrabold ${c.overdueAmount > 0 ? 'text-[#C93D4B]' : 'text-[#718096]'}`}>
                      ₹{(c.overdueAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-[#718096]">
                    Accounts: <strong className="font-num text-[#17233C]">{c.totalAccounts}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${c.id}`)}
                      className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-[#EEF2FC] text-[#2446A8] text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
                    {canPerformTransactions && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/new?edit=${c.id}`)}
                        title="Edit Customer"
                        className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-[#E2E8F4] text-[#17233C] hover:bg-[#F5F7FC]"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && c.active && (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(c.id, c.name)}
                        title="Deactivate Customer"
                        className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-[#E45B68]/30 bg-[#FDF0F1] text-[#C93D4B]"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact & Address</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4 text-center">Accounts</th>
                <th className="py-3.5 px-4 text-right">Total Agreed</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4 text-right">Overdue</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F4]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#718096]">
                    <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
                    Loading...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#718096] font-medium">
                    No records found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F5F7FC]/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name ? c.name[0] : 'C'}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/customers/${c.id}`)}
                            className="font-bold text-[#17233C] hover:text-[#2446A8] cursor-pointer block"
                          >
                            {c.name}
                          </span>
                          <span className="font-code text-[10px] text-[#718096]">{c.customerCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[#17233C] font-medium font-num">
                          <Phone className="w-3 h-3 text-[#2446A8]" />
                          <span>{c.mobile}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#718096] truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-[#718096] shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.kycStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-num font-bold text-[#17233C]">
                      {c.totalAccounts}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-semibold text-[#17233C]">
                      ₹{c.totalAgreed?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-bold text-[#0D857D]">
                      ₹{c.totalPaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num font-bold text-[#B87718]">
                      ₹{c.outstandingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-num">
                      {c.overdueAmount > 0 ? (
                        <span className="font-bold text-[#C93D4B]">
                          ₹{c.overdueAmount?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#718096]">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/${c.id}`)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-[#2446A8] hover:bg-[#EEF2FC] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canPerformTransactions && (
                          <button
                            type="button"
                            onClick={() => navigate(`/customers/new?edit=${c.id}`)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-[#17233C] hover:bg-[#F5F7FC] transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && c.active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(c.id, c.name)}
                            title="Deactivate Customer"
                            className="p-1.5 rounded-lg text-[#E45B68] hover:bg-[#FDF0F1] transition"
                          >
                            <UserX className="w-4 h-4" />
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
        <Pagination pagination={pagination} onPageChange={(page) => fetchCustomers(page)} />
      </div>
    </div>
  );
};

export default Customers;
