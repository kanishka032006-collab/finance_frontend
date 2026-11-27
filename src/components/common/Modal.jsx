import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#17233C]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-2 sm:p-4 text-center">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-premium transition-all my-2 sm:my-8 w-full ${maxWidth} border border-[#E2E8F4]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F4] px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F5F7FC]/80">
            <h3 className="text-base sm:text-lg font-bold text-[#17233C] tracking-tight">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#718096] hover:bg-[#EBF0FA] hover:text-[#17233C] transition shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 max-h-[82vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
