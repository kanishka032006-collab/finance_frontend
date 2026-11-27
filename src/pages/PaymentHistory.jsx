import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Printer,
  RotateCcw,
  ShieldAlert,
  Calendar,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PrintPDFButton from '../components/common/PrintPDFButton';
import ReceiptModal from '../components/common/ReceiptModal';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Reversal Modal
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [reversalPayment, setReversalPayment] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversalLoading, setReversalLoading] = useState(false);
  const [reversalError, setReversalError] = useState('');

  const { isAdmin } = useAuth();

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(methodFilter && { paymentMethod: methodFilter })
      };
      const res = await api.get('/payments', { params });
      if (res.data.success) {
        setPayments(res.data.payments);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayments(1);
  };

  const viewReceipt = async (receiptNumber) => {
    try {
      const res = await api.get(`/payments/receipt/${receiptNumber}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load receipt:', err);
    }
  };

  const openReverseModal = (p) => {
    setReversalPayment(p);
    setReversalReason('');
    setReversalError('');
    setReverseModalOpen(true);
  };

  const handleReversePayment = async (e) => {
    e.preventDefault();
    if (!reversalReason || reversalReason.trim().length < 5) {
      setReversalError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }

    setReversalLoading(true);
    setReversalError('');

    try {
      const res = await api.post(`/payments/${reversalPayment.id}/reverse`, {
        reason: reversalReason
      });
      if (res.data.success) {
        setReverseModalOpen(false);
        alert(res.data.message);
        fetchPayments(pagination.page);
      }
    } catch (err) {
      setReversalError(err.response?.data?.message || 'Failed to reverse payment.');
    } finally {
      setReversalLoading(false);
    }
  };

  return (
    <div id="printable-area" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transaction Archive</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment & Collection History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Auditable repository of field collections, vouchers & reversal journals</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <PrintPDFButton targetId="printable-area" title="TRIDIN FINANCE – Payment History" />
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
              placeholder="Search by receipt number (REC-...), customer name, code or reference..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#789486] bg-stone-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#789486] bg-stone-50/50 text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVERSED">Reversed</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#789486] bg-stone-50/50 text-slate-700 font-medium"
            >
              <option value="">All Payment Modes</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
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

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F8F5]/60 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Account #</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4 text-right">Amount (?)</th>
                <th className="py-3.5 px-4">Allocated Weeks</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Collector</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-[#789486] rounded-full animate-spin mr-2" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No transactions found matching filter.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8F8F5]/20 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.customer?.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{p.customer?.customerCode}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {p.account?.accountNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{p.paymentMethod}</span>
                      {p.reference && (
                        <span className="block text-[10px] font-mono text-slate-400">{p.reference}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      ?{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.allocations?.map((a, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-slate-700 border border-stone-200"
                          >
                            W{a.instalment?.weekNumber} (?{Number(a.allocatedAmount)})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={p.status} />
                      {p.status === 'REVERSED' && (
                        <span className="block text-[9px] text-[#E10600] font-medium mt-0.5">
                          {p.reversalReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {p.collector?.name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => viewReceipt(p.receiptNumber)}
                          title="Print Receipt"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isAdmin && p.status === 'COMPLETED' && (
                          <button
                            onClick={() => openReverseModal(p)}
                            title="Reverse Payment"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
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
        <Pagination pagination={pagination} onPageChange={(page) => fetchPayments(page)} />
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      {/* Payment Reversal Modal */}
      <Modal
        isOpen={reverseModalOpen}
        onClose={() => setReverseModalOpen(false)}
        title="Authorize Payment Reversal"
      >
        <form onSubmit={handleReversePayment} className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#E10600]">
            <strong>Warning:</strong> Reversing this transaction will restore the allocated amounts
            back onto the customer's weekly instalments and re-open the debt in the ledger.
          </div>

          {reversalPayment && (
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
              <div>
                Receipt: <span className="font-mono font-bold">{reversalPayment.receiptNumber}</span>
              </div>
              <div>
                Customer: <span className="font-bold">{reversalPayment.customer?.name}</span>
              </div>
              <div>
                Amount: <span className="font-mono font-bold text-slate-900">?{reversalPayment.amount}</span>
              </div>
            </div>
          )}

          {reversalError && (
            <div className="p-2.5 bg-red-50 text-[#E10600] rounded-xl text-xs font-semibold">
              {reversalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mandatory Reversal Reason *
            </label>
            <textarea
              required
              rows={3}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Bounced cheque, bank reversal chargeback, staff entry error..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReverseModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reversalLoading}
              className="px-4 py-2 text-xs font-bold bg-[#E10600] hover:bg-red-700 text-white rounded-xl shadow-xs transition"
            >
              {reversalLoading ? 'Reversing...' : 'Confirm Reversal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentHistory;
