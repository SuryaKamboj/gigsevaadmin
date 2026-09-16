import React, { useState, useMemo, useEffect } from 'react';
import { ComplaintItem, ComplaintType, NavigationSourceContext } from '../types';
import { MOCK_COMPLAINTS } from '../data/mockData';
import { ComplaintTable } from '../components/ComplaintTable';
import { ComplaintCard } from '../components/ComplaintCard';
import { Pagination } from '../components/Pagination';
import { ComplaintDetailsModal } from '../components/ComplaintDetailsModal';
import { NavigationContextBar } from '../components/NavigationContextBar';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

const PAGE_SIZE = 10;

const COMPLAINT_TYPES: ComplaintType[] = [
  'Poor Service Quality',
  'Worker Behaviour',
  'Customer Behaviour',
  'Job Not Completed',
  'Property Damage',
  'Safety Issue',
  'Overcharging / Amount Dispute',
  'Payment Issue',
  'Job Cancellation Dispute',
  'Other',
];

interface DisputesManagementPageProps {
  initialComplaintId?: string | null;
  initialJobId?: string | null;
  navContext?: NavigationSourceContext | null;
  navStack?: NavigationSourceContext[];
  onNavigateToStackIndex?: (index: number) => void;
  onReturnToSource?: () => void;
  onNavigateToJob?: (jobId: string, complaintId?: string) => void;
  onNavigateToUser?: (userId: string, complaintId?: string) => void;
  onNavigateToWorker?: (workerId: string, complaintId?: string) => void;
  onNavigateToPayment?: (transactionId: string, complaintId?: string) => void;
}

