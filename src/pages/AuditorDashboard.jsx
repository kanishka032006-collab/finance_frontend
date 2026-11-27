import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertOctagon,
  RotateCcw,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
} from 'lucide-react';
import api, { downloadAuthenticatedFile } from '../services/api';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <div className="w-10 h-10 border-4 border-[#E2E8F4] border-t-[#A58BEA] border-r-[#2446A8] rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#718096]">Performing Compliance & Risk Verification...</p>
        </div>
      </div>
    );
  }

  const { metrics, auditorStats } = data || {};

  return (
    <div id="printable-area" className="space-y-4 sm:space-y-6">
      {/* Compliance Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F4] shadow-card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A58BEA] via-[#2446A8] to-[#13A89E]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4F0FE] text-[#6E4BC4] border border-[#A58BEA]/35">
                Auditor & Compliance Portal
              </span>
              <span className="text-xs text-[#718096] font-medium">
                Auditor: <strong className="text-[#17233C]">{user?.name}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#17233C] tracking-tight">
              Financial Audit & Portfolio Health
            </h1>
            <p className="text-xs text-[#718096] mt-0.5">
              Statutory ledger verification, reversal authorization checks & recovery rate audits
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#FDF6E8] text-[#A86F19] border border-[#E7A94B]/35">
              <ShieldCheck className="w-4 h-4 text-[#C7882C] shrink-0" />
              <span>Read-Only Audit Mode</span>
            </span>
            <button
              type="button"
              onClick={() => navigate('/audit-logs')}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EEF2FC] hover:bg-[#DCE5FB] text-[#2446A8] border border-[#2446A8]/20 transition"
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Audit Logs</span>
            </button>
            <PrintPDFButton
              targetId="printable-area"
              title="TRIDIN FINANCE – Audit & Compliance Report"
              compact
            />
          </div>
        </div>
      </div>

      {/* 4 Compliance & Risk Ratios */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Recovery Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card min-w-0">
          <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
            Compliance Recovery Rate
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0D857D] font-num">
              {metrics?.recoveryRate}%
            </h3>
            <span className="text-xs font-semibold text-[#718096]">contractual</span>
          </div>
          <div className="w-full bg-[#EBF0FA] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#2446A8] to-[#13A89E] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, metrics?.recoveryRate || 0)}%` }}
            />
          </div>
        </div>

        {/* Overdue Delinquency Rate */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#E45B68]/35 shadow-card bg-[#FDF0F1]/75 min-w-0">
          <p className="text-[11px] font-bold text-[#C93D4B] uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span>NPA exposure</span>
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#C93D4B] font-num">
              {metrics?.overdueRate}%
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#E45B68] block mt-2 font-num break-words">
            ₹{(metrics?.totalOverdueAmount || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Capital Integrity */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F4] shadow-card min-w-0">
          <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
            Capital Deployed Integrity
          </p>
          <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#17233C] mt-1 font-num break-words">
            ₹{(metrics?.totalAmountDisbursed || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-medium text-[#718096] font-num break-words">
            Agreed: ₹{(metrics?.totalScheduledRepayment || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Gross Revenue Margin */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#A58BEA]/35 shadow-card min-w-0">
          <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">Realized Gross Margin</p>
          <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#6E4BC4] mt-1 font-num break-words">
            ₹{(metrics?.collectedGrossDifference || 0).toLocaleString('en-IN')}
          </h3>
          <span className="inline-block mt-2 text-[11px] font-medium text-[#8566D6] font-num break-words">
            Expected: ₹{(metrics?.expectedGrossDifference || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* One-Click Statutory Reports Export Center */}
      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-6">
        <h3 className="text-sm font-bold text-[#17233C] uppercase tracking-wider mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#13A89E] shrink-0" />
          <span>Audit & Management Reports</span>
        </h3>
        <p className="text-xs text-[#718096] mb-4">
          Download official raw CSV & Excel ledgers for external audit verification
        </p>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => handleExportCSV('daily')}
            className="p-3.5 rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] hover:bg-[#EEF2FC] hover:border-[#2446A8]/40 transition text-left min-h-[60px]"
          >
            <span className="text-xs font-bold text-[#17233C] block">Daily Collections</span>
            <span className="text-[10px] text-[#2446A8] font-semibold block mt-0.5">Download CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('customer')}
            className="p-3.5 rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] hover:bg-[#EEF2FC] hover:border-[#2446A8]/40 transition text-left min-h-[60px]"
          >
            <span className="text-xs font-bold text-[#17233C] block">Customer Master</span>
            <span className="text-[10px] text-[#2446A8] font-semibold block mt-0.5">Download CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('overdue')}
            className="p-3.5 rounded-xl border border-[#E45B68]/35 bg-[#FDF0F1]/70 hover:bg-[#FDF0F1] transition text-left min-h-[60px]"
          >
            <span className="text-xs font-bold text-[#C93D4B] block">Overdue Delinquency</span>
            <span className="text-[10px] text-[#E45B68] font-semibold block mt-0.5">Download CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('disbursement')}
            className="p-3.5 rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] hover:bg-[#EEF2FC] hover:border-[#2446A8]/40 transition text-left min-h-[60px]"
          >
            <span className="text-xs font-bold text-[#17233C] block">Disbursements</span>
            <span className="text-[10px] text-[#2446A8] font-semibold block mt-0.5">Download CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV('completed')}
            className="xs:col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-[#13A89E]/30 bg-[#E6F8F7]/60 hover:bg-[#E6F8F7] transition text-left min-h-[60px]"
          >
            <span className="text-xs font-bold text-[#0D857D] block">Completed Loans</span>
            <span className="text-[10px] text-[#13A89E] font-semibold block mt-0.5">Download CSV</span>
          </button>
        </div>
      </div>

      {/* Two Column: Reversals Inspection & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-[#E45B68]/30 shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E45B68]/20 flex items-center justify-between gap-2 bg-[#FDF0F1]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#C93D4B] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Reversed</span>
              </h3>
              <p className="text-xs text-[#718096]">
                Transactions voided with administrative justification
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payments?status=REVERSED')}
              className="text-xs font-bold text-[#C93D4B] hover:underline shrink-0"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {auditorStats?.recentReversals?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No records found</div>
            ) : (
              auditorStats?.recentReversals?.map((r) => (
                <div key={r.id} className="p-4 hover:bg-[#F5F7FC]/60 transition space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-code font-bold text-[#17233C]">{r.receiptNumber}</span>
                    <span className="font-num font-extrabold text-[#C93D4B] line-through">
                      ₹{Number(r.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[#718096]">
                    <span>
                      Borrower: <strong className="text-[#17233C]">{r.customer?.name}</strong>
                    </span>
                    <span>
                      Reversed by: <strong className="text-[#17233C]">{r.reversedBy?.name || 'Admin'}</strong>
                    </span>
                  </div>
                  <div className="bg-[#FDF0F1] text-[#C93D4B] p-2.5 rounded-xl text-[11px] font-medium border border-[#E45B68]/25">
                    "{r.reversalReason}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card overflow-hidden min-w-0">
          <div className="p-4 sm:p-5 border-b border-[#E2E8F4] flex items-center justify-between gap-2 bg-[#F5F7FC]/70">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#17233C] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#2446A8] shrink-0" />
                <span>Audit Logs</span>
              </h3>
              <p className="text-xs text-[#718096]">Immutable operations log with user and IP stamps</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/audit-logs')}
              className="text-xs font-bold text-[#2446A8] hover:underline flex items-center gap-1 shrink-0"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-[#E2E8F4]">
            {auditorStats?.recentAuditLogs?.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#718096]">No records found</div>
            ) : (
              auditorStats?.recentAuditLogs?.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F5F7FC]/60 transition text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-code font-bold text-[10px] bg-[#EEF2FC] text-[#2446A8] border border-[#2446A8]/20">
                        {log.action}
                      </span>
                      <span className="font-bold text-[#17233C] truncate">{log.entity}</span>
                    </div>
                    <p className="text-[11px] text-[#718096] mt-0.5 truncate">
                      {log.user?.name || 'System'} • IP: {log.ipAddress || '127.0.0.1'}
                    </p>
                  </div>
                  <span className="font-code text-[10px] text-[#718096] shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
