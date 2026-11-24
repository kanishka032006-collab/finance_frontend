import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpenText,
  Search,
  Wallet,
  Clock,
  Printer,
  SlidersHorizontal,
  ShieldCheck,
  AlertOctagon,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PrintPDFButton from '../components/common/PrintPDFButton';
import ReceiptModal from '../components/common/ReceiptModal';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const CollectionLedger = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const accountIdParam = searchParams.get('accountId');

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(accountIdParam || '');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Adjustment Modal
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjType, setAdjType] = useState('WAIVER');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjMessage, setAdjMessage] = useState('');

  const navigate = useNavigate();
  const { isAdmin, canPerformTransactions } = useAuth();

  // Load active accounts
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await api.get('/accounts', { params: { limit: 100 } });
        if (res.data.success) {
          setAccounts(res.data.accounts);
          if (!selectedAccountId && res.data.accounts.length > 0) {
            setSelectedAccountId(res.data.accounts[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load accounts for ledger:', err);
      }
    };
    loadAccounts();
  }, []);

  // Fetch ledger when selectedAccountId changes
  useEffect(() => {
    if (selectedAccountId) {
      const fetchLedger = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/accounts/${selectedAccountId}/ledger`);
          if (res.data.success) {
            setLedgerData(res.data);
            setSearchParams({ accountId: selectedAccountId });
          }
        } catch (err) {
          console.error('Failed to load ledger:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchLedger();
    }
  }, [selectedAccountId]);

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

  const handleRecordAdjustment = async (e) => {
    e.preventDefault();
    setAdjMessage('');
    setAdjLoading(true);

    try {
      const res = await api.post(`/accounts/${selectedAccountId}/adjustments`, {
        type: adjType,
        amount: parseFloat(adjAmount),
        reason: adjReason
      });
      if (res.data.success) {
        setAdjMessage('Adjustment recorded with audit trail!');
        setAdjAmount('');
        setAdjReason('');
        // Refresh ledger
        const refreshRes = await api.get(`/accounts/${selectedAccountId}/ledger`);
        if (refreshRes.data.success) {
          setLedgerData(refreshRes.data);
        }
        setTimeout(() => setAdjModalOpen(false), 1200);
      }
    } catch (err) {
      setAdjMessage(err.response?.data?.message || 'Failed to record adjustment');
    } finally {
      setAdjLoading(false);
    }
  };

  const { account, ledger } = ledgerData || {};

  return (
    <div id="printable-area" className="space-y-6">
      {/* Header and Account Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accounting Ledger</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collection Ledger & FIFO Breakdown</h1>
          <p className="text-xs text-slate-500 mt-0.5">Week-by-week scheduled repayments, arrears tracking & payment allocations</p>
        </div>

        {/* Account Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50 text-slate-900"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountNumber} - {a.customer?.name}
              </option>
            ))}
          </select>
          {canPerformTransactions && (
            <button
              onClick={() => navigate(`/collections?accountId=${selectedAccountId}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-xs transition"
            >
              <Wallet className="w-4 h-4" /> Collect
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setAdjModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
              title="Record Waiver / Adjustment"
            >
              <SlidersHorizontal className="w-4 h-4" /> Adjustment
            </button>
          )}
          <PrintPDFButton targetId="printable-area" title={`TRIDIN FINANCE â€“ Collection Ledger ${account?.accountNumber || ''}`} compact />
        </div>
      </div>

      {/* Account Info Pill */}
      {account && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Customer:</span>
            <span className="font-extrabold text-slate-900 text-sm block">{account.customerName}</span>
            <span className="font-mono text-slate-500 text-[10px]">{account.customerCode}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Agreed Repayment:</span>
            <span className="font-mono font-black text-slate-900 text-sm block">
              ₹{account.agreedRepayment?.toLocaleString('en-IN')}
            </span>
            <span className="text-slate-400 text-[10px]">{account.totalWeeks} Weeks Schedule</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Disbursed Capital:</span>
            <span className="font-mono font-bold text-slate-800 text-sm block">
              ₹{account.actualDisbursed?.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Gross Difference:</span>
            <span className="font-mono font-bold text-purple-700 text-sm block">
              ₹{account.grossDifference?.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Contract Status:</span>
            <div className="mt-1">
              <StatusBadge status={account.status} />
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF2E9]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Week #</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Scheduled Amount (₹)</th>
                <th className="py-3 px-4 text-right">Paid Amount (₹)</th>
                <th className="py-3 px-4 text-right">Arrears (₹)</th>
                <th className="py-3 px-4 text-right">Remaining Balance (₹)</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4">Allocated Receipts (FIFO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-[#BFE23A] rounded-full animate-spin mr-2" />
                    Calculating weekly ledger balances...
                  </td>
                </tr>
              ) : !ledger || ledger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                ledger.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAF2E9]/20 transition">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Week {row.weekNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(row.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                      ₹{row.scheduledAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{row.paidAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {row.arrears > 0 ? (
                        <span className="font-bold text-[#E10600]">
                          ₹{row.arrears?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                      ₹{row.outstandingBalance?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-4">
                      {row.allocations && row.allocations.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.allocations.map((alloc, idx) => (
                            <button
                              key={idx}
                              onClick={() => viewReceipt(alloc.payment?.receiptNumber)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition"
                            >
                              <span>{alloc.payment?.receiptNumber}</span>
                              <span className="font-bold">₹{Number(alloc.allocatedAmount)}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      {/* Adjustment Modal */}
      <Modal isOpen={adjModalOpen} onClose={() => setAdjModalOpen(false)} title="Record Ledger Adjustment / Waiver">
        <form onSubmit={handleRecordAdjustment} className="space-y-4">
          <p className="text-xs text-slate-500">
            Record a formal penalty, waiver, discount, or correction with strict audit history tracking.
          </p>

          {adjMessage && (
            <div className="p-3 rounded-xl bg-stone-100 text-xs font-semibold text-slate-800">
              {adjMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adjustment Type</label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
            >
              <option value="WAIVER">Fee Waiver</option>
              <option value="PENALTY">Late Penalty</option>
              <option value="DISCOUNT">Settlement Discount</option>
              <option value="CORRECTION">Ledger Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Audit Reason *</label>
            <textarea
              required
              rows={2}
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="Specify justification for audit records..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjLoading}
              className="px-4 py-2 text-xs font-bold bg-[#BFE23A] text-slate-900 rounded-xl hover:bg-[#aed12b]"
            >
              {adjLoading ? 'Saving...' : 'Post Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CollectionLedger;
