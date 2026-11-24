import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  User,
  Clock,
  Code
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Details Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entity: entityFilter }),
        ...(search && { search })
      };
      const res = await api.get('/settings/audit-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, entityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const openDetails = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const parseDetails = (str) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compliance & Security</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Trails & Ledger Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable record of logins, transactions, loan creations & administrative reversals</p>
        </div>
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
              placeholder="Search audit trail by keyword, staff name or details..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-700 font-medium"
            >
              <option value="">All Entities</option>
              <option value="Payment">Payment</option>
              <option value="FinanceAccount">Finance Account</option>
              <option value="Customer">Customer</option>
              <option value="User">User</option>
              <option value="System">System</option>
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

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF2E9]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff / Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {log.user ? (
                        <div>
                          <span className="font-bold text-slate-900 block">{log.user.name}</span>
                          <span className="text-[10px] text-slate-400">{log.user.role}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Auto</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openDetails(log)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-stone-100"
                        title="View Detailed Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(page) => fetchLogs(page)} />
      </div>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Audit Event Payload Details"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <span className="text-slate-400 block">Action:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity:</span>
                <span className="font-bold text-slate-900">{selectedLog.entity}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Performed By:</span>
                <span className="font-bold text-slate-800">{selectedLog.user?.name || 'System'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Time:</span>
                <span className="font-mono text-slate-700">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                JSON Event Data:
              </span>
              <pre className="p-3 bg-slate-900 text-[#BFE23A] rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                {JSON.stringify(parseDetails(selectedLog.details), null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
