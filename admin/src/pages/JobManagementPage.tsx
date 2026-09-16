import React, { useState, useMemo, useEffect } from 'react';
import { JobItem, NavigationSourceContext } from '../types';
import { MOCK_JOBS } from '../data/mockData';
import { JobTable } from '../components/JobTable';
import { JobCard } from '../components/JobCard';
import { Pagination } from '../components/Pagination';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { NavigationContextBar } from '../components/NavigationContextBar';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Filter,
  RotateCcw,
  FileSpreadsheet,
} from 'lucide-react';

const PAGE_SIZE = 10;

const SERVICE_CATEGORIES = [
  'All',
  'Electrician',
  'Plumber',
  'AC Repair',
  'Home Cleaning',
  'Carpenter',
  'Appliance Repair',
  'RO / Water Purifier Repair',
  'Painter',
  'Handyman',
];

interface JobManagementPageProps {
  jobs?: JobItem[];
  initialFilterWorkerId?: string | null;
  initialFilterUserId?: string | null;
  initialJobId?: string | null;
  initialStatusFilter?: string | null;
  navContext?: NavigationSourceContext | null;
  navStack?: NavigationSourceContext[];
  onReturnToSource?: () => void;
  onNavigateToStackIndex?: (index: number) => void;
  onViewUserProfile?: (userId: string, sourceJobId?: string) => void;
  onViewWorkerProfile?: (workerId: string, sourceJobId?: string) => void;
  onNavigateToPayment?: (transactionId: string, sourceJobId?: string) => void;
}

