import React from 'react';
import { TransactionItem, TransactionStatus } from '../types';
import {
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ArrowRight,
  User,
  HardHat,
  Briefcase,
} from 'lucide-react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  transaction: TransactionItem | null;
  onClose: () => void;
  onNavigateToJob?: (jobId: string, transactionId?: string) => void;
  onNavigateToUser?: (userId: string, transactionId?: string) => void;
  onNavigateToWorker?: (workerId: string, transactionId?: string) => void;
  onNavigateToRefund?: (refundId: string, transactionId?: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
  onNavigateToRefund,
}) => {
  if (!isOpen || !transaction) return null;

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'Successful':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
            Successful Settlement
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <Clock className="w-3 h-3 text-[#B26A00]" />
            Escrow Pending
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            <RotateCcw className="w-3 h-3 text-[#1C4E80]" />
            Refund Processed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <XCircle className="w-3 h-3 text-[#B42318]" />
            Payment Failed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-sm max-w-2xl w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
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
                  Transaction Voucher & Ledger Details
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                  {transaction.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">
                Official Gateway Audit Record & Financial Reconciliation Ledger
              </p>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F4F6F8]">
          {/* Top Status & Gateway Bar */}
          <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Payment Gateway Reference</span>
              <p className="font-mono text-xs font-bold text-[#12355B] mt-0.5">{transaction.gatewayRefId}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(transaction.status)}
            </div>
          </div>

          {/* Amount Breakdown Card */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                Financial Distribution Breakdown
              </span>
              <span className="text-[10px] text-[#5B6573] italic">Automatic Split at Escrow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Gross Citizen Payment</span>
                <span className="text-lg font-bold font-mono text-[#1F2933] block mt-0.5">
                  ₹{transaction.grossAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#5B6573]">Total Billed Amount</span>
              </div>

              <div className="p-3 bg-[#EAF2F8] rounded-xs border border-[#BAC7D5]">
                <span className="text-[10px] uppercase font-bold text-[#1C4E80] block">Platform Commission (10%)</span>
                <span className="text-lg font-bold font-mono text-[#12355B] block mt-0.5">
                  ₹{transaction.commissionAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#1C4E80]">Ref: {transaction.commissionId}</span>
              </div>

              <div className="p-3 bg-[#E8F5E9] rounded-xs border border-[#C8E6C9]">
                <span className="text-[10px] uppercase font-bold text-[#2E7D32] block">Worker Net Payable</span>
                <span className="text-lg font-bold font-mono text-[#2E7D32] block mt-0.5">
                  ₹{transaction.workerAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#2E7D32]">
                  {transaction.payoutId ? `Payout: ${transaction.payoutId}` : 'Direct Disbursal'}
                </span>
              </div>
            </div>

            {transaction.refundAmount && transaction.refundAmount > 0 && (
              <div className="p-3 bg-[#FFF8E1] rounded-xs border border-[#FFE082] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#B26A00] block">Refund Deducted / Processed</span>
                  <span className="text-[11px] text-[#5B6573]">
                    Awarded under dispute resolution settlement.
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-[#B26A00]">
                    -₹{transaction.refundAmount.toLocaleString('en-IN')}
                  </span>
                  {transaction.refundId && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToRefund && onNavigateToRefund(transaction.refundId!, transaction.id);
                      }}
                      className="block text-[10px] font-mono text-[#1C4E80] hover:underline"
                    >
                      View {transaction.refundId}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Parties & Related Record References */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer */}
            <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#12355B]">
                  <User className="w-3.5 h-3.5" />
                  <span>Paying Customer</span>
                </div>
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-[#1F2933]">{transaction.customer.name}</p>
                <p className="font-mono text-[#12355B]">{transaction.customer.userId}</p>
                <p className="font-mono text-[#5B6573]">{transaction.customer.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToUser && onNavigateToUser(transaction.customer.userId, transaction.id);
                }}
                className="inline-flex items-center gap-1 text-xs text-[#12355B] font-semibold hover:underline pt-1 cursor-pointer"
              >
                <span>View User Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Worker */}
            <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#E67E22]">
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Beneficiary Worker</span>
                </div>
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-[#1F2933]">{transaction.worker.name}</p>
                <p className="font-mono text-[#12355B]">{transaction.worker.workerId}</p>
                <p className="font-mono text-[#5B6573]">{transaction.worker.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToWorker && onNavigateToWorker(transaction.worker.workerId, transaction.id);
                }}
                className="inline-flex items-center gap-1 text-xs text-[#12355B] font-semibold hover:underline pt-1 cursor-pointer"
              >
                <span>View Worker Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Job Reference */}
          <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1C4E80]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Associated Work Order</span>
                <span className="font-mono font-bold text-[#12355B]">{transaction.jobId}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToJob && onNavigateToJob(transaction.jobId, transaction.id);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#EAF2F8] hover:bg-[#12355B] text-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Inspect Job Record</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-between">
          <span className="text-[10px] text-[#5B6573]">
            Payment Method: <strong className="text-[#1F2933]">{transaction.paymentMethod}</strong> • Timestamp:{' '}
            <strong className="text-[#1F2933]">{transaction.date} {transaction.time}</strong>
          </span>
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
