import React from 'react';
import Modal from './Modal';
import { Printer, Download, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;

  const openReceiptPrintDialog = () => {
    const previousTitle = document.title;
    document.title = `TamilFins_Receipt_${receipt.receiptNumber}`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  const handleDownloadPdf = () => {
    openReceiptPrintDialog();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt Voucher" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Printable Area */}
        <div
          id="printable-receipt"
          className="border border-[#E2E8F4] rounded-2xl p-4 sm:p-6 bg-white shadow-card space-y-5 relative overflow-hidden"
        >
          {/* Top header accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2446A8] via-[#A58BEA] to-[#13A89E]" />

          {/* Company branding header */}
          <div className="flex flex-col xs:flex-row justify-between items-start gap-3 border-b border-[#E2E8F4] pb-4 pt-1">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-full bg-white border border-[#2446A8]/30 shadow-xs flex items-center justify-center p-0.5 overflow-hidden shrink-0 ring-2 ring-[#2446A8]/10 aspect-square">
                  <img
                    src="/tamilfins-logo.jpg"
                    alt="TamilFins"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#17233C] tracking-tight">TamilFins</h2>
                  <p className="text-[10px] text-[#13A89E] font-semibold tracking-wider uppercase">
                    Finance Collection Management
                  </p>
                </div>
              </div>
            </div>
            <div className="xs:text-right">
              <span className="text-[10px] font-bold text-[#718096] block uppercase tracking-wider">Receipt No</span>
              <span className="text-sm sm:text-base font-extrabold text-[#2446A8] font-code">
                {receipt.receiptNumber}
              </span>
              <div className="mt-1">
                <StatusBadge status={receipt.status} />
              </div>
            </div>
          </div>

          {/* Key Payment Meta */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 text-xs bg-[#F5F7FC] p-3.5 rounded-xl border border-[#E2E8F4]">
            <div>
              <span className="text-[#718096] block">Payment Date:</span>
              <span className="font-semibold text-[#17233C]">
                {new Date(receipt.paymentDate).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div>
              <span className="text-[#718096] block">Collector:</span>
              <span className="font-semibold text-[#17233C]">{receipt.collectorName}</span>
            </div>
            <div>
              <span className="text-[#718096] block">Payment Mode:</span>
              <span className="font-bold text-[#17233C]">
                {receipt.paymentMethod} {receipt.reference ? `(${receipt.reference})` : ''}
              </span>
            </div>
            <div>
              <span className="text-[#718096] block">Account Number:</span>
              <span className="font-code font-bold text-[#2446A8]">{receipt.account?.accountNumber}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border border-[#E2E8F4] rounded-xl p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between gap-2">
              <span className="text-[#718096]">Customer Name:</span>
              <span className="font-bold text-[#17233C] text-right">{receipt.customer?.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#718096]">Customer Code:</span>
              <span className="font-code font-semibold text-[#17233C]">{receipt.customer?.customerCode}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#718096]">Mobile Number:</span>
              <span className="font-num font-semibold text-[#17233C]">{receipt.customer?.mobile}</span>
            </div>
          </div>

          {/* Payment Breakdown / Allocations */}
          <div>
            <h4 className="text-xs font-bold text-[#17233C] uppercase tracking-wider mb-2">
              FIFO Instalment Allocation Breakdown
            </h4>
            <div className="overflow-x-auto border border-[#E2E8F4] rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F7FC] text-[#718096] font-bold">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Week #</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Due Date</th>
                    <th className="py-2.5 px-3 text-right whitespace-nowrap">Allocated (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F4]">
                  {receipt.allocations?.map((alloc, idx) => (
                    <tr key={idx} className="hover:bg-[#F5F7FC]/70">
                      <td className="py-2.5 px-3 font-semibold text-[#17233C] whitespace-nowrap">
                        Week {alloc.weekNumber}
                      </td>
                      <td className="py-2.5 px-3 text-[#718096] font-num whitespace-nowrap">
                        {new Date(alloc.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-num font-bold text-[#0D857D] whitespace-nowrap">
                        ₹{alloc.allocatedAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="bg-gradient-to-br from-[#17233C] to-[#2446A8] text-white rounded-2xl p-4 space-y-2 shadow-md">
            <div className="flex justify-between items-center text-xs text-slate-200">
              <span>Amount Paid:</span>
              <span className="text-xl font-extrabold text-[#2BC2B8] font-num">
                ₹{receipt.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="border-t border-white/15 pt-2 flex justify-between items-center text-xs text-slate-300">
              <span>Remaining Account Balance:</span>
              <span className="font-num font-bold text-white text-sm">
                ₹{receipt.account?.remainingBalance?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-[#718096] border-t border-[#E2E8F4] pt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#13A89E] shrink-0" />
            <span>Computer generated authorized receipt. Tridin Software Finance Management.</span>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 no-print">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#17233C] bg-[#F5F7FC] hover:bg-[#EBF0FA] border border-[#E2E8F4] rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={openReceiptPrintDialog}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-sm font-bold btn-teal rounded-xl"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-sm font-bold btn-royal rounded-xl"
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
