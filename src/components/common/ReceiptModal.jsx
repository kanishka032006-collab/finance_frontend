import React from 'react';
import Modal from './Modal';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const openReceiptPrintDialog = () => {
    const previousTitle = document.title;
    document.title = `TRIDIN_Receipt_${receipt.receiptNumber}`;
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 1000);
  };

  const handleDownloadPdf = () => {
    openReceiptPrintDialog();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt Voucher" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Printable Area */}
        <div id="printable-receipt" className="border border-stone-200 rounded-xl p-6 bg-white shadow-sm space-y-6 relative overflow-hidden">
          {/* Top header accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#BFE23A]" />

          {/* Company branding header */}
          <div className="flex justify-between items-start border-b border-stone-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-[#BFE23A] font-extrabold flex items-center justify-center text-sm shadow">
                  T
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">TRIDIN SOFTWARE</h2>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Finance Collection Division</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Receipt No</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">{receipt.receiptNumber}</span>
              <div className="mt-1">
                <StatusBadge status={receipt.status} />
              </div>
            </div>
          </div>

          {/* Key Payment Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF2E9]/70 p-3.5 rounded-lg border border-stone-200/60">
            <div>
              <span className="text-slate-500 block">Payment Date:</span>
              <span className="font-semibold text-slate-800">
                {new Date(receipt.paymentDate).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Collector:</span>
              <span className="font-semibold text-slate-800">{receipt.collectorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Mode:</span>
              <span className="font-bold text-slate-800">
                {receipt.paymentMethod} {receipt.reference ? `(${receipt.reference})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Account Number:</span>
              <span className="font-mono font-bold text-slate-800">{receipt.account?.accountNumber}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border border-stone-100 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-bold text-slate-900">{receipt.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Code:</span>
              <span className="font-mono font-semibold text-slate-700">{receipt.customer?.customerCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mobile Number:</span>
              <span className="text-slate-700">{receipt.customer?.mobile}</span>
            </div>
          </div>

          {/* Payment Breakdown / Allocations */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              FIFO Instalment Allocation Breakdown
            </h4>
            <table className="w-full text-xs border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                <tr>
                  <th className="py-2 px-3">Week #</th>
                  <th className="py-2 px-3">Due Date</th>
                  <th className="py-2 px-3 text-right">Allocated (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {receipt.allocations?.map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">Week {alloc.weekNumber}</td>
                    <td className="py-2 px-3 text-slate-600">
                      {new Date(alloc.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{alloc.allocatedAmount?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Amount Paid:</span>
              <span className="text-lg font-black text-[#BFE23A] font-mono">
                ₹{receipt.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
              <span>Remaining Account Balance:</span>
              <span className="font-mono font-bold text-white">
                ₹{receipt.account?.remainingBalance?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 border-t border-stone-100 pt-3 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Computer generated authorized receipt. Tridin Software Finance Management.
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex items-center justify-end gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={openReceiptPrintDialog}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#BFE23A] hover:bg-[#aed12b] text-slate-900 rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
