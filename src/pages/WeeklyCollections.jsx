import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Coins,
  CreditCard,
  Building,
  Receipt,
  Printer,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import ReceiptModal from '../components/common/ReceiptModal';
import StatusBadge from '../components/common/StatusBadge';

const WeeklyCollections = () => {
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';
  const initialAccountId = searchParams.get('accountId') || '';

  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState(null);

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  const navigate = useNavigate();

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await api.get('/customers', { params: { active: true, limit: 100 } });
        if (res.data.success) {
          setCustomers(res.data.customers);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  // When customer changes, load customer's accounts
  useEffect(() => {
    if (selectedCustomerId) {
      const loadCustomerAccounts = async () => {
        try {
          const res = await api.get('/accounts', {
            params: { customerId: selectedCustomerId, status: 'ACTIVE' }
          });
          if (res.data.success) {
            setAccounts(res.data.accounts);
            if (res.data.accounts.length > 0) {
              // If initialAccountId belongs to this customer, select it, else select first
              const match = res.data.accounts.find((a) => a.id === initialAccountId);
              setSelectedAccountId(match ? match.id : res.data.accounts[0].id);
            } else {
              setSelectedAccountId('');
              setSelectedAccountDetails(null);
            }
          }
        } catch (err) {
          console.error('Failed to load accounts for customer:', err);
        }
      };
      loadCustomerAccounts();
    } else {
      setAccounts([]);
      setSelectedAccountId('');
      setSelectedAccountDetails(null);
    }
  }, [selectedCustomerId]);

  // When account changes, load its full details
  useEffect(() => {
    if (selectedAccountId) {
      const loadAccount = async () => {
        try {
          setAccountLoading(true);
          const res = await api.get(`/accounts/${selectedAccountId}`);
          if (res.data.success) {
            setSelectedAccountDetails(res.data.account);
            // Default suggested amount to weekly instalment or overdue
            const summary = res.data.account.summary;
            if (summary.overdueAmount > 0) {
              setAmount(String(summary.overdueAmount));
            } else {
              setAmount(String(res.data.account.weeklyInstalment));
            }
          }
        } catch (err) {
          console.error('Failed to load account details:', err);
        } finally {
          setAccountLoading(false);
        }
      };
      loadAccount();
    } else {
      setSelectedAccountDetails(null);
      setAmount('');
    }
  }, [selectedAccountId]);

  // FIFO preview calculation
  const paymentAmountNum = parseFloat(amount) || 0;
  const currentOutstanding = selectedAccountDetails?.summary?.outstandingBalance || 0;
  const remainingBalancePreview = Math.max(0, currentOutstanding - paymentAmountNum);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedAccountId) {
      setError('Please select an active finance account.');
      return;
    }
    if (paymentAmountNum <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (paymentAmountNum > currentOutstanding) {
      setError(`Payment amount (₹${paymentAmountNum}) cannot exceed total outstanding balance (₹${currentOutstanding}).`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        accountId: selectedAccountId,
        customerId: selectedCustomerId,
        amount: paymentAmountNum,
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod,
        reference: reference || null,
        notes: notes || null
      };

      const res = await api.post('/payments', payload);
      if (res.data.success) {
        // Fetch complete receipt for modal
        const receiptRes = await api.get(`/payments/receipt/${res.data.data.receiptNumber}`);
        if (receiptRes.data.success) {
          setGeneratedReceipt(receiptRes.data.receipt);
          setReceiptModalOpen(true);
        }
        // Refresh account details
        const refreshedAcc = await api.get(`/accounts/${selectedAccountId}`);
        if (refreshedAcc.data.success) {
          setSelectedAccountDetails(refreshedAcc.data.account);
          setAmount(String(refreshedAcc.data.account.weeklyInstalment));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment collection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Field & Branch Operations</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Record Weekly Collection</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Process payments with real-time FIFO allocation, instant receipt generation & automatic ledger reconciliation
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-[#E10600]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Form (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-card p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Select Customer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Select Customer / Borrower *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-medium"
              >
                <option value="">-- Choose Borrower --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerCode}) - {c.mobile}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Finance Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Select Active Finance Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
                disabled={accounts.length === 0}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-mono font-medium disabled:opacity-50"
              >
                <option value="">
                  {selectedCustomerId
                    ? accounts.length > 0
                      ? '-- Select Account --'
                      : 'No Active Accounts found for this customer'
                    : '-- Select Customer First --'}
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} (Agreed: ₹{a.agreedRepayment} | Outstanding: ₹{a.outstandingBalance})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Collection Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-3.5 py-2.5 text-base font-black font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-900"
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-medium"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CASH', label: 'Cash', icon: Coins },
                  { id: 'UPI', label: 'UPI / QR', icon: CreditCard },
                  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition gap-1.5 ${
                        isSelected
                          ? 'bg-[#BFE23A]/20 border-[#BFE23A] text-slate-900 ring-2 ring-[#BFE23A]'
                          : 'bg-stone-50 border-stone-200 text-slate-600 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-slate-800" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Number */}
            {paymentMethod !== 'CASH' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transaction / UPI Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. UPI/2026/8934789234 or UTR number"
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Collection Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Field collection remarks, shop premise cash collection, etc."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedAccountId || paymentAmountNum <= 0}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              {loading ? 'Processing FIFO Allocation...' : 'Post Collection & Generate Receipt'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Live Account & FIFO Summary Box (1 column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Account & FIFO Preview
            </h3>

            {accountLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading ledger data...</div>
            ) : selectedAccountDetails ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedAccountDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Agreed Repayment:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{selectedAccountDetails.summary?.totalAgreed?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Collected So Far:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{selectedAccountDetails.summary?.totalPaid?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Previous Outstanding:</span>
                  <span className="font-mono font-bold text-amber-700">
                    ₹{currentOutstanding.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedAccountDetails.summary?.overdueAmount > 0 && (
                  <div className="flex justify-between py-1 bg-red-50 p-2 rounded-lg text-[#E10600]">
                    <span className="font-bold">Overdue Amount:</span>
                    <span className="font-mono font-black">
                      ₹{selectedAccountDetails.summary.overdueAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Real-time deduction box */}
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2 mt-3">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Current Collection:</span>
                    <span className="font-mono font-bold text-[#BFE23A]">
                      -₹{paymentAmountNum.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                    <span>New Remaining Balance:</span>
                    <span className="font-mono text-base text-white">
                      ₹{remainingBalancePreview.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">FIFO Rule Enforced:</p>
                  Oldest unpaid weekly instalments receive payment allocation first. All records are cryptographically secured.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select a customer and finance account to preview FIFO balances.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={generatedReceipt}
      />
    </div>
  );
};

export default WeeklyCollections;
