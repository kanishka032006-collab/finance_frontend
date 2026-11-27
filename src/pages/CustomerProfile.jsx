import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  PlusCircle,
  Clock,
  Printer,
  AlertOctagon,
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
  const [activeTab, setActiveTab] = useState('accounts');

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
          <div className="w-10 h-10 border-4 border-[#E2E8F4] border-t-[#2446A8] border-r-[#13A89E] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#718096]">Loading Customer Ledger...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F4] p-6">
        <p className="text-sm font-bold text-[#17233C]">Customer not found.</p>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="mt-3 px-4 py-2 btn-royal rounded-xl text-xs font-bold"
        >
          Back
        </button>
      </div>
    );
  }

  const { summary } = customer;

  return (
    <div id="printable-area" className="space-y-4 sm:space-y-6">
      {/* Top back bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-[#718096] hover:text-[#2446A8] hover:bg-white border border-transparent hover:border-[#E2E8F4] transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        {canPerformTransactions ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/accounts/new?customerId=${customer.id}`)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-[#EEF2FC] text-[#2446A8] border border-[#E2E8F4] rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/collections?customerId=${customer.id}`)}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-1.5 text-xs font-extrabold btn-teal rounded-xl"
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>Record Collection</span>
            </button>
            <PrintPDFButton
              targetId="printable-area"
              title={`TRIDIN FINANCE – Customer Profile: ${customer.name}`}
              compact
            />
          </div>
        ) : (
          <PrintPDFButton
            targetId="printable-area"
            title={`TRIDIN FINANCE – Customer Profile: ${customer.name}`}
            compact
          />
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] via-[#A58BEA] to-[#13A89E]" />
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0">
            {customer.name ? customer.name[0] : 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight break-words">
                {customer.name}
              </h1>
              <span className="font-code text-xs px-2.5 py-0.5 rounded-lg bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 font-bold">
                {customer.customerCode}
              </span>
              <StatusBadge status={customer.kycStatus} />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#718096]">
              <a href={`tel:${customer.mobile}`} className="flex items-center gap-1.5 text-[#2446A8] font-semibold font-num">
                <Phone className="w-3.5 h-3.5 shrink-0" /> {customer.mobile}
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#718096] shrink-0" /> {customer.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                {new Date(customer.startDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            {customer.notes && (
              <p className="mt-3 text-xs text-[#718096] bg-[#F5F7FC] p-3 rounded-xl border border-[#E2E8F4] italic">
                "{customer.notes}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5 Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E8F4] shadow-xs">
          <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Total Repayment</p>
          <p className="text-base sm:text-lg font-extrabold text-[#17233C] mt-1 font-num">
            ₹{(summary?.totalRepayment || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E2E8F4] shadow-xs">
          <p className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">Total Disbursed</p>
          <p className="text-base sm:text-lg font-extrabold text-[#2446A8] mt-1 font-num">
            ₹{(summary?.totalDisbursed || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#13A89E]/25 shadow-xs">
          <p className="text-[10px] font-bold text-[#0D857D] uppercase tracking-wider">Total Collected</p>
          <p className="text-base sm:text-lg font-extrabold text-[#0D857D] mt-1 font-num">
            ₹{(summary?.totalCollected || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E7A94B]/35 shadow-xs">
          <p className="text-[10px] font-bold text-[#B87718] uppercase tracking-wider">Outstanding</p>
          <p className="text-base sm:text-lg font-extrabold text-[#B87718] mt-1 font-num">
            ₹{(summary?.outstandingBalance || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="xs:col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-xl border-2 border-[#E45B68]/40 shadow-xs bg-[#FDF0F1]/75">
          <p className="text-[10px] font-bold text-[#C93D4B] uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 shrink-0" />
            <span>Overdue</span>
          </p>
          <p className="text-base sm:text-lg font-extrabold text-[#C93D4B] mt-1 font-num">
            ₹{(summary?.overdueAmount || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Next Due Date Banner */}
      {summary?.nextDueDate && (
        <div className="bg-[#EEF2FC] border border-[#2446A8]/20 rounded-2xl p-3.5 sm:p-4 flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs text-[#17233C]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#2446A8] shrink-0" />
            <span>
              Due Date:{' '}
              <strong className="text-[#2446A8]">
                {new Date(summary.nextDueDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </span>
          </div>
          {canPerformTransactions && (
            <button
              type="button"
              onClick={() => navigate(`/collections?customerId=${customer.id}`)}
              className="min-h-[38px] px-4 py-1.5 btn-royal font-bold rounded-xl self-start xs:self-auto"
            >
              Record Collection
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-[#E2E8F4] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'accounts'
              ? 'bg-gradient-to-r from-[#2446A8] to-[#345BD1] text-white shadow-sm'
              : 'bg-white text-[#718096] border border-[#E2E8F4] hover:text-[#17233C]'
          }`}
        >
          Finance Accounts ({customer.accounts?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-[#2446A8] to-[#345BD1] text-white shadow-sm'
              : 'bg-white text-[#718096] border border-[#E2E8F4] hover:text-[#17233C]'
          }`}
        >
          Payment History ({customer.payments?.length || 0})
        </button>
      </div>

      {/* Tab 1: Finance Accounts & Weekly Ledgers */}
      {activeTab === 'accounts' && (
        <div className="space-y-5">
          {customer.accounts?.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E2E8F4] text-center text-xs text-[#718096]">
              No records found
            </div>
          ) : (
            customer.accounts?.map((acc) => (
              <div key={acc.id} className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
                {/* Account Header */}
                <div className="p-4 sm:p-5 border-b border-[#E2E8F4] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F5F7FC]/75">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#17233C] to-[#2446A8] text-white flex items-center justify-center font-code font-bold text-xs shrink-0">
                      #{acc.accountNumber.split('-')[2] || 'ACC'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-code font-extrabold text-sm text-[#2446A8]">
                          {acc.accountNumber}
                        </span>
                        <StatusBadge status={acc.status} />
                      </div>
                      <p className="text-xs text-[#718096] mt-0.5">
                        {acc.totalWeeks} Weeks • {acc.dueDay} •{' '}
                        {new Date(acc.firstDueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Account Financials */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#718096] block uppercase">Disbursed</span>
                      <span className="font-num font-bold text-[#17233C]">
                        ₹{Number(acc.actualDisbursed).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#718096] block uppercase">Agreed</span>
                      <span className="font-num font-bold text-[#2446A8]">
                        ₹{Number(acc.agreedRepayment).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#718096] block uppercase">Gross Diff</span>
                      <span className="font-num font-bold text-[#6E4BC4]">
                        ₹{Number(acc.grossDifference).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#718096] block uppercase">Weekly Installment</span>
                      <span className="font-num font-extrabold text-[#0D857D]">
                        ₹{Number(acc.weeklyInstalment).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards View for Instalments */}
                <div className="md:hidden print:hidden divide-y divide-[#E2E8F4]">
                  {acc.instalments?.map((inst) => {
                    const sched = Number(inst.scheduledAmount);
                    const paid = Number(inst.paidAmount);
                    return (
                      <div key={inst.id} className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-[#17233C]">Week {inst.weekNumber}</span>
                            <span className="text-[11px] text-[#718096] font-num ml-2">
                              {new Date(inst.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          <StatusBadge status={inst.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F5F7FC] p-2.5 rounded-xl border border-[#E2E8F4]">
                          <div>
                            <span className="text-[10px] text-[#718096] block">Scheduled Amount</span>
                            <span className="font-num font-bold text-[#17233C]">₹{sched.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#718096] block">Paid Amount</span>
                            <span className="font-num font-bold text-[#0D857D]">₹{paid.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        {inst.allocations && inst.allocations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {inst.allocations.map((a, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => viewReceipt(a.payment?.receiptNumber)}
                                className="font-code text-[10px] text-[#2446A8] bg-[#EEF2FC] px-2 py-1 rounded-lg border border-[#2446A8]/20"
                              >
                                {a.payment?.receiptNumber} (₹{Number(a.allocatedAmount)})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop & Print Ledger Table */}
                <div className="hidden md:block print:block overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold text-[10px] uppercase">
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
                    <tbody className="divide-y divide-[#E2E8F4]">
                      {acc.instalments?.map((inst) => {
                        const sched = Number(inst.scheduledAmount);
                        const paid = Number(inst.paidAmount);
                        return (
                          <tr key={inst.id} className="hover:bg-[#F5F7FC]/60">
                            <td className="py-2.5 px-3 font-bold text-[#17233C]">Week {inst.weekNumber}</td>
                            <td className="py-2.5 px-3 text-[#718096] font-num">
                              {new Date(inst.dueDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-num font-medium text-[#17233C]">
                              ₹{sched.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right font-num font-bold text-[#0D857D]">
                              ₹{paid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <StatusBadge status={inst.status} />
                            </td>
                            <td className="py-2.5 px-3 text-center text-[#718096] font-num text-[11px]">
                              {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('en-IN') : '—'}
                            </td>
                            <td className="py-2.5 px-3">
                              {inst.allocations && inst.allocations.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {inst.allocations.map((a, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => viewReceipt(a.payment?.receiptNumber)}
                                      className="font-code text-[10px] text-[#2446A8] bg-[#EEF2FC] px-2 py-0.5 rounded-md border border-[#2446A8]/20 hover:bg-[#DCE5FB]"
                                    >
                                      {a.payment?.receiptNumber} (₹{Number(a.allocatedAmount)})
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[#718096] text-[10px]">Pending</span>
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
        <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
          {/* Mobile Payments Cards */}
          <div className="md:hidden print:hidden divide-y divide-[#E2E8F4]">
            {customer.payments?.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-[#718096]">No records found</div>
            ) : (
              customer.payments?.map((p) => (
                <div key={p.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-code font-bold text-xs text-[#2446A8] block">
                        {p.receiptNumber}
                      </span>
                      <span className="text-[11px] text-[#718096] font-num">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')} • {p.account?.accountNumber}
                      </span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-xs text-[#718096]">
                      <span className="font-semibold text-[#17233C] block">{p.paymentMethod}</span>
                      <span>{p.collector?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-num font-extrabold text-sm text-[#0D857D]">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => viewReceipt(p.receiptNumber)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-[#EEF2FC] text-[#2446A8]"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block print:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Account #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Collector</th>
                  <th className="py-3 px-4 text-center no-print">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F4]">
                {customer.payments?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#718096]">
                      No records found
                    </td>
                  </tr>
                ) : (
                  customer.payments?.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F5F7FC]/60">
                      <td className="py-3 px-4 font-code font-bold text-[#2446A8]">{p.receiptNumber}</td>
                      <td className="py-3 px-4 text-[#718096] font-num">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-code text-[#17233C]">{p.account?.accountNumber}</td>
                      <td className="py-3 px-4 font-bold text-[#17233C]">
                        {p.paymentMethod} {p.reference ? `(${p.reference})` : ''}
                      </td>
                      <td className="py-3 px-4 text-right font-num font-extrabold text-[#0D857D]">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3 px-4 text-[#17233C]">{p.collector?.name}</td>
                      <td className="py-3 px-4 text-center no-print">
                        <button
                          type="button"
                          onClick={() => viewReceipt(p.receiptNumber)}
                          className="p-1.5 rounded-lg text-[#718096] hover:text-[#2446A8] hover:bg-[#EEF2FC] transition"
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
