import React from 'react';
import { WorkerPayoutItem, PayoutStatus } from '../types';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  HardHat,
  Briefcase,
  Building,
} from 'lucide-react';

interface PayoutDetailsModalProps {
  isOpen: boolean;
  payout: WorkerPayoutItem | null;
  onClose: () => void;
  onNavigateToWorker?: (workerId: string) => void;
  onNavigateToJob?: (jobId: string) => void;
  onNavigateToTransaction?: (transactionId: string) => void;
}

export const PayoutDetailsModal: React.FC<PayoutDetailsModalProps> = ({
  isOpen,
  payout,
  onClose,
  onNavigateToWorker,
  onNavigateToJob,
  onNavigateToTransaction,
}) => {
  if (!isOpen || !payout) return null;

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
            Disbursed (Paid)
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            <Clock className="w-3 h-3 text-[#1C4E80]" />
            In Bank Clearance
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <Clock className="w-3 h-3 text-[#B26A00]" />
            Pending Batch Run
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <XCircle className="w-3 h-3 text-[#B42318]" />
            Transfer Failed
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
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                  Worker Disbursal Voucher
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                  {payout.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">Direct Benefit Transfer & Bank Settlement Ledger</p>
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
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Disbursal Status</span>
              <p className="text-xs font-mono font-bold text-[#1F2933] mt-0.5">Date: {payout.payoutDate}</p>
            </div>
            {getStatusBadge(payout.status)}
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12355B] block pb-1 border-b border-[#D5DCE3]">
              Net Disbursal Computation
            </span>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[#5B6573]">
                <span>Gross Job Earning</span>
                <span className="font-mono font-semibold text-[#1F2933]">₹{payout.grossEarning.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#B42318]">
                <span>Platform Commission Deducted</span>
                <span className="font-mono font-semibold">-₹{payout.commission.toLocaleString('en-IN')}</span>
              </div>
              {payout.adjustments > 0 && (
                <div className="flex justify-between text-[#B26A00]">
                  <span>Adjudication / Penalty Adjustment</span>
                  <span className="font-mono font-semibold">-₹{payout.adjustments.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#BAC7D5] font-bold text-sm text-[#2E7D32]">
                <span>Net Transfer Amount</span>
                <span className="font-mono text-base">₹{payout.netPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Transfer Details & Destination */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[#12355B]">
              <Building className="w-3.5 h-3.5" />
              <span>Remittance Channel</span>
            </div>
            <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5B6573]">Payment Route:</span>
                <span className="font-bold text-[#1F2933]">{payout.payoutMethod}</span>
              </div>
              {payout.bankAccountMasked && (
                <div className="flex justify-between">
                  <span className="text-[#5B6573]">Account Mask:</span>
                  <span className="font-mono font-bold text-[#12355B]">{payout.bankAccountMasked}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToWorker && onNavigateToWorker(payout.worker.workerId);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <HardHat className="w-3.5 h-3.5 mx-auto text-[#E67E22] mb-0.5" />
              <span>Worker Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToJob && onNavigateToJob(payout.jobId);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 mx-auto text-[#1C4E80] mb-0.5" />
              <span>Job Work Order</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTransaction && onNavigateToTransaction(payout.transactionId);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 mx-auto text-[#2E7D32] mb-0.5" />
              <span>Transaction Ref</span>
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
