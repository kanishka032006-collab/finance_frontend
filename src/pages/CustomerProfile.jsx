import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  PlusCircle,
  Clock,
  Printer,
  AlertOctagon,
  FileText,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PrintPDFButton from '../components/common/PrintPDFButton';
import ReceiptModal from '../components/common/ReceiptModal';
import { useAuth } from '../context/AuthContext';

const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts'); // accounts | payments

  const navigate = useNavigate();
  const { canPerformTransactions } = useAuth();

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setCustomer(res.data.customer);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-[#BFE23A] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Loading Customer Ledger...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-sm font-bold text-slate-700">Customer not found.</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const { summary } = customer;

  return (
    <div id="printable-area" className="space-y-6">
      {/* Top back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
        {canPerformTransactions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/accounts/new?customerId=${customer.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4" /> New Finance Account
            </button>
            <button
              onClick={() => navigate(`/collections?customerId=${customer.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 rounded-xl shadow-xs transition"
            >
              <Wallet className="w-4 h-4" /> Record Collection
            </button>
            <PrintPDFButton targetId="printable-area" title={`TRIDIN FINANCE â€“ Customer Profile: ${customer.name}`} compact />
          </div>
        )}
        {!canPerformTransactions && (
          <PrintPDFButton targetId="printable-area" title={`TRIDIN FINANCE â€“ Customer Profile: ${customer.name}`} compact />
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF2E9] border-2 border-stone-200 text-slate-900 font-black text-2xl flex items-center justify-center shadow-xs shrink-0">
              {customer.name ? customer.name[0] : 'C'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-stone-100 text-slate-600 font-bold">
                  {customer.customerCode}
                </span>
                <StatusBadge status={customer.kycStatus} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.mobile}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.address}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since{' '}
                  {new Date(customer.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              {customer.notes && (
                <p className="mt-2 text-xs text-slate-500 bg-[#FAF2E9]/60 p-2.5 rounded-lg border border-stone-100 italic">
                  "{customer.notes}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Financial Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Repayment</p>
          <p className="text-lg font-black text-slate-900 mt-1 font-mono">
            ₹{summary?.totalRepayment?.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Disbursed</p>
          <p className="text-lg font-black text-slate-700 mt-1 font-mono">
            ₹{summary?.totalDisbursed?.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Collected</p>
          <p className="text-lg font-black text-emerald-700 mt-1 font-mono">
            ₹{summary?.totalCollected?.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Outstanding</p>
          <p className="text-lg font-black text-amber-700 mt-1 font-mono">
            ₹{summary?.outstandingBalance?.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-xs bg-red-50/20 col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> Overdue
          </p>
          <p className="text-lg font-black text-[#E10600] mt-1 font-mono">
            ₹{summary?.overdueAmount?.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Next Due Date Banner */}
      {summary?.nextDueDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              Next Scheduled Collection: <strong>{new Date(summary.nextDueDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </span>
          </div>
          {canPerformTransactions && (
            <button
              onClick={() => navigate(`/collections?customerId=${customer.id}`)}
              className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              Collect Now
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'accounts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          Finance Accounts & Weekly Ledgers ({customer.accounts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-stone-200/60'
          }`}
        >
          Payment History ({customer.payments?.length || 0})
        </button>
      </div>

      {/* Tab 1: Finance Accounts & Weekly Ledgers */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {customer.accounts?.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-slate-400">
              No finance accounts active for this customer.
            </div>
          ) : (
            customer.accounts?.map((acc) => (
              <div key={acc.id} className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
                {/* Account Header */}
                <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4 bg-[#FAF2E9]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                      #{acc.accountNumber.split('-')[2]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-900">{acc.accountNumber}</span>
                        <StatusBadge status={acc.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {acc.totalWeeks} Weeks â€¢ Due Day: <strong>{acc.dueDay}</strong> â€¢ First Due:{' '}
                        {new Date(acc.firstDueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Account Financials */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Disbursed</span>
                      <span className="font-bold text-slate-800">₹{Number(acc.actualDisbursed).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Agreed</span>
                      <span className="font-bold text-slate-900">₹{Number(acc.agreedRepayment).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Gross Diff</span>
                      <span className="font-bold text-purple-700">₹{Number(acc.grossDifference).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Weekly Installment</span>
                      <span className="font-extrabold text-slate-900">₹{Number(acc.weeklyInstalment).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Repayment Weekly Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Week #</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Scheduled Amount</th>
                        <th className="py-2.5 px-3 text-right">Paid Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-center">Paid Date</th>
                        <th className="py-2.5 px-3">Allocation Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {acc.instalments?.map((inst) => {
                        const sched = Number(inst.scheduledAmount);
                        const paid = Number(inst.paidAmount);
                        return (
                          <tr key={inst.id} className="hover:bg-stone-50/50">
                            <td className="py-2 px-3 font-bold text-slate-800">Week {inst.weekNumber}</td>
                            <td className="py-2 px-3 text-slate-600 font-mono">
                              {new Date(inst.dueDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                              ₹{sched.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              ₹{paid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <StatusBadge status={inst.status} />
                            </td>
                            <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                              {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('en-IN') : 'â€”'}
                            </td>
                            <td className="py-2 px-3">
                              {inst.allocations && inst.allocations.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {inst.allocations.map((a, i) => (
                                    <button
                                      key={i}
                                      onClick={() => viewReceipt(a.payment?.receiptNumber)}
                                      className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                                    >
                                      {a.payment?.receiptNumber} (₹{Number(a.allocatedAmount)})
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Payment History */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF2E9]/60 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Account #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Collector</th>
                  <th className="py-3 px-4 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customer.payments?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payments recorded yet for this customer.
                    </td>
                  </tr>
                ) : (
                  customer.payments?.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{p.account?.accountNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {p.paymentMethod} {p.reference ? `(${p.reference})` : ''}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.collector?.name}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => viewReceipt(p.receiptNumber)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-stone-100 transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default CustomerProfile;
