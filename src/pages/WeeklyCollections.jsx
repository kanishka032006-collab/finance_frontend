import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Coins,
  CreditCard,
  Building,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import ReceiptModal from '../components/common/ReceiptModal';

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

  useEffect(() => {
    if (selectedCustomerId) {
      const loadCustomerAccounts = async () => {
        try {
          const res = await api.get('/accounts', {
            params: { customerId: selectedCustomerId, status: 'ACTIVE' },
          });
          if (res.data.success) {
            setAccounts(res.data.accounts);
            if (res.data.accounts.length > 0) {
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

  useEffect(() => {
    if (selectedAccountId) {
      const loadAccount = async () => {
        try {
          setAccountLoading(true);
          const res = await api.get(`/accounts/${selectedAccountId}`);
          if (res.data.success) {
            setSelectedAccountDetails(res.data.account);
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
      setError('The collection amount cannot be greater than the outstanding balance.');
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
        notes: notes || null,
      };

      const res = await api.post('/payments', payload);
      if (res.data.success) {
        const receiptRes = await api.get(`/payments/receipt/${res.data.data.receiptNumber}`);
        if (receiptRes.data.success) {
          setGeneratedReceipt(receiptRes.data.receipt);
          setReceiptModalOpen(true);
        }
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#13A89E] via-[#2446A8] to-[#A58BEA]" />
        <span className="text-[11px] font-bold text-[#13A89E] uppercase tracking-wider">
          Field & Branch Operations
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
          Record Weekly Collection
        </h1>
        <p className="text-xs text-[#718096] mt-0.5">
          Process payments with real-time FIFO allocation, instant receipt generation & automatic ledger reconciliation
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FDF0F1] border border-[#E45B68]/35 flex items-start gap-3 text-xs text-[#C93D4B]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Collection Form (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                1. Select Customer / Borrower *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
              >
                <option value="">-- Choose Borrower --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerCode}) - {c.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                2. Select Active Finance Account *
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
                disabled={accounts.length === 0}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium disabled:opacity-50"
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
                    {a.accountNumber} (₹{a.agreedRepayment} | ₹{a.outstandingBalance})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                  Collection Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2446A8] font-bold text-base font-num">
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
                    className="w-full min-h-[46px] pl-8 pr-3.5 py-2.5 text-base font-extrabold font-num rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Payment Method *
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5">
                {[
                  { id: 'CASH', label: 'Cash', icon: Coins },
                  { id: 'UPI', label: 'UPI / QR', icon: CreditCard },
                  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-row xs:flex-col items-center justify-center min-h-[54px] xs:min-h-[68px] p-3 rounded-xl border text-xs font-bold transition gap-2 xs:gap-1.5 text-center ${
                        isSelected
                          ? 'bg-[#EEF2FC] border-[#2446A8] text-[#2446A8] ring-2 ring-[#2446A8]/20'
                          : 'bg-[#F5F7FC] border-[#E2E8F4] text-[#718096] hover:bg-[#EEF2FC]/50 hover:text-[#17233C]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#2446A8]' : 'text-[#718096]'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod !== 'CASH' && (
              <div className="space-y-3">
                {paymentMethod === 'UPI' && paymentAmountNum > 0 && (
                  <div className="p-4 rounded-xl bg-[#F5F7FC] border border-[#E2E8F4] flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-2.5 rounded-xl border border-[#E2E8F4] shadow-xs shrink-0">
                      <QRCodeSVG
                        value={`upi://pay?pa=tridin@upi&pn=Tridin%20Finance&am=${paymentAmountNum}&cu=INR&tn=${selectedAccountDetails?.accountNumber || 'COLLECTION'}`}
                        size={104}
                      />
                    </div>
                    <div className="text-xs space-y-1 text-center sm:text-left">
                      <p className="font-extrabold text-[#17233C] font-num">
                        UPI / QR — ₹{paymentAmountNum.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[#2446A8] font-code font-semibold">
                        {selectedAccountDetails?.accountNumber || ''}
                      </p>
                      <p className="text-[11px] text-[#718096]">
                        Enter the UTR / UPI Reference Number below after payment confirmation.
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                    Transaction / UPI Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. UPI/2026/8934789234 or UTR number"
                    className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-code rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Collection Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Field collection remarks, shop premise cash collection, etc."
                className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedAccountId || paymentAmountNum <= 0}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl text-sm font-extrabold btn-teal flex items-center justify-center gap-2 disabled:opacity-45 cursor-pointer"
            >
              <span>
                {loading ? 'Processing FIFO Allocation...' : 'Post Collection & Generate Receipt'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </button>
          </form>
        </div>

        {/* Live Account & FIFO Summary Box (1 column) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#17233C] uppercase tracking-wider pb-2.5 border-b border-[#E2E8F4] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#13A89E] shrink-0" />
              <span>Live Account & FIFO Preview</span>
            </h3>

            {accountLoading ? (
              <div className="py-8 text-center text-xs text-[#718096]">Loading ledger data...</div>
            ) : selectedAccountDetails ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-[#718096]">Account Number:</span>
                  <span className="font-code font-bold text-[#2446A8]">
                    {selectedAccountDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-[#718096]">Agreed Repayment:</span>
                  <span className="font-num font-bold text-[#17233C]">
                    ₹{selectedAccountDetails.summary?.totalAgreed?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-[#718096]">Total Collected So Far:</span>
                  <span className="font-num font-bold text-[#0D857D]">
                    ₹{selectedAccountDetails.summary?.totalPaid?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-[#718096]">Previous Outstanding:</span>
                  <span className="font-num font-bold text-[#B87718]">
                    ₹{currentOutstanding.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedAccountDetails.summary?.overdueAmount > 0 && (
                  <div className="flex justify-between gap-2 py-2 px-2.5 bg-[#FDF0F1] border border-[#E45B68]/30 rounded-xl text-[#C93D4B]">
                    <span className="font-bold">Overdue Amount:</span>
                    <span className="font-num font-extrabold">
                      ₹{selectedAccountDetails.summary.overdueAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="bg-gradient-to-br from-[#17233C] to-[#2446A8] text-white rounded-xl p-3.5 space-y-2 mt-3 shadow-sm">
                  <div className="flex justify-between items-center text-xs text-slate-200">
                    <span>Current Collection:</span>
                    <span className="font-num font-bold text-[#2BC2B8]">
                      -₹{paymentAmountNum.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-white/15 pt-2 flex justify-between items-center font-bold">
                    <span className="text-xs">New Remaining Balance:</span>
                    <span className="font-num text-base text-white">
                      ₹{remainingBalancePreview.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#718096]">
                  <p className="font-semibold text-[#17233C] mb-1">FIFO Rule Enforced:</p>
                  Oldest unpaid weekly instalments receive payment allocation first.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#718096]">
                -- Select Account --
              </div>
            )}
          </div>
        </div>
      </div>

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={generatedReceipt}
      />
    </div>
  );
};

export default WeeklyCollections;
