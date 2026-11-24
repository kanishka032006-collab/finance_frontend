import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  Printer,
  Search,
  UserCheck,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Coins
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ReceiptModal from '../components/common/ReceiptModal';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const CollectorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchCollectorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load collector dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectorData();
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
          <p className="text-xs font-bold text-slate-600">Loading Field Collection Route...</p>
        </div>
      </div>
    );
  }

  const { metrics, collectorStats, todayDueList = [], overdueCustomers = [] } = data || {};

  // Filter today's list based on search
  const filteredTodayDue = todayDueList.filter((item) => {
    if (!routeSearch) return true;
    const q = routeSearch.toLowerCase();
    return (
      item.customerName?.toLowerCase().includes(q) ||
      item.customerCode?.toLowerCase().includes(q) ||
      item.mobile?.includes(q) ||
      item.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div id="printable-area" className="space-y-6">
      {/* Top Banner & Quick Collection Hero */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              Field Collection Officer Console
            </span>
            <span className="text-xs text-slate-400 font-medium">Logged in: {user?.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Field Route & Collection Portal</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time borrower route list, weekly cash/UPI collection & instant receipt generation</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/customers/new')}
            className="px-4 py-2.5 text-xs font-bold rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 transition"
          >
            Register Borrower
          </button>
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-md transition"
          >
            <Wallet className="w-4 h-4 text-slate-950" />
            Record Collection Now
          </button>
          <PrintPDFButton targetId="printable-area" title="TRIDIN FINANCE â€“ Collector Daily Route Sheet" compact />
        </div>
      </div>

      {/* 4 Collector Focused Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* My Today's Collections */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#BFE23A] shadow-card bg-gradient-to-br from-white to-[#BFE23A]/10">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">My Collections Today</p>
          <h3 className="text-2xl font-black text-slate-950 mt-1 font-mono">
            ₹{(collectorStats?.myTodayAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-bold text-slate-700">
            {collectorStats?.myTodayCount || 0} receipts posted today
          </span>
        </div>

        {/* Today's Route Target */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Scheduled Target</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{(metrics?.todayDueCollections?.amount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-semibold text-sky-700">
            {metrics?.todayDueCollections?.count || 0} borrower instalments due
          </span>
        </div>

        {/* My Lifetime Total Collections */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Lifetime Collections</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ₹{(collectorStats?.myTotalAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-800">
            {collectorStats?.myTotalCount || 0} total transactions logged
          </span>
        </div>

        {/* Overdue Delinquency on Route */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-card bg-red-50/20">
          <p className="text-xs font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" /> Overdue Route Arrears
          </p>
          <h3 className="text-2xl font-black text-[#E10600] mt-1 font-mono">
            ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-bold text-[#E10600]">
            Priority follow-up required
          </span>
        </div>
      </div>

      {/* Main Section: Today's Scheduled Field Borrowers */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF2E9]/60">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              Borrowers Due for Collection Today
            </h2>
            <p className="text-xs text-slate-500">Scheduled instalments on your route for immediate receipting</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              placeholder="Search borrower by name, shop or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#BFE23A]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Borrower Name</th>
                <th className="py-3 px-4">Mobile & Shop Address</th>
                <th className="py-3 px-4">Account #</th>
                <th className="py-3 px-4">Week Due</th>
                <th className="py-3 px-4 text-right">Amount Due (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTodayDue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {todayDueList.length === 0
                      ? 'ðŸŽ‰ All daily scheduled instalments have been collected or no instalments due today.'
                      : 'No borrowers found matching your search.'}
                  </td>
                </tr>
              ) : (
                filteredTodayDue.map((item) => (
                  <tr key={item.instalmentId} className="hover:bg-[#FAF2E9]/30 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{item.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{item.customerCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={`tel:${item.mobile}`}
                          className="font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.mobile}
                        </a>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {item.address}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{item.accountNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">Week {item.weekNumber}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm">
                      ₹{item.amountDue?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/collections?customerId=${item.customerId}&accountId=${item.accountId}`)
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-xs transition"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Collect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Overdue Follow-up & Collector Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Borrowers to Follow Up */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-red-50/40">
            <div>
              <h3 className="text-base font-bold text-[#E10600] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Overdue Borrowers to Visit
              </h3>
              <p className="text-xs text-slate-500">Clients with missed weekly repayments</p>
            </div>
            <button
              onClick={() => navigate('/customers')}
              className="text-xs font-bold text-[#E10600] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {overdueCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-600 font-bold">
                No overdue accounts currently!
              </div>
            ) : (
              overdueCustomers.slice(0, 6).map((c) => (
                <div key={c.accountId} className="p-4 flex items-center justify-between hover:bg-red-50/20 transition">
                  <div>
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{c.accountNumber}</span>
                    <a href={`tel:${c.mobile}`} className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {c.mobile}
                    </a>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#E10600] font-mono block">
                      ₹{c.overdueAmount?.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => navigate(`/collections?customerId=${c.id}&accountId=${c.accountId}`)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-950 underline mt-0.5"
                    >
                      Collect Arrears
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Recent Collection Receipts */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF2E9]/40">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                My Recent Collection Receipts
              </h3>
              <p className="text-xs text-slate-500">Receipts issued by you</p>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-bold text-slate-700 hover:text-slate-950"
            >
              All Payments
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {collectorStats?.recentCollections?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No collections recorded by you yet.
              </div>
            ) : (
              collectorStats?.recentCollections?.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{p.receiptNumber}</span>
                      <span className="text-xs text-slate-700 font-semibold">{p.customer?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(p.paymentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} â€¢ {p.account?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-emerald-700 text-xs">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => viewReceipt(p.receiptNumber)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-stone-200 hover:text-slate-900 transition"
                      title="Print Customer Receipt"
                    >
                      <Printer className="w-4 h-4" />
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

export default CollectorDashboard;