export const DisputesManagementPage: React.FC<DisputesManagementPageProps> = ({
  initialComplaintId,
  initialJobId,
  navContext,
  navStack,
  onNavigateToStackIndex,
  onReturnToSource,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
  onNavigateToPayment,
}) => {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(MOCK_COMPLAINTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRaisedBy, setSelectedRaisedBy] = useState<string>('All');
  const [selectedAgainst, setSelectedAgainst] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');
  const [filterJobId, setFilterJobId] = useState<string>(initialJobId || '');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedComplaintForDetails, setSelectedComplaintForDetails] = useState<ComplaintItem | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialComplaintId) {
      const found = complaints.find((c) => c.id.toLowerCase() === initialComplaintId.toLowerCase());
      if (found) {
        setSelectedComplaintForDetails(found);
      }
    }
  }, [initialComplaintId, complaints]);

  useEffect(() => {
    if (initialJobId) {
      setFilterJobId(initialJobId);
      setCurrentPage(1);
    }
  }, [initialJobId]);

  // Statistics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const underReviewCount = complaints.filter((c) => c.status === 'Under Review').length;
  const escalatedCount = complaints.filter((c) => c.status === 'Escalated').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;

  // Filter & Search Logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Status
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;

      // Type
      if (selectedType !== 'All' && item.type !== selectedType) return false;

      // Raised By
      if (selectedRaisedBy !== 'All' && item.raisedBy.type !== selectedRaisedBy) return false;

      // Against
      if (selectedAgainst !== 'All' && item.against.type !== selectedAgainst) return false;

      // Job ID filter
      if (filterJobId && !item.jobId.toLowerCase().includes(filterJobId.toLowerCase())) return false;

      // Date
      if (selectedDateFilter === 'Today') {
        if (!item.createdDate.includes('09 Sep 2026')) return false;
      } else if (selectedDateFilter === 'This Week') {
        if (!item.createdDate.includes('Sep 2026')) return false;
      } else if (selectedDateFilter === 'This Month') {
        if (!item.createdDate.includes('2026')) return false;
      }

      // Search (Complaint ID, Job ID, Customer Name, Worker Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesJob = item.jobId.toLowerCase().includes(query);
        const matchesRaised = item.raisedBy.name.toLowerCase().includes(query);
        const matchesAgainst = item.against.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesId || matchesJob || matchesRaised || matchesAgainst || matchesDesc;
      }

      return true;
    });
  }, [
    complaints,
    selectedStatus,
    selectedType,
    selectedRaisedBy,
    selectedAgainst,
    filterJobId,
    selectedDateFilter,
    searchQuery,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredComplaints.slice(start, start + PAGE_SIZE);
  }, [filteredComplaints, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedType('All');
    setSelectedRaisedBy('All');
    setSelectedAgainst('All');
    setSelectedDateFilter('All');
    setFilterJobId('');
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedStatus !== 'All' ||
    selectedType !== 'All' ||
    selectedRaisedBy !== 'All' ||
    selectedAgainst !== 'All' ||
    selectedDateFilter !== 'All' ||
    filterJobId !== '';

  const handleUpdateComplaint = (updated: ComplaintItem) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaintForDetails(updated);
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
          filterActive={Boolean(filterJobId)}
          filterLabel={filterJobId ? `Job: ${filterJobId}` : undefined}
          onClearFilter={() => {
            setFilterJobId('');
            setCurrentPage(1);
          }}
          filteredCount={filteredComplaints.length}
          totalCount={totalCount}
          itemLabel="complaints"
          currentDestinationName="Disputes & Complaints"
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#BAC7D5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#12355B] uppercase">
              Disputes & Complaints
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EAF2F8] text-[#12355B] font-bold rounded-xs border border-[#BAC7D5]">
              ADJ-MOD-04
            </span>
          </div>
          <p className="text-xs text-[#5B6573] mt-0.5">
            Citizen & worker grievance redressal: formal dispute adjudication, evidence arbitration, and resolution ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Official Grievance Redressal Register (CSV)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] hover:bg-[#F4F6F8] rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Export Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary Cards (Clicking count filters the table) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total */}
        <div
          onClick={() => {
            setSelectedStatus('All');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'All'
              ? 'bg-white border-[#12355B] ring-1 ring-[#12355B] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Total Cases</span>
            <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#12355B]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#1F2933] mt-1">{totalCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">All Grievances</span>
        </div>

        {/* Pending */}
        <div
          onClick={() => {
            setSelectedStatus('Pending');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Pending'
              ? 'bg-white border-[#B26A00] ring-1 ring-[#B26A00] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B26A00]">Pending</span>
            <div className="p-1.5 rounded-xs bg-[#FFF8E1] text-[#B26A00]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#B26A00] mt-1">{pendingCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">Awaiting Intake</span>
        </div>

        {/* Under Review */}
        <div
          onClick={() => {
            setSelectedStatus('Under Review');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Under Review'
              ? 'bg-white border-[#1C4E80] ring-1 ring-[#1C4E80] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C4E80]">Under Review</span>
            <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#1C4E80] mt-1">{underReviewCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">In Investigation</span>
        </div>

        {/* Escalated */}
        <div
          onClick={() => {
            setSelectedStatus('Escalated');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Escalated'
              ? 'bg-white border-[#B42318] ring-1 ring-[#B42318] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318]">Escalated</span>
            <div className="p-1.5 rounded-xs bg-[#FFEBEE] text-[#B42318]">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#B42318] mt-1">{escalatedCount}</div>
          <span className="text-[10px] text-[#B42318] font-semibold block mt-0.5">Appeals & Board</span>
        </div>

        {/* Resolved */}
        <div
          onClick={() => {
            setSelectedStatus('Resolved');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Resolved'
              ? 'bg-white border-[#2E7D32] ring-1 ring-[#2E7D32] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">Resolved</span>
            <div className="p-1.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#2E7D32] mt-1">{resolvedCount}</div>
          <span className="text-[10px] text-[#2E7D32] font-semibold block mt-0.5">Adjudicated</span>
        </div>

        {/* Rejected */}
        <div
          onClick={() => {
            setSelectedStatus('Rejected');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Rejected'
              ? 'bg-white border-[#5B6573] ring-1 ring-[#5B6573] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Rejected</span>
            <div className="p-1.5 rounded-xs bg-[#F4F6F8] text-[#5B6573]">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#5B6573] mt-1">{rejectedCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">Dismissed</span>
        </div>
      </div>

      {/* Main Table & Filters Container */}
      <div className="bg-white rounded-sm border border-[#D5DCE3] shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-[#D5DCE3] bg-[#F4F6F8] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6573]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by complaint ID, job ID, customer or worker..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#8795A5] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#5B6573]">
              <Filter className="w-3.5 h-3.5 text-[#12355B]" />
              <span className="hidden sm:inline font-semibold text-[11px] uppercase">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer max-w-[150px]"
            >
              <option value="All">Type: All</option>
              {COMPLAINT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Raised By */}
            <select
              value={selectedRaisedBy}
              onChange={(e) => {
                setSelectedRaisedBy(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
            >
              <option value="All">Raised By: All</option>
              <option value="Customer">Customer</option>
              <option value="Worker">Worker</option>
            </select>

            {/* Against */}
            <select
              value={selectedAgainst}
              onChange={(e) => {
                setSelectedAgainst(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
            >
              <option value="All">Against: All</option>
              <option value="Customer">Customer</option>
              <option value="Worker">Worker</option>
            </select>

            {/* Date Filter */}
            <select
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
            >
              <option value="All">Date: All</option>
              <option value="Today">Today (09 Sep 2026)</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month (Sep 2026)</option>
            </select>

            {/* Job Filter Badge */}
            {filterJobId && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-xs bg-[#EAF2F8] text-[#12355B] border border-[#BAC7D5]">
                Job: {filterJobId}
                <button
                  type="button"
                  onClick={() => setFilterJobId('')}
                  className="hover:text-[#B42318] cursor-pointer font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#B42318] hover:text-[#911810] px-2 py-1.5 bg-white border border-[#FFCDD2] rounded-xs font-semibold cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content View */}
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-[#5B6573]">
            <ShieldAlert className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
            <p className="text-xs font-bold text-[#1F2933] uppercase">No complaints found</p>
            <p className="text-[11px] text-[#5B6573] mt-0.5">
              No complaints match your selected filters.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] border border-[#BAC7D5] rounded-xs hover:bg-[#12355B] hover:text-white transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <ComplaintTable
                complaints={paginatedComplaints}
                onViewDetails={(item) => setSelectedComplaintForDetails(item)}
                onNavigateToJob={onNavigateToJob}
                onNavigateToUser={onNavigateToUser}
                onNavigateToWorker={onNavigateToWorker}
              />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedComplaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  onViewDetails={(item) => setSelectedComplaintForDetails(item)}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredComplaints.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="complaints"
            />
          </>
        )}
      </div>

      {/* Details Modal */}
      <ComplaintDetailsModal
        isOpen={!!selectedComplaintForDetails}
        complaint={selectedComplaintForDetails}
        onClose={() => setSelectedComplaintForDetails(null)}
        onUpdateComplaint={handleUpdateComplaint}
        onNavigateToJob={onNavigateToJob}
        onNavigateToUser={onNavigateToUser}
        onNavigateToWorker={onNavigateToWorker}
        onNavigateToPayment={onNavigateToPayment}
      />
    </div>
  );
};
