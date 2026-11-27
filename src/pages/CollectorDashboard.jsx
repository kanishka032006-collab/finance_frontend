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
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-10 h-10 border-4 border-[#E2E8F4] border-t-[#13A89E] border-r-[#2446A8] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#718096]">Loading Field Collection Route...</p>
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
    <div id="printable-area" className="space-y-4 sm:space-y-6">
      {/* Top Banner & Quick Collection Hero */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#13A89E] via-[#2446A8] to-[#E7A94B]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E6F8F7] text-[#0D857D] border border-[#13A89E]/30">
                Field Collection Officer Console
              </span>
              <span className="text-xs text-[#718096] font-medium">
                Logged in: <strong className="text-[#17233C]">{user?.name}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
              Daily Field Route &amp; Collection Portal
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Real-time borrower route list, weekly cash/UPI collection &amp; instant receipt generation
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/customers/new')}
              className="min-h-[42px] px-4 py-2 text-xs font-bold rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] text-[#17233C] hover:bg-[#EEF2FC] hover:text-[#2446A8] transition"
            >
              Register Borrower
            </button>
            <button
              type="button"
              onClick={() => navigate('/collections')}
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 rounded-xl text-xs font-extrabold btn-teal"
            >
              <Wallet className="w-4 h-4 text-white shrink-0" />
              <span>Record Collection</span>
            </button>
            <PrintPDFButton
              targetId="printable-area"
              title="TRIDIN FINANCE – Collector Daily Route Sheet"
              compact
            />
          </div>
        </div>
      </div>

      {/* 4 Collector Focused Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* My Today's Collections */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#13A89E]/40 shadow-card bg-gradient-to-br from-white to-[#E6F8F7] min-w-0">
          <p className="text-[11px] font-bold text-[#0D857D] uppercase tracking-wider">My Collections Today</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#17233C] mt-1 font-num break-words">
            ₹{(collectorStats?.myTodayAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-1.5 text-[11px] font-bold text-[#0D857D]">
            {collectorStats?.myTodayCount || 0} receipts
          </span>
        </div>

        {/* Today's Route Target */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#2446A8]/20 shadow-card min-w-0">
          <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
            Today's Scheduled Target
          </p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#2446A8] mt-1 font-num break-words">
            ₹{(metrics?.todayDueCollections?.amount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#2446A8]">
            {metrics?.todayDueCollections?.count || 0} scheduled
          </span>
        </div>

        {/* My Lifetime Total Collections */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card min-w-0">
          <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">My Lifetime Collections</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D857D] mt-1 font-num break-words">
            ₹{(collectorStats?.myTotalAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-1.5 text-[11px] font-semibold text-[#718096]">
            {collectorStats?.myTotalCount || 0} transactions
          </span>
        </div>

        {/* Overdue Amount */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#E45B68]/35 shadow-card bg-[#FDF0F1]/75 min-w-0">
          <p className="text-[11px] font-bold text-[#C93D4B] uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span>Overdue Amount</span>
          </p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#C93D4B] mt-1 font-num break-words">
            ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-1.5 text-[11px] font-bold text-[#E45B68]">
            {metrics?.overdueRate || 0}% overdue
          </span>
        </div>
      </div>

      {/* Main Section: Today's Scheduled Field Borrowers */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F7FC]/70">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#17233C] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2446A8] shrink-0" />
              <span>Today's Due Collections</span>
            </h2>
            <p className="text-xs text-[#718096]">
              Scheduled instalments on your route for immediate receipting
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              placeholder="Search borrower by name, shop or phone..."
              className="w-full min-h-[42px] pl-10 pr-3 py-2 text-xs rounded-xl border border-[#DCE4F2] bg-white text-[#17233C] focus:outline-none focus:ring-2 focus:ring-[#2446A8]"
            />
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden print:hidden divide-y divide-[#E2E8F4]">
          {filteredTodayDue.length === 0 ? (
            <div className="py-10 px-4 text-center text-xs text-[#718096]">
              {todayDueList.length === 0
                ? 'No instalments due today.'
                : 'No records found'}
            </div>
          ) : (
            filteredTodayDue.map((item) => (
              <div key={item.instalmentId} className="p-4 space-y-3 hover:bg-[#F5F7FC]/60">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-[#17233C] block truncate">{item.customerName}</span>
                    <span className="font-code text-[11px] text-[#718096]">
                      {item.customerCode} • {item.accountNumber}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#718096]">
                  <a href={`tel:${item.mobile}`} className="font-semibold text-[#2446A8] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-num">{item.mobile}</span>
                  </a>
                  <span className="flex items-center gap-1 truncate max-w-full">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2E8F4]">
                  <div>
                    <span className="text-[10px] font-bold text-[#718096] uppercase block">
                      Week {item.weekNumber}
                    </span>
                    <span className="font-num font-extrabold text-base text-[#17233C]">
                      ₹{item.amountDue?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/collections?customerId=${item.customerId}&accountId=${item.accountId}`)
                    }
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold btn-teal"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop & Print Table View */}
        <div className="hidden md:block print:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F7FC] border-b border-[#E2E8F4] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Borrower Name</th>
                <th className="py-3 px-4">Mobile &amp; Shop Address</th>
                <th className="py-3 px-4">Account #</th>
                <th className="py-3 px-4">Week Due</th>
                <th className="py-3 px-4 text-right">Amount Due (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F4]">
              {filteredTodayDue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#718096]">
                    {todayDueList.length === 0 ? 'No instalments due today.' : 'No records found'}
                  </td>
                </tr>
              ) : (
                filteredTodayDue.map((item) => (
                  <tr key={item.instalmentId} className="hover:bg-[#F5F7FC]/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#17233C] block">{item.customerName}</span>
                      <span className="font-code text-[10px] text-[#718096]">{item.customerCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={`tel:${item.mobile}`}
                          className="font-semibold text-[#17233C] hover:text-[#2446A8] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#2446A8]" />
                          <span className="font-num">{item.mobile}</span>
                        </a>
                        <p className="text-[11px] text-[#718096] truncate max-w-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#718096] shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-code font-bold text-[#2446A8]">{item.accountNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-[#17233C]">Week {item.weekNumber}</td>
                    <td className="py-3.5 px-4 text-right font-num font-extrabold text-[#17233C] text-sm">
                      ₹{item.amountDue?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center no-print">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/collections?customerId=${item.customerId}&accountId=${item.accountId}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold btn-teal"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Overdue Borrowers to Follow Up */}
        <div className="bg-white rounded-2xl border border-[#E45B68]/30 shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E45B68]/20 flex items-center justify-between gap-2 bg-[#FDF0F1]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#C93D4B] flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>Overdue Accounts</span>
              </h3>
              <p className="text-xs text-[#718096]">Clients with missed weekly repayments</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="text-xs font-bold text-[#C93D4B] hover:underline shrink-0"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {overdueCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#0D857D] font-bold">
                No overdue accounts currently!
              </div>
            ) : (
              overdueCustomers.slice(0, 6).map((c) => (
                <div
                  key={c.accountId}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FDF0F1]/30 transition"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-[#17233C] block truncate">{c.name}</span>
                    <span className="font-code text-[10px] text-[#718096]">{c.accountNumber}</span>
                    <a
                      href={`tel:${c.mobile}`}
                      className="text-xs text-[#2446A8] flex items-center gap-1 mt-0.5 font-num"
                    >
                      <Phone className="w-3 h-3" /> {c.mobile}
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-[#C93D4B] font-num block">
                      ₹{c.overdueAmount?.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/collections?customerId=${c.id}&accountId=${c.accountId}`)}
                      className="text-[11px] font-bold text-[#2446A8] hover:underline mt-0.5"
                    >
                      Record Collection
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Recent Collection Receipts */}
        <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F4] flex items-center justify-between gap-2 bg-[#F5F7FC]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#17233C] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2446A8] shrink-0" />
                <span>Recent Transactions</span>
              </h3>
              <p className="text-xs text-[#718096]">Receipts issued by you</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payments')}
              className="text-xs font-bold text-[#2446A8] hover:underline shrink-0"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {collectorStats?.recentCollections?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No records found</div>
            ) : (
              collectorStats?.recentCollections?.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F5F7FC]/60 transition"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-code font-bold text-[#2446A8] text-xs">{p.receiptNumber}</span>
                      <span className="text-xs text-[#17233C] font-semibold truncate">{p.customer?.name}</span>
                    </div>
                    <span className="text-[10px] text-[#718096] font-code">
                      {new Date(p.paymentDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {p.account?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-num font-extrabold text-[#0D857D] text-xs sm:text-sm">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => viewReceipt(p.receiptNumber)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-[#718096] hover:bg-[#EEF2FC] hover:text-[#2446A8] transition"
                      title="Print Receipt"
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
