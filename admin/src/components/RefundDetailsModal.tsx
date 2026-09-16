import React from 'react';
import { RefundItem, RefundStatus } from '../types';
import {
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  CreditCard,
  ShieldAlert,
  User,
} from 'lucide-react';

interface RefundDetailsModalProps {
  isOpen: boolean;
  refund: RefundItem | null;
  onClose: () => void;
  onNavigateToComplaint?: (complaintId: string, refundId?: string) => void;
  onNavigateToJob?: (jobId: string, refundId?: string) => void;
  onNavigateToTransaction?: (transactionId: string, refundId?: string) => void;
}

export const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({
  isOpen,
  refund,
  onClose,
  onNavigateToComplaint,
  onNavigateToJob,
  onNavigateToTransaction,
}) => {
  if (!isOpen || !refund) return null;

  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
            Refund Settled
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            <Clock className="w-3 h-3 text-[#1C4E80]" />
            In Bank Queue
          </span>
        );
      case 'Requested':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <Clock className="w-3 h-3 text-[#B26A00]" />
            Awaiting Clearance
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <XCircle className="w-3 h-3 text-[#B42318]" />
            Reversal Failed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-sm max-w-xl w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                  Citizen Refund Voucher
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                  {refund.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">Escrow Reversal & Adjudication Compensation Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F4F6F8]">
          <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Reversal Status</span>
              <p className="text-xs font-mono font-bold text-[#1F2933] mt-0.5">
                Requested: {refund.requestedDate} {refund.completedDate && `• Completed: ${refund.completedDate}`}
              </p>
            </div>
            {getStatusBadge(refund.status)}
          </div>

          {/* Refund Details */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12355B] block pb-1 border-b border-[#D5DCE3]">
              Financial Details
            </span>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Original Transaction Amount</span>
                <span className="font-mono font-bold text-[#1F2933]">₹{refund.originalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#B42318] block">Refund Amount Awarded</span>
                <span className="font-mono font-bold text-base text-[#B42318]">
                  ₹{refund.refundAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block mb-0.5">
                Official Redressal Reason
              </span>
              <p className="p-2.5 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] text-[#1F2933] italic">
                {refund.reason}
              </p>
            </div>
          </div>

          {/* Beneficiary */}
          <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Beneficiary Citizen</span>
            <div className="flex items-center gap-1.5 font-bold text-[#1F2933]">
              <User className="w-3.5 h-3.5 text-[#12355B]" />
              <span>{refund.customer.name}</span>
              <span className="font-mono font-normal text-[#12355B]">({refund.customer.userId})</span>
            </div>
            <p className="font-mono text-[#5B6573]">{refund.customer.phone}</p>
          </div>

          {/* Cross-Module Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {refund.complaintId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToComplaint && onNavigateToComplaint(refund.complaintId!, refund.id);
                }}
                className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 mx-auto text-[#B42318] mb-0.5" />
                <span>Dispute ({refund.complaintId})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTransaction && onNavigateToTransaction(refund.transactionId, refund.id);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 mx-auto text-[#2E7D32] mb-0.5" />
              <span>TXN ({refund.transactionId})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToJob && onNavigateToJob(refund.jobId, refund.id);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 mx-auto text-[#1C4E80] mb-0.5" />
              <span>Job ({refund.jobId})</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D5DCE3] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
