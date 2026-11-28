import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  UserCheck,
  Layers,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  Printer
} from 'lucide-react';
import api, { downloadAuthenticatedFile } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PrintPDFButton from '../components/common/PrintPDFButton';

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'daily';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date filters for daily
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const reportTabs = [
    { id: 'daily', name: 'Daily Collections', icon: Calendar },
    { id: 'weekly', name: 'Weekly Collections', icon: BarChart3 },
    { id: 'monthly', name: 'Monthly Collections', icon: BarChart3 },
    { id: 'customer', name: 'Customer Collections', icon: Users },
    { id: 'collector', name: 'Collector Performance', icon: UserCheck },
    { id: 'outstanding', name: 'Outstanding Accounts', icon: Layers },
    { id: 'overdue', name: 'Overdue Accounts', icon: AlertOctagon },
    { id: 'disbursement', name: 'Disbursement Register', icon: FileSpreadsheet },
    { id: 'completed', name: 'Completed Accounts', icon: CheckCircle2 }
  ];

  const fetchReport = async (tab) => {
    try {
      setLoading(true);
      setSearchParams({ tab });
      let endpoint = `/reports/${tab}`;
      let params = {};
      if (tab === 'daily') {
        params = { startDate, endDate };
      } else if (tab === 'customer') {
        endpoint = '/reports/customers';
      } else if (tab === 'collector') {
        endpoint = '/reports/collectors';
      } else if (tab === 'outstanding') {
        endpoint = '/reports/outstanding';
      } else if (tab === 'overdue') {
        endpoint = '/reports/overdue';
      } else if (tab === 'disbursement') {
        endpoint = '/reports/disbursements';
      } else if (tab === 'completed') {
        endpoint = '/reports/completed';
      }

      const res = await api.get(endpoint, { params });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const handleExportCSV = async () => {
    const types = { disbursement: 'disbursement', customer: 'customer', daily: 'daily', overdue: 'overdue', completed: 'completed', collector: 'collector' };
    try {
      await downloadAuthenticatedFile('/reports/export', { type: types[activeTab] || activeTab, startDate, endDate }, `report_${activeTab}.csv`);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

  return (
    <div id="printable-area" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Financial Intelligence</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit & Management Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit statements, portfolio risks & disbursement ledgers</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-[#789486] hover:bg-[#5E786B] text-white shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-950" />
            Export CSV / Excel
          </button>
          <PrintPDFButton targetId="printable-area" title={`TamilFins – ${reportTabs.find(t => t.id === activeTab)?.name || 'Report'}`} />
        </div>
      </div>

      {/* Report Tabs Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 no-print">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar for Daily Tab */}
      {activeTab === 'daily' && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-3 text-xs no-print">
          <span className="font-bold text-slate-700">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300"
          />
          <button
            onClick={() => fetchReport('daily')}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
          >
            Apply Filter
          </button>
        </div>
      )}

      {/* Report Content Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-[#789486] rounded-full animate-spin mr-2" />
            Generating financial analytics report...
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Daily Collections */}
            {activeTab === 'daily' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Account #</th>
                    <th className="py-3 px-4">Collector</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount (?)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.records?.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.receiptNumber}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {new Date(r.paymentDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{r.customer?.name}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{r.account?.accountNumber}</td>
                      <td className="py-2.5 px-4 text-slate-700">{r.collector?.name}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700">{r.paymentMethod}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        ?{Number(r.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {/* Summary row */}
                  <tr className="bg-slate-900 text-white font-bold">
                    <td colSpan={6} className="py-3 px-4 text-right">
                      Total Collections ({reportData?.totalTransactions || 0} transactions):
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-[#789486]">
                      ?{reportData?.totalCollected?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* Weekly Collections */}
            {activeTab === 'weekly' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Week Period</th>
                    <th className="py-3 px-4 text-center">Transactions Count</th>
                    <th className="py-3 px-4 text-right">Total Collections (?)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.weeklySummary?.map((w, i) => (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{w.week}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{w.count}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ?{w.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Monthly Collections */}
            {activeTab === 'monthly' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4 text-center">Total Collections Count</th>
                    <th className="py-3 px-4 text-right">Collected Revenue (?)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.monthly?.map((m, i) => (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{m.month}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">{m.count}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        ?{m.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Customer Collections */}
            {activeTab === 'customer' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">KYC</th>
                    <th className="py-3 px-4 text-center">Accounts</th>
                    <th className="py-3 px-4 text-right">Total Disbursed</th>
                    <th className="py-3 px-4 text-right">Agreed Repayment</th>
                    <th className="py-3 px-4 text-right">Total Collected</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.customers?.map((c) => (
                    <tr key={c.customerId} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{c.customerCode}</span>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={c.kycStatus} /></td>
                      <td className="py-3 px-4 text-center font-bold">{c.totalAccounts}</td>
                      <td className="py-3 px-4 text-right font-mono">?{c.totalDisbursed?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">?{c.totalAgreed?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">?{c.totalCollected?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-amber-700 font-bold">?{c.outstanding?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Collector Performance */}
            {activeTab === 'collector' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Collector Staff Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Receipts Posted</th>
                    <th className="py-3 px-4 text-right">Total Collections (?)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.collectors?.map((col) => (
                    <tr key={col.userId} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{col.name}</td>
                      <td className="py-3 px-4 text-slate-500">{col.email}</td>
                      <td className="py-3 px-4"><StatusBadge status={col.role} /></td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{col.transactionsCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        ?{col.totalCollected?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Outstanding Accounts */}
            {activeTab === 'outstanding' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Account #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Agreed</th>
                    <th className="py-3 px-4 text-right">Total Paid</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                    <th className="py-3 px-4 text-right">Overdue</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.accounts?.map((acc) => (
                    <tr key={acc.accountId} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{acc.accountNumber}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{acc.customerName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{acc.customerCode}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">?{acc.agreedRepayment?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">?{acc.totalPaid?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">?{acc.outstanding?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {acc.overdueAmount > 0 ? (
                          <span className="font-bold text-[#E10600]">?{acc.overdueAmount?.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-400">?0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center"><StatusBadge status={acc.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Overdue Accounts */}
            {activeTab === 'overdue' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-red-50/70 border-b border-red-200 text-[#E10600] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Account #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4 text-right">Agreed Repayment</th>
                    <th className="py-3 px-4 text-right">Outstanding Balance</th>
                    <th className="py-3 px-4 text-right font-black text-[#E10600]">Overdue Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.overdue?.map((o) => (
                    <tr key={o.accountId} className="hover:bg-red-50/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.accountNumber}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{o.customerName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{o.customerCode}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{o.mobile}</td>
                      <td className="py-3 px-4 text-right font-mono">?{o.agreedRepayment?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">?{o.outstanding?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-[#E10600]">
                        ?{o.overdueAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Disbursement Register */}
            {activeTab === 'disbursement' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F8F5]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Disbursed Date</th>
                    <th className="py-3 px-4">Account #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-900">Disbursed (?)</th>
                    <th className="py-3 px-4 text-right">Agreed (?)</th>
                    <th className="py-3 px-4 text-right">Gross Diff (?)</th>
                    <th className="py-3 px-4 text-right">Weekly (?)</th>
                    <th className="py-3 px-4 text-center">Weeks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.disbursements?.map((d) => (
                    <tr key={d.accountId} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {new Date(d.disbursedDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.accountNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ?{d.disbursedAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">?{d.agreedRepayment?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-purple-700">
                        ?{d.grossDifference?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">?{d.weeklyInstalment?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{d.totalWeeks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Completed Accounts */}
            {activeTab === 'completed' && (
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-50/70 border-b border-emerald-200 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Account #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Disbursed (?)</th>
                    <th className="py-3 px-4 text-right">Agreed Repayment (?)</th>
                    <th className="py-3 px-4 text-right">Gross Difference (?)</th>
                    <th className="py-3 px-4 text-right">Total Paid (?)</th>
                    <th className="py-3 px-4">Completed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportData?.completed?.map((c) => (
                    <tr key={c.accountId} className="hover:bg-emerald-50/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.accountNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.customerName}</td>
                      <td className="py-3 px-4 text-right font-mono">?{c.totalDisbursed?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ?{c.agreedRepayment?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-purple-700">
                        ?{c.grossDifference?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        ?{c.totalPaid?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {new Date(c.completedDate).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
