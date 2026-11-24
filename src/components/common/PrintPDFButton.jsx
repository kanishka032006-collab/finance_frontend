import React, { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';

/**
 * PrintPDFButton – Universal print / download-PDF button.
 *
 * Props:
 *  targetId   – id of the HTML element to print (default: 'printable-area')
 *  title      – document title shown in the print dialog / PDF filename
 *  compact    – boolean, renders a smaller icon-only button
 *  className  – extra classes on the wrapper div
 */
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

    // Clone the target into a temporary full-page wrapper
    const original = document.title;
    document.title = title;

    // Add a temporary class so only the target is visible during print
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
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-60 no-print ${className}`}
      >
        {printing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <Printer className="w-3.5 h-3.5" />
            <Download className="w-3 h-3 opacity-60" />
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 active:scale-95 transition disabled:opacity-60"
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
