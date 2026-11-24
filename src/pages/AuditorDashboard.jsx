import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  RotateCcw,
  Clock,
  Printer,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  Building,
  Coins
} from 'lucide-react';
import api from '../services/api';
import { downloadAuthenticatedFile } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ReceiptModal from '../components/common/ReceiptModal';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const AuditorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchAuditorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load auditor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditorData();
  }, []);

  const handleExportCSV = async (type) => {
    try {
      await downloadAuthenticatedFile('/reports/export', { type }, `report_${type}.csv`);
    } catch (err) {
      console.error('Failed to download report:', err);
    }
  };

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
          <p className="text-xs font-bold text-slate-600">Performing Compliance & Risk Verification...</p>
        </div>
      </div>
    );
  }

  const { metrics, auditorStats, recentTransactions } = data || {};

  return (
    <div id="printable-area" className="space-y-6">
      {/* Compliance Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                Auditor & Compliance Portal
              </span>
              <span className="text-xs text-slate-500 font-medium">Auditor: {user?.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Audit & Portfolio Health</h1>
            <p className="text-xs text-slate-500 mt-0.5">Statutory ledger verification, reversal authorization checks & recovery rate audits</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Read-Only Audit Mode Enforced
            </span>
            <button
              onClick={() => navigate('/audit-logs')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-slate-800 transition"
            >
              <ClipboardList className="w-4 h-4" />
              Full Audit Trail
            </button>
            <PrintPDFButton targetId="printable-area" title="TRIDIN FINANCE â€“ Audit & Compliance Report" compact />
          </div>
        </div>
      </div>

      {/* 4 Compliance & Risk Ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Rate */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Recovery Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-emerald-700">{metrics?.recoveryRate}%</h3>
            <span className="text-xs font-semibold text-slate-400">contractual</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-[#BFE23A] h-2 rounded-full"
              style={{ width: `${Math.min(100, metrics?.recoveryRate || 0)}%` }}
            />
          </div>
        </div>

        {/* Overdue Delinquency Rate */}
        <div className="bg-white p-5 rounded-2xl border-2 border-red-200 shadow-card bg-red-50/20">
          <p className="text-xs font-bold text-[#E10600] uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" /> Delinquency / Overdue Ratio
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#E10600]">{metrics?.overdueRate}%</h3>
            <span className="text-xs font-semibold text-[#E10600]/70">NPA exposure</span>
          </div>
          <span className="text-[11px] font-bold text-[#E10600] block mt-2 font-mono">
            ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')} uncollected
          </span>
        </div>

        {/* Capital Integrity */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capital Deployed Integrity</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ₹{(metrics?.totalAmountDisbursed || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-medium text-slate-500 font-mono">
            Agreed: ₹{(metrics?.totalScheduledRepayment || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Gross Revenue Margin */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Realized Gross Margin</p>
          <h3 className="text-2xl font-black text-purple-800 mt-1 font-mono">
            ₹{(metrics?.collectedGrossDifference || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-medium text-purple-700 font-mono">
            Expected: ₹{(metrics?.expectedGrossDifference || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* One-Click Statutory Reports Export Center */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          Statutory Compliance Reports & Ledger Exports
        </h3>
        <p className="text-xs text-slate-500 mb-4">Download official raw CSV & Excel ledgers for external audit verification</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => handleExportCSV('daily')}
            className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#BFE23A]/20 hover:border-[#BFE23A] transition text-left"
          >
            <span className="text-xs font-bold text-slate-900 block">Daily Collections</span>
            <span className="text-[10px] text-slate-500 block">Download CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('customer')}
            className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#BFE23A]/20 hover:border-[#BFE23A] transition text-left"
          >
            <span className="text-xs font-bold text-slate-900 block">Customer Master</span>
            <span className="text-[10px] text-slate-500 block">Download CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('overdue')}
            className="p-3 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50 transition text-left"
          >
            <span className="text-xs font-bold text-[#E10600] block">Overdue Delinquency</span>
            <span className="text-[10px] text-[#E10600]/80 block">Download CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('disbursement')}
            className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#BFE23A]/20 hover:border-[#BFE23A] transition text-left"
          >
            <span className="text-xs font-bold text-slate-900 block">Disbursements</span>
            <span className="text-[10px] text-slate-500 block">Download CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('completed')}
            className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-[#BFE23A]/20 hover:border-[#BFE23A] transition text-left"
          >
            <span className="text-xs font-bold text-slate-900 block">Completed Loans</span>
            <span className="text-[10px] text-slate-500 block">Download CSV</span>
          </button>
        </div>
      </div>

      {/* Two Column: Reversals Inspection & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Reversals Inspector */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-red-50/40">
            <div>
              <h3 className="text-base font-bold text-[#E10600] flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Payment Reversal Journal
              </h3>
              <p className="text-xs text-slate-500">Transactions voided with administrative justification</p>
            </div>
            <button
              onClick={() => navigate('/payments?status=REVERSED')}
              className="text-xs font-bold text-[#E10600] hover:underline"
            >
              All Reversals
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {auditorStats?.recentReversals?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No payment reversals logged.
              </div>
            ) : (
              auditorStats?.recentReversals?.map((r) => (
                <div key={r.id} className="p-4 hover:bg-stone-50 transition space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{r.receiptNumber}</span>
                    <span className="font-mono font-black text-[#E10600] line-through">
                      ₹{Number(r.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Borrower: <strong>{r.customer?.name}</strong></span>
                    <span>Reversed by: <strong>{r.reversedBy?.name || 'Admin'}</strong></span>
                  </div>
                  <div className="bg-red-50 text-[#E10600] p-2 rounded-lg text-[11px] font-medium border border-red-100">
                    Audit Reason: "{r.reversalReason}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live System Audit Feed */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF2E9]/40">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-700" />
                Live System Audit Trail Stream
              </h3>
              <p className="text-xs text-slate-500">Immutable operations log with user and IP stamps</p>
            </div>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1"
            >
              View Full Trail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {auditorStats?.recentAuditLogs?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No audit entries recorded yet.
              </div>
            ) : (
              auditorStats?.recentAuditLogs?.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900">{log.entity}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      By {log.user?.name || 'System'} â€¢ IP: {log.ipAddress || '127.0.0.1'}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
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

export default AuditorDashboard;
