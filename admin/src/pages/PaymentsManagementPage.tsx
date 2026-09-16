import React, { useState, useMemo, useEffect } from 'react';
import {
  TransactionItem,
  WorkerPayoutItem,
  PlatformCommissionItem,
  RefundItem,
  FailedPaymentItem,
  PaymentSettingsRules,
  NavigationSourceContext,
} from '../types';
import {
  MOCK_TRANSACTIONS,
  MOCK_WORKER_PAYOUTS,
  MOCK_PLATFORM_COMMISSIONS,
  MOCK_REFUNDS,
  MOCK_FAILED_PAYMENTS,
  MOCK_PAYMENT_SETTINGS,
} from '../data/mockData';
import { Pagination } from '../components/Pagination';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { PayoutDetailsModal } from '../components/PayoutDetailsModal';
import { CommissionDetailsModal } from '../components/CommissionDetailsModal';
import { RefundDetailsModal } from '../components/RefundDetailsModal';
import { FailedPaymentDetailsModal } from '../components/FailedPaymentDetailsModal';
import { NavigationContextBar } from '../components/NavigationContextBar';
import {
  CreditCard,
  Building2,
  RotateCcw,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  HardHat,
  Eye,
} from 'lucide-react';

type PaymentTab =
  | 'transactions'
  | 'payouts'
  | 'commissions'
  | 'refunds'
  | 'failed'
  | 'settings';

const PAGE_SIZE = 10;

interface PaymentsManagementPageProps {
  initialTab?: PaymentTab;
  initialTransactionId?: string | null;
  initialRefundId?: string | null;
  navContext?: NavigationSourceContext | null;
  navStack?: NavigationSourceContext[];
  onNavigateToStackIndex?: (index: number) => void;
  onReturnToSource?: () => void;
  onNavigateToJob?: (jobId: string, transactionOrRefundId?: string) => void;
  onNavigateToUser?: (userId: string, transactionId?: string) => void;
  onNavigateToWorker?: (workerId: string, transactionId?: string) => void;
  onNavigateToComplaint?: (complaintId: string, refundId?: string) => void;
  onNavigateToTransaction?: (transactionId: string, refundId?: string) => void;
}

