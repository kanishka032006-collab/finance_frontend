import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  TrendingUp,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowUpRight,
  PlusCircle,
  Clock,
  Printer,
  ChevronRight,
  Coins,
  UserCog,
  Settings,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import api from '../services/api';
import ReceiptModal from '../components/common/ReceiptModal';
import PrintPDFButton from '../components/common/PrintPDFButton';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const viewReceipt = async (receiptNumber) => {
    try {
      const res = await api.get(`/payments/receipt/${receiptNumber}`);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-10 h-10 border-4 border-[#E2E8F4] border-t-[#2446A8] border-r-[#13A89E] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#718096]">Gathering Executive Financial Intelligence...</p>
        </div>
      </div>
    );
  }

  const { metrics, charts, recentTransactions, overdueCustomers } = data || {};

  return (
    <div id="printable-area" className="space-y-4 sm:space-y-6">
      {/* Top Banner & Admin Quick Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] via-[#13A89E] to-[#A58BEA]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4F0FE] text-[#6E4BC4] border border-[#A58BEA]/35">
                Administrator Executive Console
              </span>
              <span className="text-xs text-[#718096]">• Full Root Controls</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
              Executive Management Dashboard
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Capital deployment, gross revenue yield, staff operations & risk exposure
            </p>
          </div>

          <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/customers/new')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold bg-[#F5F7FC] hover:bg-[#EEF2FC] text-[#17233C] border border-[#E2E8F4] transition"
            >
              <PlusCircle className="w-4 h-4 text-[#2446A8] shrink-0" />
              <span className="truncate">Add Customer</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/accounts/new')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold bg-[#F5F7FC] hover:bg-[#EEF2FC] text-[#17233C] border border-[#E2E8F4] transition"
            >
              <PlusCircle className="w-4 h-4 text-[#13A89E] shrink-0" />
              <span className="truncate">Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="col-span-2 xs:col-span-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-extrabold btn-teal"
            >
              <Wallet className="w-4 h-4 text-white shrink-0" />
              <span>Record Collection</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold bg-[#F4F0FE] hover:bg-[#E9E1FC] text-[#6E4BC4] border border-[#A58BEA]/35 transition"
            >
              <UserCog className="w-4 h-4 shrink-0" />
              <span className="truncate">Manage Staff</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold bg-[#F5F7FC] hover:bg-[#EEF2FC] text-[#17233C] border border-[#E2E8F4] transition"
            >
              <Settings className="w-4 h-4 text-[#718096] shrink-0" />
              <span className="truncate">Settings</span>
            </button>
            <PrintPDFButton
              targetId="printable-area"
              title="TRIDIN FINANCE – Executive Dashboard"
              className="col-span-2 xs:col-span-1"
            />
          </div>
        </div>
      </div>

      {/* 9 Metrics Grid: 1-col on <360px, 2-col on 360px+, 3-col on lg+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Total Active Customers
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#17233C] mt-1 font-num">
              {metrics?.totalCustomers || 0}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#718096]">
              Registered borrowers
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Total Disbursed Capital
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#17233C] mt-1 font-num break-words">
              ₹{(metrics?.totalAmountDisbursed || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#0D857D]">
              Principle deployed
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E6F8F7] text-[#0D857D] border border-[#13A89E]/20 shrink-0">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Scheduled Repayment */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Total Scheduled Repayment
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#2446A8] mt-1 font-num break-words">
              ₹{(metrics?.totalScheduledRepayment || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#718096]">
              Contractual portfolio value
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Collections Received */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#13A89E]/35 shadow-card flex items-start justify-between gap-2 bg-gradient-to-br from-white via-white to-[#E6F8F7] min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#0D857D] uppercase tracking-wider">
              Total Collections Received
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#0D857D] mt-1 font-num break-words">
              ₹{(metrics?.totalCollectionsReceived || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-bold text-[#13A89E]">
              {metrics?.recoveryRate}% overall recovery rate
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-[#13A89E] to-[#0D857D] text-white shadow-sm shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Outstanding Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E7A94B]/35 shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Total Outstanding Balance
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#B87718] mt-1 font-num break-words">
              ₹{(metrics?.totalOutstandingBalance || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#718096]">
              Remaining receivable
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#FDF6E8] text-[#C7882C] border border-[#E7A94B]/30 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Total Overdue Amount */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#E45B68]/40 shadow-card flex items-start justify-between gap-2 bg-[#FDF0F1]/75 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#C93D4B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E45B68] animate-ping shrink-0" />
              <span>Total Overdue Amount</span>
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#C93D4B] mt-1 font-num break-words">
              ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-bold text-[#E45B68]">
              {metrics?.overdueRate}% portfolio risk exposure
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E45B68]/15 text-[#C93D4B] border border-[#E45B68]/30 shrink-0">
            <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Expected Gross Difference */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Expected Gross Difference
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#6E4BC4] mt-1 font-num break-words">
              ₹{(metrics?.expectedGrossDifference || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#718096]">
              Repayment - Disbursed
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#F4F0FE] text-[#6E4BC4] border border-[#A58BEA]/30 shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Collected Gross Difference */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
              Collected Gross Difference
            </p>
            <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#0D857D] mt-1 font-num break-words">
              ₹{(metrics?.collectedGrossDifference || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#13A89E]">
              Realized gross profit
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#E6F8F7] text-[#13A89E] border border-[#13A89E]/25 shrink-0">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Today's Due Collections - spans 2 cols on xs (360-639px) so 9-card grid stays symmetric */}
        <div className="xs:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-[#EEF2FC]/70 p-4 sm:p-5 rounded-2xl border border-[#2446A8]/20 shadow-card flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#2446A8] uppercase tracking-wider">
              Today's Due Collections
            </p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#17233C] mt-1 font-num break-words">
              ₹{(metrics?.todayDueCollections?.amount || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#2446A8]">
              {metrics?.todayDueCollections?.count || 0} scheduled instalments
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-[#2446A8] to-[#345BD1] text-white shadow-sm shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#17233C]">Monthly Yield Curve</h3>
              <p className="text-xs text-[#718096]">Gross collection recovery trends</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-[#EEF2FC] rounded-lg text-[#2446A8] border border-[#2446A8]/15 shrink-0">
              Last 6 Months
            </span>
          </div>
          <div className="h-56 sm:h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthly || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="royalTealBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2446A8" />
                    <stop offset="100%" stopColor="#13A89E" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F4" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#718096"
                  tick={{ fill: '#718096', fontSize: 11 }}
                  axisLine={{ stroke: '#E2E8F4' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  width={46}
                  stroke="#718096"
                  tick={{ fill: '#718096', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collected Amount']}
                  contentStyle={{
                    backgroundColor: '#17233C',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid rgba(165, 139, 234, 0.3)',
                    boxShadow: '0 12px 28px rgba(23, 35, 60, 0.25)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="collected" fill="url(#royalTealBar)" radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#17233C]">Weekly Consistency</h3>
              <p className="text-xs text-[#718096]">Weekly collection trajectory</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-[#E6F8F7] rounded-lg text-[#0D857D] border border-[#13A89E]/20 shrink-0">
              Rolling 7 Weeks
            </span>
          </div>
          <div className="h-56 sm:h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.weekly || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F4" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#718096"
                  tick={{ fill: '#718096', fontSize: 11 }}
                  axisLine={{ stroke: '#E2E8F4' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  width={46}
                  stroke="#718096"
                  tick={{ fill: '#718096', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collected Amount']}
                  contentStyle={{
                    backgroundColor: '#17233C',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid rgba(19, 168, 158, 0.35)',
                    boxShadow: '0 12px 28px rgba(23, 35, 60, 0.25)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="#2446A8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#13A89E', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#E7A94B', stroke: '#17233C', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column: Recent Transactions & Overdue Borrowers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F4] flex items-center justify-between gap-2 bg-[#F5F7FC]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#17233C]">Recent Transactions</h3>
              <p className="text-xs text-[#718096]">Latest field & bank collections posted</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payments')}
              className="text-xs font-bold text-[#2446A8] hover:text-[#1B3685] flex items-center gap-1 shrink-0 min-h-[36px] px-2 rounded-lg hover:bg-[#EEF2FC] transition"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {recentTransactions?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No data available</div>
            ) : (
              recentTransactions?.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F5F7FC]/60 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/15 flex items-center justify-center font-bold text-xs shrink-0 font-num">
                      {t.paymentMethod === 'UPI' ? 'UPI' : t.paymentMethod === 'CASH' ? '₹' : 'BK'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-xs font-bold text-[#17233C] truncate">{t.customer?.name}</span>
                        <span className="text-[10px] font-code text-[#718096]">{t.account?.accountNumber}</span>
                      </div>
                      <p className="text-[11px] text-[#718096] truncate">
                        {new Date(t.paymentDate).toLocaleDateString('en-IN')} • {t.collector?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-[#0D857D] font-num block">
                        +₹{Number(t.amount).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#718096] font-code">{t.receiptNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => viewReceipt(t.receiptNumber)}
                      aria-label="Print Receipt"
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#718096] hover:text-[#2446A8] hover:bg-[#EEF2FC] transition"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Borrowers */}
        <div className="bg-white rounded-2xl border border-[#E45B68]/30 shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E45B68]/20 flex items-center justify-between gap-2 bg-[#FDF0F1]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#C93D4B] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>Priority Overdue Accounts</span>
              </h3>
              <p className="text-xs text-[#718096]">
                Top delinquent borrower accounts requiring administrative action
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/reports?tab=overdue')}
              className="text-xs font-bold text-[#C93D4B] hover:underline flex items-center gap-1 shrink-0 min-h-[36px]"
            >
              Export <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {overdueCustomers?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#0D857D] font-bold">
                No overdue accounts currently!
              </div>
            ) : (
              overdueCustomers?.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FDF0F1]/35 transition"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-bold text-[#17233C] truncate">{c.name}</span>
                      <span className="text-[10px] font-code text-[#718096]">{c.customerCode}</span>
                    </div>
                    <p className="text-[11px] text-[#718096] truncate">
                      {c.mobile} • {c.missedWeeks}w
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-[#C93D4B] font-num block">
                      ₹{c.overdueAmount?.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/customers/${c.id}`)}
                      className="text-[11px] font-bold text-[#2446A8] hover:underline mt-0.5"
                    >
                      View Collection Ledger
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default AdminDashboard;
