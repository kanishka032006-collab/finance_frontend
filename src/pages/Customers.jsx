import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  UserX,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Building
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
        ...(activeFilter !== '' && { active: activeFilter })
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Portfolio</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Directory of registered borrowers, KYC verification & credit balances</p>
        </div>
        {canPerformTransactions && (
          <button
            onClick={() => navigate('/customers/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Add New Customer
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, code (CUST-0001), or mobile..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-700"
            >
              <option value="">All KYC Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-700"
            >
              <option value="">All Accounts</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF2E9]/60 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-[#BFE23A] rounded-full animate-spin mr-2" />
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No customers found matching the criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF2E9]/20 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name ? c.name[0] : 'C'}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/customers/${c.id}`)}
                            className="font-bold text-slate-900 hover:text-slate-600 cursor-pointer block"
                          >
                            {c.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{c.customerCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.mobile}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.kycStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {c.totalAccounts}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                      ₹{c.totalAgreed?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-700">
                      ₹{c.totalPaid?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{c.outstandingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      {c.overdueAmount > 0 ? (
                        <span className="font-bold text-[#E10600]">
                          ₹{c.overdueAmount?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/customers/${c.id}`)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canPerformTransactions && (
                          <button
                            onClick={() => navigate(`/customers/new?edit=${c.id}`)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && c.active && (
                          <button
                            onClick={() => handleDeactivate(c.id, c.name)}
                            title="Deactivate Customer"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
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