export const JobManagementPage: React.FC<JobManagementPageProps> = ({
  jobs: passedJobs,
  initialFilterWorkerId,
  initialFilterUserId,
  initialJobId,
  initialStatusFilter,
  navContext,
  navStack = [],
  onReturnToSource,
  onNavigateToStackIndex,
  onViewUserProfile,
  onViewWorkerProfile,
  onNavigateToPayment,
}) => {
  const jobs = passedJobs || MOCK_JOBS;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('All');
  const [filterWorkerId, setFilterWorkerId] = useState<string>(initialFilterWorkerId || '');
  const [filterUserId, setFilterUserId] = useState<string>(initialFilterUserId || '');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobItem | null>(null);

  // Initialize or update filter when incoming props change
  useEffect(() => {
    if (initialStatusFilter !== undefined && initialStatusFilter !== null) {
      setSelectedStatus(initialStatusFilter);
      setCurrentPage(1);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialFilterWorkerId !== undefined) {
      setFilterWorkerId(initialFilterWorkerId || '');
      setCurrentPage(1);
    }
  }, [initialFilterWorkerId]);

  useEffect(() => {
    if (initialFilterUserId !== undefined) {
      setFilterUserId(initialFilterUserId || '');
      setCurrentPage(1);
    }
  }, [initialFilterUserId]);

  useEffect(() => {
    if (initialJobId) {
      const target = jobs.find((j) => j.id.toLowerCase() === initialJobId.toLowerCase());
      if (target) {
        setSelectedJobForDetails(target);
      }
    }
  }, [initialJobId, jobs]);

  // Statistics
  const totalCount = jobs.length;
  const pendingCount = jobs.filter((j) => j.status === 'Pending').length;
  const activeCount = jobs.filter((j) => j.status === 'Active').length;
  const completedCount = jobs.filter((j) => j.status === 'Completed').length;
  const cancelledCount = jobs.filter((j) => j.status === 'Cancelled').length;

  // Filter and Search Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status Filter
      if (selectedStatus !== 'All' && job.status !== selectedStatus) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'All' && job.serviceCategory !== selectedCategory) {
        return false;
      }

      // Worker ID Filter
      if (filterWorkerId && !job.worker.workerId.toLowerCase().includes(filterWorkerId.toLowerCase())) {
        return false;
      }

      // Customer / User ID Filter
      if (filterUserId && !job.customer.userId.toLowerCase().includes(filterUserId.toLowerCase())) {
        return false;
      }

      // Date Filter
      if (selectedDateFilter === 'Today') {
        if (!job.scheduledDate.includes('09 Sep 2026') && !job.createdDate.includes('09 Sep 2026')) return false;
      } else if (selectedDateFilter === 'This Week') {
        if (!job.scheduledDate.includes('Sep 2026')) return false;
      } else if (selectedDateFilter === 'This Month') {
        if (!job.scheduledDate.includes('2026')) return false;
      }

      // Real-time Search Query Filter (Job ID, Customer Name, Worker Name, Service)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = job.id.toLowerCase().includes(query);
        const matchesCustomer = job.customer.name.toLowerCase().includes(query);
        const matchesWorker = job.worker.name.toLowerCase().includes(query);
        const matchesService = job.service.toLowerCase().includes(query);
        return matchesId || matchesCustomer || matchesWorker || matchesService;
      }

      return true;
    });
  }, [
    jobs,
    selectedStatus,
    selectedCategory,
    selectedDateFilter,
    filterWorkerId,
    filterUserId,
    searchQuery,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedDateFilter('All');
    setFilterWorkerId('');
    setFilterUserId('');
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedStatus !== 'All' ||
    selectedCategory !== 'All' ||
    selectedDateFilter !== 'All' ||
    filterWorkerId !== '' ||
    filterUserId !== '';

  const isContextFilterActive = Boolean(
    filterWorkerId || filterUserId || (initialJobId && !filterWorkerId && !filterUserId)
  );

  const getContextFilterLabel = () => {
    if (filterWorkerId) {
      const workerName =
        navContext?.sourceRecordName && navContext.sourceRecordId === filterWorkerId
          ? navContext.sourceRecordName
          : filterWorkerId;
      return `Worker: ${workerName} · ${filterWorkerId}${selectedStatus !== 'All' ? ` · ${selectedStatus}` : ''}`;
    }
    if (filterUserId) {
      const userName =
        navContext?.sourceRecordName && navContext.sourceRecordId === filterUserId
          ? navContext.sourceRecordName
          : filterUserId;
      return `Customer: ${userName} · ${filterUserId}${selectedStatus !== 'All' ? ` · ${selectedStatus}` : ''}`;
    }
    if (initialJobId) {
      return `Target Job: ${initialJobId}${
        navContext?.sourceRecordName ? ` · From ${navContext.sourceRecordName}` : ''
      }`;
    }
    return undefined;
  };

  const handleClearContextFilter = () => {
    setFilterWorkerId('');
    setFilterUserId('');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Top Cross-Module Navigation Context Bar */}
      {navContext && onReturnToSource && (
        <NavigationContextBar
          navContext={navContext}
          navStack={navStack}
          onNavigateToStackIndex={onNavigateToStackIndex}
          onReturnToSource={onReturnToSource}
          filterActive={isContextFilterActive}
          filterLabel={getContextFilterLabel()}
          onClearFilter={handleClearContextFilter}
          filteredCount={filteredJobs.length}
          totalCount={totalCount}
          itemLabel="jobs"
          currentDestinationName="Job Management"
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DCE3]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#12355B] tracking-tight">Job Management</h1>
          <p className="text-xs text-[#5B6573] mt-0.5">
            Operational Central Source of Truth • Citizen Service Dispatch, Evidence Verification & Timeline Audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Official Dispatch & Work Orders Ledger (CSV)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] hover:bg-[#F4F6F8] rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Export Orders (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Blocks (Clicking count filters the table) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Jobs */}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Total Orders</span>
            <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#12355B]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#1F2933] mt-1">{totalCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">All Work Orders</span>
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
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#B26A00] mt-1">{pendingCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">Awaiting Dispatch</span>
        </div>

        {/* Active */}
        <div
          onClick={() => {
            setSelectedStatus('Active');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Active'
              ? 'bg-white border-[#1C4E80] ring-1 ring-[#1C4E80] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C4E80]">Active</span>
            <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80]">
              <Clock3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#1C4E80] mt-1">{activeCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">In Progress On-Site</span>
        </div>

        {/* Completed */}
        <div
          onClick={() => {
            setSelectedStatus('Completed');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Completed'
              ? 'bg-white border-[#2E7D32] ring-1 ring-[#2E7D32] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">Completed</span>
            <div className="p-1.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#2E7D32] mt-1">{completedCount}</div>
          <span className="text-[10px] text-[#2E7D32] font-semibold block mt-0.5">Fulfilled & Verified</span>
        </div>

        {/* Cancelled */}
        <div
          onClick={() => {
            setSelectedStatus('Cancelled');
            setCurrentPage(1);
          }}
          className={`cursor-pointer p-3 rounded-sm border transition-all ${
            selectedStatus === 'Cancelled'
              ? 'bg-white border-[#B42318] ring-1 ring-[#B42318] shadow-xs'
              : 'bg-white border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318]">Cancelled</span>
            <div className="p-1.5 rounded-xs bg-[#FFEBEE] text-[#B42318]">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#B42318] mt-1">{cancelledCount}</div>
          <span className="text-[10px] text-[#5B6573] block mt-0.5">Refunded / Dropped</span>
        </div>
      </div>

      {/* Main Table & Filters Container */}
      <div className="bg-white rounded-sm border border-[#D5DCE3] shadow-xs overflow-hidden">
        {/* Structured Administrative Toolbar */}
        <div className="p-3 border-b border-[#D5DCE3] bg-[#F4F6F8] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Real-time Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6573]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Job ID, customer, worker or service..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#8795A5] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#5B6573]">
              <Filter className="w-3.5 h-3.5 text-[#12355B]" />
              <span className="hidden sm:inline font-semibold text-[11px] uppercase">Filters:</span>
            </div>

            {/* Job Status Filter */}
            <div className="flex items-center">
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
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
              >
                <option value="All">Service: All</option>
                {SERVICE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center">
              <select
                value={selectedDateFilter}
                onChange={(e) => {
                  setSelectedDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
              >
                <option value="All">Date: All Records</option>
                <option value="Today">Today (09 Sep 2026)</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month (Sep 2026)</option>
              </select>
            </div>

            {/* Cross-module filter badges if active */}
            {filterWorkerId && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-xs bg-[#EAF2F8] text-[#12355B] border border-[#BAC7D5]">
                Worker: {filterWorkerId}
                <button
                  type="button"
                  onClick={() => setFilterWorkerId('')}
                  className="hover:text-[#B42318] cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {filterUserId && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 rounded-xs bg-[#EAF2F8] text-[#12355B] border border-[#BAC7D5]">
                User: {filterUserId}
                <button
                  type="button"
                  onClick={() => setFilterUserId('')}
                  className="hover:text-[#B42318] cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}

            {/* Reset Filters */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#B42318] hover:text-[#911810] px-2 py-1.5 bg-white border border-[#FFCDD2] rounded-xs font-semibold cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Content View */}
        {filteredJobs.length === 0 ? (
          <div className="py-12 text-center text-[#5B6573]">
            <Briefcase className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
            <p className="text-xs font-bold text-[#1F2933] uppercase">No jobs found</p>
            <p className="text-[11px] text-[#5B6573] mt-0.5">
              No jobs match your selected filters.
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
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <JobTable
                jobs={paginatedJobs}
                onViewDetails={(job) => setSelectedJobForDetails(job)}
              />
            </div>

            {/* Mobile Card Grid View */}
            <div className="md:hidden p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={(j) => setSelectedJobForDetails(j)}
                />
              ))}
            </div>

            {/* Pagination (10 per page) */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredJobs.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="jobs"
            />
          </>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={!!selectedJobForDetails}
        job={selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onViewUserProfile={onViewUserProfile}
        onViewWorkerProfile={onViewWorkerProfile}
        onNavigateToPayment={onNavigateToPayment}
      />
    </div>
  );
};
