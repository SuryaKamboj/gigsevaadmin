import React from 'react';
import { FailedPaymentItem } from '../types';
import {
  X,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface FailedPaymentDetailsModalProps {
  isOpen: boolean;
  failedPayment: FailedPaymentItem | null;
  onClose: () => void;
  onNavigateToJob?: (jobId: string) => void;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToWorker?: (workerId: string) => void;
}

export const FailedPaymentDetailsModal: React.FC<FailedPaymentDetailsModalProps> = ({
  isOpen,
  failedPayment,
  onClose,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
}) => {
  if (!isOpen || !failedPayment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-sm max-w-lg w-full shadow-2xl border border-[#B42318] flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#B42318] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-white/20 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                  Gateway Transaction Failure Audit
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-white text-[#B42318] font-bold rounded-xs">
                  {failedPayment.id}
                </span>
              </div>
              <p className="text-[10px] text-white/80">Diagnostic Error Report & Gateway Exception Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-xs hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F4F6F8]">
          {/* Error Banner */}
          <div className="bg-[#FFEBEE] p-3.5 rounded-sm border border-[#FFCDD2] shadow-xs space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#B42318] uppercase text-[11px]">Failure Diagnostic Reason:</span>
              <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#B42318] bg-white px-2 py-0.5 rounded-xs border border-[#FFCDD2]">
                <XCircle className="w-3 h-3" />
                {failedPayment.failureReason}
              </span>
            </div>
            <p className="text-[#1F2933]">
              The acquiring banking network returned error response code during payment capture handshake.
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12355B] block pb-1 border-b border-[#D5DCE3]">
              Transaction Details
            </span>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Attempted Amount</span>
                <span className="font-mono font-bold text-sm text-[#1F2933]">
                  ₹{failedPayment.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Payment Instrument</span>
                <span className="font-semibold text-[#1F2933]">{failedPayment.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Gateway Attempt Ref</span>
                <span className="font-mono font-bold text-[#12355B] text-[11px] truncate block">
                  {failedPayment.gatewayRefId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Failure Timestamp</span>
                <span className="font-mono text-[#5B6573]">
                  {failedPayment.date} • {failedPayment.time}
                </span>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xs border border-[#D5DCE3] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Customer:</span>
              <p className="font-bold text-[#1F2933]">{failedPayment.customer.name}</p>
              <p className="font-mono text-[10px] text-[#5B6573]">{failedPayment.customer.userId}</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToUser && onNavigateToUser(failedPayment.customer.userId);
                }}
                className="text-[10px] text-[#12355B] font-semibold hover:underline block pt-1"
              >
                View User Profile →
              </button>
            </div>

            <div className="p-3 bg-white rounded-xs border border-[#D5DCE3] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Worker:</span>
              <p className="font-bold text-[#1F2933]">{failedPayment.worker.name}</p>
              <p className="font-mono text-[10px] text-[#5B6573]">{failedPayment.worker.workerId}</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToWorker && onNavigateToWorker(failedPayment.worker.workerId);
                }}
                className="text-[10px] text-[#12355B] font-semibold hover:underline block pt-1"
              >
                View Worker Profile →
              </button>
            </div>
          </div>

          {/* Job Link */}
          <div className="bg-white p-3 rounded-xs border border-[#D5DCE3] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Related Job</span>
              <span className="font-mono font-bold text-[#12355B]">{failedPayment.jobId}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToJob && onNavigateToJob(failedPayment.jobId);
              }}
              className="px-3 py-1 bg-[#EAF2F8] hover:bg-[#12355B] text-[#12355B] hover:text-white rounded-xs font-semibold text-xs border border-[#BAC7D5] transition-colors cursor-pointer"
            >
              Open Job Record
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
