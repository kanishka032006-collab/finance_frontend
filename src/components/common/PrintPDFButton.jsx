import React, { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';

const PrintPDFButton = ({
  targetId = 'printable-area',
  title = 'TRIDIN FINANCE REPORT',
  compact = false,
  className = '',
}) => {
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    const target = document.getElementById(targetId);
    if (!target) {
      window.print();
      return;
    }

    setPrinting(true);

    const original = document.title;
    document.title = title;

    document.body.classList.add('tridin-printing');
    target.classList.add('tridin-print-target');

    setTimeout(() => {
      window.print();
      document.body.classList.remove('tridin-printing');
      target.classList.remove('tridin-print-target');
      document.title = original;
      setPrinting(false);
    }, 150);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handlePrint}
        disabled={printing}
        title="Print / Download PDF"
        className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl border border-[#E2E8F4] bg-white text-[#17233C] text-xs font-bold shadow-xs hover:bg-[#EEF2FC] hover:text-[#2446A8] hover:border-[#2446A8]/30 transition disabled:opacity-60 no-print ${className}`}
      >
        {printing ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#2446A8]" />
        ) : (
          <>
            <Printer className="w-4 h-4 text-[#2446A8]" />
            <Download className="w-3.5 h-3.5 text-[#13A89E]" />
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 no-print ${className}`}>
      <button
        type="button"
        onClick={handlePrint}
        disabled={printing}
        className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#17233C] text-white text-xs font-bold shadow-sm hover:bg-[#2446A8] active:scale-95 transition disabled:opacity-60"
      >
        {printing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Printer className="w-4 h-4" />
        )}
        {printing ? 'Preparing...' : 'Print / PDF'}
      </button>
    </div>
  );
};

export default PrintPDFButton;
