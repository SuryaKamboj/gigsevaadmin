import React from 'react';
import { PlatformCommissionItem } from '../types';
import {
  X,
  Building2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Briefcase,
  CreditCard,
  HardHat,
} from 'lucide-react';

interface CommissionDetailsModalProps {
  isOpen: boolean;
  commission: PlatformCommissionItem | null;
  onClose: () => void;
  onNavigateToJob?: (jobId: string) => void;
  onNavigateToTransaction?: (transactionId: string) => void;
  onNavigateToWorker?: (workerId: string) => void;
}

export const CommissionDetailsModal: React.FC<CommissionDetailsModalProps> = ({
  isOpen,
  commission,
  onClose,
  onNavigateToJob,
  onNavigateToTransaction,
  onNavigateToWorker,
}) => {
  if (!isOpen || !commission) return null;

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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                  Platform Commission Voucher
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                  {commission.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">Treasury Revenue & Tariff Split Record</p>
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
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Collection Status</span>
              <p className="text-xs font-mono font-bold text-[#1F2933] mt-0.5">Date: {commission.date}</p>
            </div>
            {commission.status === 'Collected' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                Collected
              </span>
            ) : commission.status === 'Pending Escrow' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
                <Clock className="w-3 h-3 text-[#B26A00]" />
                Pending Escrow
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
                <RotateCcw className="w-3 h-3 text-[#B42318]" />
                Reversed
              </span>
            )}
          </div>

          {/* Revenue Calculation */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#12355B] block pb-1 border-b border-[#D5DCE3]">
              Tariff & Revenue Accounting
            </span>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Service Category</span>
                <span className="font-bold text-[#1F2933]">{commission.serviceCategory}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Applied Tariff Rate</span>
                <span className="font-mono font-bold text-[#12355B]">{commission.rate}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Gross Transaction</span>
                <span className="font-mono font-bold text-[#1F2933]">₹{commission.grossAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2E7D32] block">Platform Fee Retained</span>
                <span className="font-mono font-bold text-sm text-[#2E7D32]">
                  ₹{commission.commissionAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs space-y-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Parties Involved:</span>
            <div className="flex justify-between">
              <span className="text-[#5B6573]">Citizen:</span>
              <span className="font-bold text-[#1F2933]">{commission.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5B6573]">Partner:</span>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToWorker && commission.workerId) {
                    onClose();
                    onNavigateToWorker(commission.workerId);
                  }
                }}
                className="font-bold text-[#12355B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HardHat className="w-3 h-3 text-[#E67E22]" />
                <span>{commission.workerName} ({commission.workerId})</span>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTransaction && onNavigateToTransaction(commission.transactionId);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 mx-auto text-[#2E7D32] mb-0.5" />
              <span>View Transaction ({commission.transactionId})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToJob && onNavigateToJob(commission.jobId);
              }}
              className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:bg-[#EAF2F8] hover:border-[#12355B] text-center text-xs text-[#12355B] font-semibold transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 mx-auto text-[#1C4E80] mb-0.5" />
              <span>View Work Order ({commission.jobId})</span>
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
