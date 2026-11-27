import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Wallet, SlidersHorizontal } from 'lucide-react';
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

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [adjType, setAdjType] = useState('WAIVER');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjMessage, setAdjMessage] = useState('');

  const navigate = useNavigate();
  const { isAdmin, canPerformTransactions } = useAuth();

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
        reason: adjReason,
      });
      if (res.data.success) {
        setAdjMessage('Adjustment recorded with audit trail!');
        setAdjAmount('');
        setAdjReason('');
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
    <div id="printable-area" className="space-y-4 sm:space-y-6">
      {/* Header and Account Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] to-[#13A89E]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[#2446A8] uppercase tracking-wider">
              Accounting Ledger
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
              Collection Ledger & FIFO Breakdown
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Week-by-week scheduled repayments, arrears tracking & payment allocations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full sm:w-auto sm:max-w-xs min-h-[42px] px-3.5 py-2 text-xs font-bold rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} - {a.customer?.name}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap items-center gap-2">
              {canPerformTransactions && (
                <button
                  type="button"
                  onClick={() => navigate(`/collections?accountId=${selectedAccountId}`)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-extrabold btn-teal flex-1 sm:flex-none"
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Record Collection</span>
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setAdjModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EEF2FC] hover:bg-[#DCE5FB] text-[#2446A8] border border-[#2446A8]/20 transition"
                  title="Record Ledger Adjustment / Waiver"
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>Adjustment Type</span>
                </button>
              )}
              <PrintPDFButton
                targetId="printable-area"
                title={`TRIDIN FINANCE – Collection Ledger ${account?.accountNumber || ''}`}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info Pill */}
      {account && (
        <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs">
          <div>
            <span className="text-[#718096] font-bold block uppercase text-[10px]">Customer:</span>
            <span className="font-extrabold text-[#17233C] text-sm block truncate">
              {account.customerName}
            </span>
            <span className="font-code text-[#718096] text-[10px]">{account.customerCode}</span>
          </div>
          <div>
            <span className="text-[#718096] font-bold block uppercase text-[10px]">Agreed Repayment:</span>
            <span className="font-num font-extrabold text-[#2446A8] text-sm block">
              ₹{account.agreedRepayment?.toLocaleString('en-IN')}
            </span>
            <span className="text-[#718096] text-[10px]">{account.totalWeeks} Weeks Schedule</span>
          </div>
          <div>
            <span className="text-[#718096] font-bold block uppercase text-[10px]">Disbursed Capital:</span>
            <span className="font-num font-bold text-[#17233C] text-sm block">
              ₹{account.actualDisbursed?.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[#718096] font-bold block uppercase text-[10px]">Gross Difference:</span>
            <span className="font-num font-bold text-[#6E4BC4] text-sm block">
              ₹{account.grossDifference?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="xs:col-span-2 sm:col-span-1">
            <span className="text-[#718096] font-bold block uppercase text-[10px]">Contract Status:</span>
            <div className="mt-1">
              <StatusBadge status={account.status} />
            </div>
          </div>
        </div>
      )}

      {/* Ledger Mobile Cards & Desktop Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
        {/* Mobile View */}
        <div className="md:hidden print:hidden divide-y divide-[#E2E8F4]">
          {loading ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096]">
              <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
              Loading ledger data...
            </div>
          ) : !ledger || ledger.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-[#718096]">No records found</div>
          ) : (
            ledger.map((row) => (
              <div key={row.id} className="p-4 space-y-2.5 hover:bg-[#F5F7FC]/60">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-[#17233C]">Week {row.weekNumber}</span>
                    <span className="text-xs text-[#718096] font-num ml-2">
                      {new Date(row.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#F5F7FC] border border-[#E2E8F4] rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase block">Scheduled Amount</span>
                    <span className="font-num font-bold text-[#17233C]">
                      ₹{row.scheduledAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase block">Paid Amount</span>
                    <span className="font-num font-bold text-[#0D857D]">
                      ₹{row.paidAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase block">Arrears (₹)</span>
                    <span className={`font-num font-bold ${row.arrears > 0 ? 'text-[#C93D4B]' : 'text-[#718096]'}`}>
                      ₹{(row.arrears || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase block">Remaining Balance (₹)</span>
                    <span className="font-num font-extrabold text-[#17233C]">
                      ₹{row.outstandingBalance?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {row.allocations && row.allocations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {row.allocations.map((alloc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => viewReceipt(alloc.payment?.receiptNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-code bg-[#EEF2FC] hover:bg-[#DCE5FB] text-[#2446A8] border border-[#2446A8]/20 transition"
                      >
                        <span>{alloc.payment?.receiptNumber}</span>
                        <span className="font-bold font-num">₹{Number(alloc.allocatedAmount)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop & Print Table */}
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-[#E2E8F4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#718096]">
                    <div className="inline-block w-6 h-6 border-2 border-[#E2E8F4] border-t-[#2446A8] rounded-full animate-spin mr-2 align-middle" />
                    Loading ledger data...
                  </td>
                </tr>
              ) : !ledger || ledger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#718096]">
                    No records found
                  </td>
                </tr>
              ) : (
                ledger.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F5F7FC]/70 transition">
                    <td className="py-3 px-4 font-bold text-[#17233C] whitespace-nowrap">
                      Week {row.weekNumber}
                    </td>
                    <td className="py-3 px-4 text-[#718096] font-num whitespace-nowrap">
                      {new Date(row.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-num font-medium text-[#17233C]">
                      ₹{row.scheduledAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-num font-bold text-[#0D857D]">
                      ₹{row.paidAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-num">
                      {row.arrears > 0 ? (
                        <span className="font-bold text-[#C93D4B]">
                          ₹{row.arrears?.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-[#718096]">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-num font-extrabold text-[#17233C]">
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
                              type="button"
                              onClick={() => viewReceipt(alloc.payment?.receiptNumber)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-code bg-[#EEF2FC] hover:bg-[#DCE5FB] text-[#2446A8] border border-[#2446A8]/20 transition"
                            >
                              <span>{alloc.payment?.receiptNumber}</span>
                              <span className="font-bold font-num">₹{Number(alloc.allocatedAmount)}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#718096] text-[10px]">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />

      {/* Adjustment Modal */}
      <Modal isOpen={adjModalOpen} onClose={() => setAdjModalOpen(false)} title="Record Ledger Adjustment / Waiver">
        <form onSubmit={handleRecordAdjustment} className="space-y-4">
          <p className="text-xs text-[#718096]">
            Record a formal penalty, waiver, discount, or correction with strict audit history tracking.
          </p>

          {adjMessage && (
            <div className="p-3 rounded-xl bg-[#EEF2FC] border border-[#2446A8]/20 text-xs font-semibold text-[#2446A8]">
              {adjMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase mb-1">Adjustment Type</label>
            <select
              value={adjType}
              onChange={(e) => setAdjType(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-xs rounded-xl border border-[#DCE4F2] bg-[#F5F7FC] text-[#17233C]"
            >
              <option value="WAIVER">Fee Waiver</option>
              <option value="PENALTY">Late Penalty</option>
              <option value="DISCOUNT">Settlement Discount</option>
              <option value="CORRECTION">Ledger Correction</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={adjAmount}
              onChange={(e) => setAdjAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full min-h-[42px] px-3 py-2 text-xs font-num font-bold rounded-xl border border-[#DCE4F2] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase mb-1">Audit Reason *</label>
            <textarea
              required
              rows={2}
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder="Specify justification for audit records..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE4F2] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse xs:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjModalOpen(false)}
              className="min-h-[40px] px-4 py-2 text-xs font-bold text-[#718096] hover:bg-[#F5F7FC] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjLoading}
              className="min-h-[40px] px-4 py-2 text-xs font-bold btn-teal rounded-xl"
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
