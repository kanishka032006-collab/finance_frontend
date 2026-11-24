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
  FileSpreadsheet,
  Clock,
  Printer,
  ChevronRight,
  Coins,
  ShieldCheck,
  UserCog,
  Settings,
  Database
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
  Line
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-[#BFE23A] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Gathering Executive Financial Intelligence...</p>
        </div>
      </div>
    );
  }

  const { metrics, charts, recentTransactions, overdueCustomers } = data || {};

  return (
    <div id="printable-area" className="space-y-6">
      {/* Top Banner & Admin Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Administrator Executive Console
            </span>
            <span className="text-xs text-slate-400">â€¢ Full Root Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Management Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Capital deployment, gross revenue yield, staff operations & risk exposure</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/customers/new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-800 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-600" />
            Add Customer
          </button>
          <button
            onClick={() => navigate('/accounts/new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-800 transition"
          >
            <PlusCircle className="w-4 h-4 text-slate-600" />
            Create Account
          </button>
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition"
          >
            <Wallet className="w-4 h-4 text-slate-900" />
            Record Collection
          </button>
          <button
            onClick={() => navigate('/staff')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition"
          >
            <UserCog className="w-4 h-4" />
            Manage Staff
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <PrintPDFButton targetId="printable-area" title="TRIDIN FINANCE â€“ Executive Dashboard" />
        </div>
      </div>

      {/* 9 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Customers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalCustomers || 0}</h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">Registered borrowers</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Disbursed Capital</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ₹{(metrics?.totalAmountDisbursed || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-600">Principle deployed</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Total Scheduled Repayment */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scheduled Repayment</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ₹{(metrics?.totalScheduledRepayment || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">Contractual portfolio value</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Total Collections Received */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between bg-gradient-to-br from-white to-[#BFE23A]/10">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Collections Received</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              ₹{(metrics?.totalCollectionsReceived || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-bold text-emerald-800">
              {metrics?.recoveryRate}% overall recovery rate
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#BFE23A] text-slate-950 font-bold shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outstanding Balance */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outstanding Balance</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1 font-mono">
              ₹{(metrics?.totalOutstandingBalance || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">Remaining receivable</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Overdue Amount (Crimson highlight!) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-red-300 shadow-card flex items-start justify-between bg-red-50/40">
          <div>
            <p className="text-xs font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
              Total Overdue Amount
            </p>
            <h3 className="text-2xl font-black text-[#E10600] mt-1 font-mono">
              ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-bold text-[#E10600]">
              {metrics?.overdueRate}% portfolio risk exposure
            </span>
          </div>
          <div className="p-3 rounded-xl bg-red-100 text-[#E10600] border border-red-200">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* Expected Gross Difference */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Gross Difference</p>
            <h3 className="text-2xl font-black text-purple-800 mt-1 font-mono">
              ₹{(metrics?.expectedGrossDifference || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500">Repayment - Disbursed</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Collected Gross Difference */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collected Gross Difference</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              ₹{(metrics?.collectedGrossDifference || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700">Realized gross profit</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Due Collections */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Due Collections</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ₹{(metrics?.todayDueCollections?.amount || 0).toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-semibold text-sky-700">
              {metrics?.todayDueCollections?.count || 0} scheduled instalments
            </span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Yield Curve</h3>
              <p className="text-xs text-slate-500">Gross collection recovery trends</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#FAF2E9] rounded-lg text-slate-700 border border-stone-200">
              Last 6 Months
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthly || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ede8" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Collected Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="collected" fill="#BFE23A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Consistency</h3>
              <p className="text-xs text-slate-500">Weekly collection trajectory</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-stone-100 rounded-lg text-slate-700">
              Rolling 7 Weeks
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.weekly || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ede8" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Collected Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke="#0F172A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#BFE23A', stroke: '#0F172A', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column: Recent Transactions & Overdue Borrowers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF2E9]/40">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest field & bank collections posted</p>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {recentTransactions?.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {t.paymentMethod === 'UPI' ? 'UPI' : t.paymentMethod === 'CASH' ? '₹' : 'BK'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{t.customer?.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{t.account?.accountNumber}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {new Date(t.paymentDate).toLocaleDateString('en-IN')} â€¢ By {t.collector?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 font-mono block">
                      +₹{Number(t.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.receiptNumber}</span>
                  </div>
                  <button
                    onClick={() => viewReceipt(t.receiptNumber)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Borrowers */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-red-50/40">
            <div>
              <h3 className="text-base font-bold text-[#E10600] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Priority Overdue Accounts
              </h3>
              <p className="text-xs text-slate-500">Top delinquent borrower accounts requiring administrative action</p>
            </div>
            <button
              onClick={() => navigate('/reports?tab=overdue')}
              className="text-xs font-bold text-[#E10600] hover:underline flex items-center gap-1"
            >
              Export Overdue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {overdueCustomers?.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-red-50/20 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{c.customerCode}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mobile: {c.mobile} â€¢ {c.missedWeeks} week(s) missed
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#E10600] font-mono block">
                    ₹{c.overdueAmount?.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline mt-0.5"
                  >
                    View Ledger
                  </button>
                </div>
              </div>
            ))}
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