export const PaymentsManagementPage: React.FC<PaymentsManagementPageProps> = ({
  initialTab = 'transactions',
  initialTransactionId,
  initialRefundId,
  navContext,
  navStack,
  onNavigateToStackIndex,
  onReturnToSource,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
  onNavigateToComplaint,
  onNavigateToTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>(initialTab);

  // Datasets
  const [transactions] = useState<TransactionItem[]>(MOCK_TRANSACTIONS);
  const [payouts] = useState<WorkerPayoutItem[]>(MOCK_WORKER_PAYOUTS);
  const [commissions] = useState<PlatformCommissionItem[]>(MOCK_PLATFORM_COMMISSIONS);
  const [refunds] = useState<RefundItem[]>(MOCK_REFUNDS);
  const [failedPayments] = useState<FailedPaymentItem[]>(MOCK_FAILED_PAYMENTS);
  const [paymentSettings] = useState<PaymentSettingsRules>(MOCK_PAYMENT_SETTINGS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [failureReasonFilter, setFailureReasonFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<WorkerPayoutItem | null>(null);
  const [selectedCommission, setSelectedCommission] = useState<PlatformCommissionItem | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [selectedFailedPayment, setSelectedFailedPayment] = useState<FailedPaymentItem | null>(null);

  // Sync initial navigation requests
  useEffect(() => {
    if (initialTransactionId) {
      const found = transactions.find((t) => t.id.toLowerCase() === initialTransactionId.toLowerCase());
      if (found) {
        setSelectedTransaction(found);
        setActiveTab('transactions');
      }
    }
  }, [initialTransactionId, transactions]);

  useEffect(() => {
    if (initialRefundId) {
      const found = refunds.find((r) => r.id.toLowerCase() === initialRefundId.toLowerCase());
      if (found) {
        setSelectedRefund(found);
        setActiveTab('refunds');
      }
    }
  }, [initialRefundId, refunds]);

  // Reset pagination on tab or search change
  const handleTabChange = (tab: PaymentTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setStatusFilter('All');
    setMethodFilter('All');
    setCategoryFilter('All');
    setFailureReasonFilter('All');
    setCurrentPage(1);
  };

  // Aggregated KPIs
  const totalVolume = transactions.reduce((acc, t) => acc + (t.status === 'Successful' ? t.grossAmount : 0), 0);
  const totalCommissionVal = commissions.reduce((acc, c) => acc + (c.status === 'Collected' ? c.commissionAmount : 0), 0);
  const totalRefundedVal = refunds.reduce((acc, r) => acc + (r.status === 'Refunded' ? r.refundAmount : 0), 0);
  const totalFailedVal = failedPayments.reduce((acc, f) => acc + f.amount, 0);

  // SECTION 1: FILTERED TRANSACTIONS
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (methodFilter !== 'All' && t.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = t.id.toLowerCase().includes(q);
        const mJob = t.jobId.toLowerCase().includes(q);
        const mCust = t.customer.name.toLowerCase().includes(q) || t.customer.userId.toLowerCase().includes(q);
        const mWrk = t.worker.name.toLowerCase().includes(q) || t.worker.workerId.toLowerCase().includes(q);
        return mId || mJob || mCust || mWrk;
      }
      return true;
    });
  }, [transactions, statusFilter, methodFilter, searchQuery]);

  // SECTION 2: FILTERED PAYOUTS
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = p.id.toLowerCase().includes(q);
        const mWrk = p.worker.name.toLowerCase().includes(q) || p.worker.workerId.toLowerCase().includes(q);
        const mJob = p.jobId.toLowerCase().includes(q);
        const mTxn = p.transactionId.toLowerCase().includes(q);
        return mId || mWrk || mJob || mTxn;
      }
      return true;
    });
  }, [payouts, statusFilter, searchQuery]);

  // SECTION 3: FILTERED COMMISSIONS
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && c.serviceCategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = c.id.toLowerCase().includes(q);
        const mJob = c.jobId.toLowerCase().includes(q);
        const mTxn = c.transactionId.toLowerCase().includes(q);
        const mCust = c.customerName.toLowerCase().includes(q);
        const mWrk = c.workerName.toLowerCase().includes(q);
        return mId || mJob || mTxn || mCust || mWrk;
      }
      return true;
    });
  }, [commissions, statusFilter, categoryFilter, searchQuery]);

  // SECTION 4: FILTERED REFUNDS
  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = r.id.toLowerCase().includes(q);
        const mTxn = r.transactionId.toLowerCase().includes(q);
        const mJob = r.jobId.toLowerCase().includes(q);
        const mCust = r.customer.name.toLowerCase().includes(q);
        const mCmp = r.complaintId?.toLowerCase().includes(q);
        return mId || mTxn || mJob || mCust || mCmp;
      }
      return true;
    });
  }, [refunds, statusFilter, searchQuery]);

  // SECTION 5: FILTERED FAILED PAYMENTS
  const filteredFailedPayments = useMemo(() => {
    return failedPayments.filter((f) => {
      if (failureReasonFilter !== 'All' && f.failureReason !== failureReasonFilter) return false;
      if (methodFilter !== 'All' && f.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = f.id.toLowerCase().includes(q);
        const mJob = f.jobId.toLowerCase().includes(q);
        const mCust = f.customer.name.toLowerCase().includes(q);
        const mWrk = f.worker.name.toLowerCase().includes(q);
        return mId || mJob || mCust || mWrk;
      }
      return true;
    });
  }, [failedPayments, failureReasonFilter, methodFilter, searchQuery]);

  // Pagination slicing helper
  const getPaginatedList = (items: any[]) => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Successful':
      case 'Paid':
      case 'Collected':
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
            {status}
          </span>
        );
      case 'Pending':
      case 'Processing':
      case 'Requested':
      case 'Pending Escrow':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <Clock className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            {status}
          </span>
        );
      case 'Failed':
      case 'Reversed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <XCircle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6573]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Cross-Module Navigation Context Bar */}
      {navContext && onReturnToSource && (
        <NavigationContextBar
          navContext={navContext}
          navStack={navStack}
          onNavigateToStackIndex={onNavigateToStackIndex}
          onReturnToSource={onReturnToSource}
          filterActive={Boolean(navContext.filterCriteria?.transactionId || navContext.filterCriteria?.refundId)}
          filterLabel={
            navContext.filterCriteria?.transactionId
              ? `Transaction: ${navContext.filterCriteria.transactionId}`
              : navContext.filterCriteria?.refundId
              ? `Refund: ${navContext.filterCriteria.refundId}`
              : undefined
          }
          currentDestinationName="Payments & Finance"
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#BAC7D5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#12355B] uppercase">
              Payments & Financial Administration
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EAF2F8] text-[#12355B] font-bold rounded-xs border border-[#BAC7D5]">
              FIN-MOD-05
            </span>
          </div>
          <p className="text-xs text-[#5B6573] mt-0.5">
            Treasury management: escrow settlement registers, worker disbursals, platform tariff retention, and grievance refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Official Treasury Ledger & GST Reconciliation Report (CSV)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] hover:bg-[#F4F6F8] rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Export Financial Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top High-level Financial Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] block">Gross Payment Volume</span>
          <div className="text-base sm:text-lg font-bold font-mono text-[#12355B] mt-1">
            ₹{totalVolume.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#2E7D32] font-semibold">{transactions.length} Total Vouchers</span>
        </div>

        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C4E80] block">Platform Fee Retained</span>
          <div className="text-base sm:text-lg font-bold font-mono text-[#1C4E80] mt-1">
            ₹{totalCommissionVal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#5B6573]">Effective ~10% Rate</span>
        </div>

        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B26A00] block">Citizen Refunds Awarded</span>
          <div className="text-base sm:text-lg font-bold font-mono text-[#B26A00] mt-1">
            ₹{totalRefundedVal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#B26A00] font-semibold">{refunds.length} Dispute Claims</span>
        </div>

        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318] block">Failed Attempts Value</span>
          <div className="text-base sm:text-lg font-bold font-mono text-[#B42318] mt-1">
            ₹{totalFailedVal.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#B42318] font-semibold">{failedPayments.length} Gateway Exceptions</span>
        </div>
      </div>

      {/* Main Container with 6 Section Tabs */}
      <div className="bg-white rounded-sm border border-[#D5DCE3] shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#D5DCE3] bg-[#F4F6F8] px-3 pt-2 gap-1.5 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => handleTabChange('transactions')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#12355B]" />
            <span>1. Transactions ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('payouts')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>2. Worker Payouts ({payouts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('commissions')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'commissions'
                ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#1C4E80]" />
            <span>3. Platform Commission ({commissions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('refunds')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'refunds'
                ? 'bg-white text-[#B26A00] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#B26A00]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B26A00]" />
            <span>4. Refunds ({refunds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('failed')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'failed'
                ? 'bg-white text-[#B42318] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#B42318]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#B42318]" />
            <span>5. Failed Payments ({failedPayments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#5B6573]" />
            <span>6. Payment Rules & Config</span>
          </button>
        </div>

        {/* Toolbar for Search & Filters (Shown on data tabs) */}
        {activeTab !== 'settings' && (
          <div className="p-3 border-b border-[#D5DCE3] bg-[#F4F6F8] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="relative w-full lg:w-96">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6573]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  activeTab === 'transactions'
                    ? 'Search by TXN ID, Job ID, customer or worker...'
                    : activeTab === 'payouts'
                    ? 'Search by Payout ID, Worker ID, name, Job ID...'
                    : activeTab === 'commissions'
                    ? 'Search by Commission ID, Job, customer...'
                    : activeTab === 'refunds'
                    ? 'Search by Refund ID, TXN ID, Job ID, customer...'
                    : 'Search failed payments by TXN ID, customer...'
                }
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#8795A5] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5B6573]">
                <Filter className="w-3.5 h-3.5 text-[#12355B]" />
                <span className="hidden sm:inline font-semibold text-[11px] uppercase">Filters:</span>
              </div>

              {/* Status Filter */}
              {activeTab !== 'failed' && (
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  {activeTab === 'transactions' && (
                    <>
                      <option value="Successful">Successful</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
                    </>
                  )}
                  {activeTab === 'payouts' && (
                    <>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </>
                  )}
                  {activeTab === 'commissions' && (
                    <>
                      <option value="Collected">Collected</option>
                      <option value="Pending Escrow">Pending Escrow</option>
                      <option value="Reversed">Reversed</option>
                    </>
                  )}
                  {activeTab === 'refunds' && (
                    <>
                      <option value="Refunded">Refunded</option>
                      <option value="Processing">Processing</option>
                      <option value="Requested">Requested</option>
                      <option value="Failed">Failed</option>
                    </>
                  )}
                </select>
              )}

              {/* Payment Method Filter */}
              {(activeTab === 'transactions' || activeTab === 'failed') && (
                <select
                  value={methodFilter}
                  onChange={(e) => {
                    setMethodFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] cursor-pointer"
                >
                  <option value="All">Method: All</option>
                  <option value="UPI / Instant">UPI / Instant</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Debit/Credit Card">Debit/Credit Card</option>
                  <option value="Escrow / Wallet">Escrow / Wallet</option>
                </select>
              )}

              {/* Category Filter for Commissions */}
              {activeTab === 'commissions' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] cursor-pointer"
                >
                  <option value="All">Category: All</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Home Cleaning">Home Cleaning</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                </select>
              )}

              {/* Failure Reason Filter */}
              {activeTab === 'failed' && (
                <select
                  value={failureReasonFilter}
                  onChange={(e) => {
                    setFailureReasonFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] cursor-pointer"
                >
                  <option value="All">Reason: All</option>
                  <option value="UPI Timeout">UPI Timeout</option>
                  <option value="Bank Declined">Bank Declined</option>
                  <option value="Payment Gateway Error">Payment Gateway Error</option>
                  <option value="Insufficient Funds">Insufficient Funds</option>
                  <option value="Network Error">Network Error</option>
                  <option value="Payment Cancelled">Payment Cancelled</option>
                </select>
              )}

              {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All' || categoryFilter !== 'All' || failureReasonFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setMethodFilter('All');
                    setCategoryFilter('All');
                    setFailureReasonFilter('All');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#B42318] hover:text-[#911810] px-2 py-1.5 bg-white border border-[#FFCDD2] rounded-xs font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 1: MASTER TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div>
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-[#5B6573]">
                <CreditCard className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
                <p className="text-xs font-bold text-[#1F2933] uppercase">No transactions found</p>
                <p className="text-[11px] text-[#5B6573] mt-0.5">No records match your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
                      <tr>
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Worker</th>
                        <th className="py-2.5 px-3 text-right">Gross Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {getPaginatedList(filteredTransactions).map((t: TransactionItem) => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedTransaction(t)}
                          className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#12355B]">{t.id}</td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onNavigateToJob && onNavigateToJob(t.jobId)}
                              className="hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{t.jobId}</span>
                              <ArrowRight className="w-3 h-3 text-[#E67E22]" />
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#1F2933] block">{t.customer.name}</span>
                            <span className="font-mono text-[10px] text-[#5B6573]">{t.customer.userId}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#1F2933] block">{t.worker.name}</span>
                            <span className="font-mono text-[10px] text-[#5B6573]">{t.worker.workerId}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#1F2933]">
                            ₹{t.grossAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">{t.paymentMethod}</td>
                          <td className="py-3 px-3 whitespace-nowrap text-[#5B6573] font-mono text-[11px]">{t.date}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(t.status)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedTransaction(t)}
                              className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                              title="View transaction dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1}
                  totalItems={filteredTransactions.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemLabel="transactions"
                />
              </>
            )}
          </div>
        )}

        {/* SECTION 2: WORKER PAYOUTS */}
        {activeTab === 'payouts' && (
          <div>
            {filteredPayouts.length === 0 ? (
              <div className="py-12 text-center text-[#5B6573]">
                <HardHat className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
                <p className="text-xs font-bold text-[#1F2933] uppercase">No payout records found</p>
                <p className="text-[11px] text-[#5B6573] mt-0.5">No records match your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
                      <tr>
                        <th className="py-2.5 px-3">Payout ID</th>
                        <th className="py-2.5 px-3">Worker</th>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3 text-right">Gross Earning</th>
                        <th className="py-2.5 px-3 text-right">Commission</th>
                        <th className="py-2.5 px-3 text-right">Net Payout</th>
                        <th className="py-2.5 px-3">Payout Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {getPaginatedList(filteredPayouts).map((p: WorkerPayoutItem) => (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPayout(p)}
                          className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#12355B]">{p.id}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#1F2933] block">{p.worker.name}</span>
                            <span className="font-mono text-[10px] text-[#5B6573]">{p.worker.workerId} • {p.worker.category}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]">{p.jobId}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#5B6573]">₹{p.grossEarning.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right font-mono text-[#B42318]">-₹{p.commission.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#2E7D32]">
                            ₹{p.netPayout.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-[#5B6573] font-mono text-[11px]">{p.payoutDate}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedPayout(p)}
                              className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                              title="View payout voucher dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredPayouts.length / PAGE_SIZE) || 1}
                  totalItems={filteredPayouts.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemLabel="payouts"
                />
              </>
            )}
          </div>
        )}

        {/* SECTION 3: PLATFORM COMMISSION */}
        {activeTab === 'commissions' && (
          <div>
            {filteredCommissions.length === 0 ? (
              <div className="py-12 text-center text-[#5B6573]">
                <Building2 className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
                <p className="text-xs font-bold text-[#1F2933] uppercase">No commission records found</p>
                <p className="text-[11px] text-[#5B6573] mt-0.5">No records match your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
                      <tr>
                        <th className="py-2.5 px-3">Commission ID</th>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Service & Category</th>
                        <th className="py-2.5 px-3 text-right">Gross Amount</th>
                        <th className="py-2.5 px-3 text-center">Rate</th>
                        <th className="py-2.5 px-3 text-right">Retained Commission</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {getPaginatedList(filteredCommissions).map((c: PlatformCommissionItem) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCommission(c)}
                          className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#12355B]">{c.id}</td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]">{c.jobId}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#1F2933] block truncate max-w-[200px]" title={c.service}>
                              {c.service}
                            </span>
                            <span className="text-[10px] text-[#5B6573]">{c.serviceCategory}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[#5B6573]">₹{c.grossAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-[#12355B]">{c.rate}%</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#2E7D32]">
                            ₹{c.commissionAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-[#5B6573] font-mono text-[11px]">{c.date}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedCommission(c)}
                              className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                              title="View commission entry dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredCommissions.length / PAGE_SIZE) || 1}
                  totalItems={filteredCommissions.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemLabel="commissions"
                />
              </>
            )}
          </div>
        )}

        {/* SECTION 4: REFUNDS */}
        {activeTab === 'refunds' && (
          <div>
            {filteredRefunds.length === 0 ? (
              <div className="py-12 text-center text-[#5B6573]">
                <RotateCcw className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
                <p className="text-xs font-bold text-[#1F2933] uppercase">No refunds found</p>
                <p className="text-[11px] text-[#5B6573] mt-0.5">No records match your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
                      <tr>
                        <th className="py-2.5 px-3">Refund ID</th>
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3 text-right">Refund Amount</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {getPaginatedList(filteredRefunds).map((r: RefundItem) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedRefund(r)}
                          className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#12355B]">{r.id}</td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]">{r.transactionId}</td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]">{r.jobId}</td>
                          <td className="py-3 px-3 font-semibold text-[#1F2933]">{r.customer.name}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#B42318]">
                            ₹{r.refundAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 max-w-[200px] truncate text-[#5B6573]" title={r.reason}>
                            {r.reason}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-[#5B6573] font-mono text-[11px]">{r.requestedDate}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(r.status)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedRefund(r)}
                              className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                              title="View refund claim dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredRefunds.length / PAGE_SIZE) || 1}
                  totalItems={filteredRefunds.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemLabel="refunds"
                />
              </>
            )}
          </div>
        )}

        {/* SECTION 5: FAILED PAYMENTS */}
        {activeTab === 'failed' && (
          <div>
            {filteredFailedPayments.length === 0 ? (
              <div className="py-12 text-center text-[#5B6573]">
                <AlertTriangle className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
                <p className="text-xs font-bold text-[#1F2933] uppercase">No failed payments found</p>
                <p className="text-[11px] text-[#5B6573] mt-0.5">All banking and gateway reconciliations cleared.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
                      <tr>
                        <th className="py-2.5 px-3">Attempt ID</th>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Failure Diagnostic Reason</th>
                        <th className="py-2.5 px-3">Attempt Date</th>
                        <th className="py-2.5 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {getPaginatedList(filteredFailedPayments).map((f: FailedPaymentItem) => (
                        <tr
                          key={f.id}
                          onClick={() => setSelectedFailedPayment(f)}
                          className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-[#B42318]">{f.id}</td>
                          <td className="py-3 px-3 font-mono text-[#1C4E80]">{f.jobId}</td>
                          <td className="py-3 px-3 font-semibold text-[#1F2933]">{f.customer.name}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-[#1F2933]">
                            ₹{f.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">{f.paymentMethod}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
                              <XCircle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
                              {f.failureReason}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-[#5B6573] font-mono text-[11px]">{f.date} {f.time}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedFailedPayment(f)}
                              className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                              title="Inspect failed transaction diagnostics"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredFailedPayments.length / PAGE_SIZE) || 1}
                  totalItems={filteredFailedPayments.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemLabel="failed records"
                />
              </>
            )}
          </div>
        )}

        {/* SECTION 6: PAYMENT SETTINGS & RULES */}
        {activeTab === 'settings' && (
          <div className="p-5 space-y-5 bg-white">
            <div className="border-b border-[#D5DCE3] pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#12355B]">
                Administrative Payment & Settlement Rules
              </h3>
              <p className="text-xs text-[#5B6573] mt-0.5">
                Statutory platform tariff parameters, escrow disbursal schedules, and refund adjudication policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Commission Parameters */}
              <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[#BAC7D5]">
                  <Building2 className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase text-[#12355B]">Commission & Tariff Matrix</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xs border border-[#BAC7D5]">
                    <span className="font-semibold text-[#1F2933]">Default Statutory Tariff Rate:</span>
                    <span className="font-mono font-bold text-sm text-[#12355B]">{paymentSettings.defaultCommissionRate}%</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Active Category Schedules:</span>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                      {paymentSettings.serviceCategoryRates.map((c) => (
                        <div key={c.category} className="p-2 bg-white rounded-xs border border-[#D5DCE3] flex justify-between items-center text-[11px]">
                          <span className="text-[#1F2933] font-medium truncate">{c.category}</span>
                          <span className="font-mono font-bold text-[#12355B]">{c.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Payout Rules */}
              <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-[#BAC7D5]">
                  <HardHat className="w-4 h-4 text-[#E67E22]" />
                  <h4 className="text-xs font-bold uppercase text-[#12355B]">Workforce Disbursal Rules</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xs border border-[#BAC7D5] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#5B6573]">Disbursal Batch Cycle:</span>
                      <span className="font-bold text-[#1F2933]">{paymentSettings.payoutCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6573]">Minimum Transfer Threshold:</span>
                      <span className="font-mono font-bold text-[#2E7D32]">₹{paymentSettings.minimumPayout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6573]">Processing Window:</span>
                      <span className="text-[#1F2933]">{paymentSettings.payoutProcessingPeriod}</span>
                    </div>
                  </div>
                </div>

                {/* Refund Policies */}
                <div className="pt-2 border-t border-[#BAC7D5] space-y-2">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#B26A00]" />
                    <h4 className="text-xs font-bold uppercase text-[#12355B]">Refund & Redressal Provisions</h4>
                  </div>
                  <div className="bg-white p-2.5 rounded-xs border border-[#BAC7D5] space-y-1 text-xs">
                    <p className="text-[11px] text-[#5B6573]">
                      Turnaround Window: <strong>{paymentSettings.refundProcessingPeriod}</strong>
                    </p>
                    <ul className="list-disc pl-4 text-[10px] text-[#5B6573] space-y-0.5 pt-1">
                      {paymentSettings.refundEligibilityRules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onNavigateToJob={onNavigateToJob}
        onNavigateToUser={onNavigateToUser}
        onNavigateToWorker={onNavigateToWorker}
        onNavigateToRefund={(rId) => {
          setSelectedTransaction(null);
          const found = refunds.find((r) => r.id === rId);
          if (found) {
            setSelectedRefund(found);
            setActiveTab('refunds');
          }
        }}
      />

      <PayoutDetailsModal
        isOpen={!!selectedPayout}
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
        onNavigateToWorker={onNavigateToWorker}
        onNavigateToJob={onNavigateToJob}
        onNavigateToTransaction={(txnId) => {
          setSelectedPayout(null);
          const found = transactions.find((t) => t.id === txnId);
          if (found) {
            setSelectedTransaction(found);
            setActiveTab('transactions');
          }
        }}
      />

      <CommissionDetailsModal
        isOpen={!!selectedCommission}
        commission={selectedCommission}
        onClose={() => setSelectedCommission(null)}
        onNavigateToJob={onNavigateToJob}
        onNavigateToWorker={onNavigateToWorker}
        onNavigateToTransaction={(txnId) => {
          setSelectedCommission(null);
          const found = transactions.find((t) => t.id === txnId);
          if (found) {
            setSelectedTransaction(found);
            setActiveTab('transactions');
          }
        }}
      />

      <RefundDetailsModal
        isOpen={!!selectedRefund}
        refund={selectedRefund}
        onClose={() => setSelectedRefund(null)}
        onNavigateToComplaint={onNavigateToComplaint}
        onNavigateToJob={onNavigateToJob}
        onNavigateToTransaction={(txnId, refId) => {
          setSelectedRefund(null);
          if (onNavigateToTransaction) {
            onNavigateToTransaction(txnId, refId);
          } else {
            const found = transactions.find((t) => t.id === txnId);
            if (found) {
              setSelectedTransaction(found);
              setActiveTab('transactions');
            }
          }
        }}
      />

      <FailedPaymentDetailsModal
        isOpen={!!selectedFailedPayment}
        failedPayment={selectedFailedPayment}
        onClose={() => setSelectedFailedPayment(null)}
        onNavigateToJob={onNavigateToJob}
        onNavigateToUser={onNavigateToUser}
        onNavigateToWorker={onNavigateToWorker}
      />
    </div>
  );
};
