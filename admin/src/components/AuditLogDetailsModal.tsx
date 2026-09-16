import React from 'react';
import { AuditLogItem } from '../types';
import { X, ShieldCheck } from 'lucide-react';

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-sm max-w-lg w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Audit Trail Evidence Voucher
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#2E7D32] font-bold rounded-xs text-white">
                  {log.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">Immutable Departmental Accountability Record</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#F4F6F8]">
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Action Category</span>
              <span className="font-mono font-bold text-xs text-[#12355B] bg-[#EAF2F8] px-2 py-0.5 rounded-xs border border-[#BAC7D5]">
                {log.module}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Executed Action</span>
              <p className="text-sm font-bold text-[#1F2933]">{log.action}</p>
            </div>

            <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Action Summary & Rationale</span>
              <p className="text-xs text-[#1F2933] leading-relaxed font-mono">{log.details}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Officer Attribution</span>
                <span className="font-bold text-[#1F2933] block mt-0.5">{log.adminName}</span>
                <span className="font-mono text-[10px] text-[#5B6573]">{log.adminId}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Target Record ID</span>
                <span className="font-mono font-bold text-xs text-[#12355B] block mt-0.5">{log.recordId}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Recorded Timestamp</span>
                <span className="font-mono text-[11px] text-[#5B6573] block mt-0.5">
                  {log.date} • {log.time}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Client IP Address</span>
                <span className="font-mono text-[11px] text-[#5B6573] block mt-0.5">{log.ipAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-between">
          <span className="text-[10px] text-[#5B6573] italic">Tamper-evident record log</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs cursor-pointer"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
