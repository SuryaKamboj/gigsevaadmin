import React, { useState, useEffect } from 'react';
import { AdminNavTab, JobItem, NavigationSourceContext, SecurityTab, AuthUserSession } from './types';
import { MOCK_WORKERS, MOCK_USERS } from './data/mockData';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { WorkerManagementPage } from './pages/WorkerManagementPage';
import { JobManagementPage } from './pages/JobManagementPage';
import { DisputesManagementPage } from './pages/DisputesManagementPage';
import { PaymentsManagementPage } from './pages/PaymentsManagementPage';
import { AdminSecurityPage } from './pages/AdminSecurityPage';
import { adminService } from './services/adminService';

const mapBackendBookingToJobItem = (b: any): JobItem => {
  const statusStr = (b.status || '').toUpperCase();
  const statusMap: Record<string, any> = {
    REQUESTED: 'Pending',
    ALLOCATED: 'Pending',
    ACCEPTED: 'Active',
    IN_TRANSIT: 'Active',
    ARRIVED: 'Active',
    IN_PROGRESS: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };

  const createdDate = b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '2026-09-14';
  const createdTime = b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';

  const scheduledDate = b.scheduledStartTime ? new Date(b.scheduledStartTime).toISOString().split('T')[0] : createdDate;
  const scheduledTime = b.scheduledStartTime ? new Date(b.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Immediate';

  return {
    id: b.bookingCode || (b._id ? `JOB-${b._id.toString().slice(-4).toUpperCase()}` : 'JOB-NEW'),
    service: b.serviceId?.name || 'Home Service',
    serviceCategory: b.serviceId?.category || 'Handyman',
    description: b.notes || 'Cooperative service request',
    status: statusMap[statusStr] || 'Pending',
    scheduledDate,
    scheduledTime,
    createdDate,
    createdTime,
    location: b.serviceAddress?.city || 'Delhi',
    customer: {
      userId: b.userId?._id ? `USR-${b.userId._id.toString().slice(-4).toUpperCase()}` : 'USR-1001',
      name: b.userId?.fullName || 'Customer',
      phone: b.userId?.mobileNumber || '+91 98765 43210',
      address: b.serviceAddress ? `${b.serviceAddress.addressLine1 || ''}, ${b.serviceAddress.city || 'Delhi'} (${b.serviceAddress.pincode || ''})` : 'Delhi'
    },
    worker: {
      workerId: b.workerId?._id ? (b.workerId.workerCode || `WRK-${b.workerId._id.toString().slice(-4).toUpperCase()}`) : 'WRK-UNASSIGNED',
      name: b.workerId?.fullName || 'Unassigned Worker',
      phone: b.workerId?.mobileNumber || '+91 98111 00001',
      category: b.serviceId?.category || 'ELECTRICAL',
      averageRating: b.workerId?.metrics?.averageRating || 4.9
    },
    servicePhotos: [],
    workEvidence: { beforePhotos: [], afterPhotos: [] },
    timeline: [
      {
        event: 'Booking Created',
        date: createdDate,
        time: createdTime,
        detail: `Booking initiated (${b.bookingCode || 'Direct Dispatch'})`
      },
      ...(b.status === 'ACCEPTED' ? [{
        event: 'Worker Accepted' as const,
        date: createdDate,
        time: createdTime,
        detail: `Assigned to ${b.workerId?.fullName || 'Worker'}`
      }] : [])
    ],
    payment: {
      amount: `₹${b.pricing?.totalAmount || 420}`,
      status: b.status === 'COMPLETED' ? 'Paid' : 'Escrow Pending',
      transactionId: `TXN-${b._id ? b._id.toString().slice(-4).toUpperCase() : '9001'}`,
      paymentMethod: 'UPI (Escrow)'
    }
  };
};

export const App: React.FC = () => {
  // Session Authentication State (persisted for smooth testing)
  const [currentSession, setCurrentSession] = useState<AuthUserSession | null>(() => {
    try {
      const saved = localStorage.getItem('gigsevak_admin_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [activeTab, setActiveTab] = useState<AdminNavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Single Source of Truth for Jobs Across Admin Modules
  const [jobs, setJobs] = useState<JobItem[]>([]);

  const fetchLiveBookings = async () => {
    try {
      const res = await adminService.getBookings();
      const rawList = res?.data || res || [];
      if (Array.isArray(rawList)) {
        const liveMapped = rawList.map(mapBackendBookingToJobItem);
        setJobs(liveMapped);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.warn('[AdminApp] Fetch bookings notice:', err);
    }
  };

  useEffect(() => {
    if (currentSession) {
      fetchLiveBookings();
      const interval = setInterval(fetchLiveBookings, 3000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  // Cross-Module Multi-Step Navigation Context Stack (A -> B -> C -> D -> E)
  const [navStack, setNavStack] = useState<NavigationSourceContext[]>([]);
  const navContext = navStack.length > 0 ? navStack[navStack.length - 1] : null;

  // Cross-Module Navigation Filter States
  const [jobFilterWorkerId, setJobFilterWorkerId] = useState<string | null>(null);
  const [jobFilterUserId, setJobFilterUserId] = useState<string | null>(null);
  const [jobFilterStatus, setJobFilterStatus] = useState<string | null>(null);
  const [workerInitialViewTab, setWorkerInitialViewTab] = useState<'registry' | 'approvals'>('registry');
  const [targetJobId, setTargetJobId] = useState<string | null>(null);

  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetWorkerId, setTargetWorkerId] = useState<string | null>(null);

  // Disputes & Payments Cross-Navigation States
  const [targetComplaintId, setTargetComplaintId] = useState<string | null>(null);
  const [targetTransactionId, setTargetTransactionId] = useState<string | null>(null);
  const [targetRefundId, setTargetRefundId] = useState<string | null>(null);
  const [paymentsInitialTab, setPaymentsInitialTab] = useState<
    'transactions' | 'payouts' | 'commissions' | 'refunds' | 'failed' | 'settings'
  >('transactions');

  // Security Module Section Sub-Tab State
  const [securityInitialTab, setSecurityInitialTab] = useState<SecurityTab>('admin-accounts');

  // Dashboard Target Section for Notification Bell Navigation
  const [dashboardTargetSection, setDashboardTargetSection] = useState<string | null>(null);

  const handleNotificationClick = () => {
    if (activeTab !== 'dashboard') {
      setJobFilterWorkerId(null);
      setJobFilterUserId(null);
      setJobFilterStatus(null);
      setTargetJobId(null);
      setTargetUserId(null);
      setTargetWorkerId(null);
      setTargetComplaintId(null);
      setTargetTransactionId(null);
      setTargetRefundId(null);

      setDashboardTargetSection('pending-administrative-actions');
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
    } else {
      // Already on Dashboard: smooth-scroll directly to Pending Administrative Actions
      const el = document.getElementById('pending-administrative-actions');
      if (el) {
        const headerOffset = 84;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  // Helper to push a new navigation step onto the stack
  const pushContext = (context: NavigationSourceContext) => {
    setNavStack((prev) => {
      if (prev.length > 0) {
        const top = prev[prev.length - 1];
        if (
          top.sourceModule === context.sourceModule &&
          top.sourceRecordId === context.sourceRecordId &&
          top.returnModal === context.returnModal &&
          top.sourceRecordType === context.sourceRecordType
        ) {
          return prev;
        }
      }
      return [...prev, context];
    });
  };

  // Helper to restore previous module, record, modal and tab state
  const restoreContextState = (targetContext: NavigationSourceContext | null) => {
    // Reset current destination overrides
    setJobFilterWorkerId(null);
    setJobFilterUserId(null);
    setJobFilterStatus(null);
    setTargetJobId(null);
    setTargetUserId(null);
    setTargetWorkerId(null);
    setTargetComplaintId(null);
    setTargetTransactionId(null);
    setTargetRefundId(null);

    if (!targetContext) return;

    const { sourceModule, sourceRecordType, sourceRecordId, returnModal } = targetContext;

    // Restore source module and re-open previous modal
    if (sourceModule === 'workers' || returnModal === 'worker-details' || sourceRecordType === 'worker') {
      setTargetWorkerId(sourceRecordId || null);
      setActiveTab('workers');
    } else if (sourceModule === 'users' || returnModal === 'user-details' || sourceRecordType === 'user') {
      setTargetUserId(sourceRecordId || null);
      setActiveTab('users');
    } else if (sourceModule === 'jobs' || returnModal === 'job-details' || sourceRecordType === 'job') {
      setTargetJobId(sourceRecordId || null);
      setActiveTab('jobs');
    } else if (sourceModule === 'disputes' || returnModal === 'complaint-details' || sourceRecordType === 'complaint') {
      setTargetComplaintId(sourceRecordId || null);
      setActiveTab('disputes');
    } else if (
      sourceModule === 'payments' ||
      returnModal === 'transaction-details' ||
      returnModal === 'refund-details' ||
      returnModal === 'payout-details' ||
      returnModal === 'commission-details' ||
      sourceRecordType === 'transaction' ||
      sourceRecordType === 'refund' ||
      sourceRecordType === 'payout' ||
      sourceRecordType === 'commission'
    ) {
      if (returnModal === 'refund-details' || sourceRecordType === 'refund') {
        setTargetRefundId(sourceRecordId || null);
        setPaymentsInitialTab('refunds');
      } else if (returnModal === 'payout-details' || sourceRecordType === 'payout') {
        setPaymentsInitialTab('payouts');
      } else if (returnModal === 'commission-details' || sourceRecordType === 'commission') {
        setPaymentsInitialTab('commissions');
      } else {
        setTargetTransactionId(sourceRecordId || null);
        setPaymentsInitialTab('transactions');
      }
      setActiveTab('payments');
    } else {
      setActiveTab(sourceModule);
    }
  };

  // =========================================================================
  // GENERAL RETURN TO SOURCE (POP STACK) HANDLER
  // =========================================================================
  const handleReturnToSource = () => {
    if (navStack.length === 0) return;
    const newStack = [...navStack];
    const popped = newStack.pop();
    setNavStack(newStack);

    if (popped) {
      restoreContextState(popped);
    }
  };

  // =========================================================================
  // JUMP TO SPECIFIC STACK ANCESTOR (BREADCRUMB CLICK)
  // =========================================================================
  const handleNavigateToStackIndex = (index: number) => {
    if (index < 0 || index >= navStack.length) return;
    const targetContext = navStack[index];
    const newStack = navStack.slice(0, index);
    setNavStack(newStack);
    restoreContextState(targetContext);
  };

  // =========================================================================
  // CROSS-MODULE NAVIGATION HANDLERS WITH CONTEXT PRESERVATION
  // =========================================================================

  // 1. Worker -> Job Management (e.g. Total Jobs, Completed Jobs, Cancelled Jobs)
  const handleNavigateToJobFromWorker = (workerId: string, status?: string) => {
    const worker = MOCK_WORKERS.find((w) => w.id.toLowerCase() === workerId.toLowerCase());
    const workerName = worker?.name || workerId;

    pushContext({
      sourceModule: 'workers',
      sourceModuleName: 'Worker Management',
      sourceRecordType: 'worker',
      sourceRecordId: workerId,
      sourceRecordName: workerName,
      returnModal: 'worker-details',
      filterContextLabel: status && status !== 'All' ? `${status} Jobs` : 'Assigned Jobs',
      filterCriteria: { workerId, status, workerName },
    });

    setTargetJobId(null);
    setJobFilterWorkerId(workerId);
    setJobFilterUserId(null);
    setJobFilterStatus(status || 'All');
    setActiveTab('jobs');
  };

  // 2. User / Customer -> Job Management (e.g. Total Bookings, Active, Cancelled)
  const handleNavigateToJobsWithUserFilter = (userId: string, status?: string) => {
    const user = MOCK_USERS.find((u) => u.id.toLowerCase() === userId.toLowerCase());
    const userName = user?.name || userId;

    pushContext({
      sourceModule: 'users',
      sourceModuleName: 'User Management',
      sourceRecordType: 'user',
      sourceRecordId: userId,
      sourceRecordName: userName,
      returnModal: 'user-details',
      filterContextLabel: status && status !== 'All' ? `${status} Bookings` : 'Total Bookings',
      filterCriteria: { userId, status, userName },
    });

    setTargetJobId(null);
    setJobFilterUserId(userId);
    setJobFilterWorkerId(null);
    setJobFilterStatus(status || 'All');
    setActiveTab('jobs');
  };

  const handleNavigateToJobFromUser = (jobId: string, userId: string) => {
    const user = MOCK_USERS.find((u) => u.id.toLowerCase() === userId.toLowerCase());
    const userName = user?.name || userId;

    pushContext({
      sourceModule: 'users',
      sourceModuleName: 'User Management',
      sourceRecordType: 'user',
      sourceRecordId: userId,
      sourceRecordName: userName,
      returnModal: 'user-details',
      filterContextLabel: `Job ${jobId} for Customer ${userName}`,
      filterCriteria: { userId, jobId, userName },
    });

    setTargetJobId(jobId);
    setJobFilterUserId(userId);
    setJobFilterWorkerId(null);
    setJobFilterStatus('All');
    setActiveTab('jobs');
  };

  // 3. Complaint -> Job Management
  const handleNavigateToJobFromComplaint = (jobId: string, complaintId?: string) => {
    if (complaintId) {
      pushContext({
        sourceModule: 'disputes',
        sourceModuleName: 'Disputes & Complaints',
        sourceRecordType: 'complaint',
        sourceRecordId: complaintId,
        sourceRecordName: `Complaint ${complaintId}`,
        returnModal: 'complaint-details',
        filterContextLabel: `Job for Dispute ${complaintId}`,
        filterCriteria: { jobId, complaintId },
      });
    }

    setTargetJobId(jobId);
    setJobFilterUserId(null);
    setJobFilterWorkerId(null);
    setJobFilterStatus('All');
    setActiveTab('jobs');
  };

  // 4. Payment / Transaction -> Job Management
  const handleNavigateToJobFromPayment = (jobId: string, transactionId?: string) => {
    if (transactionId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: 'Payments & Finance',
        sourceRecordType: 'transaction',
        sourceRecordId: transactionId,
        sourceRecordName: `Transaction ${transactionId}`,
        returnModal: 'transaction-details',
        filterContextLabel: `Job for Transaction ${transactionId}`,
        filterCriteria: { jobId, transactionId },
      });
    }

    setTargetJobId(jobId);
    setJobFilterUserId(null);
    setJobFilterWorkerId(null);
    setJobFilterStatus('All');
    setActiveTab('jobs');
  };

  // 5. Refund -> Job Management
  const handleNavigateToJobFromRefund = (jobId: string, refundId?: string) => {
    if (refundId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: 'Payments (Refunds)',
        sourceRecordType: 'refund',
        sourceRecordId: refundId,
        sourceRecordName: `Refund ${refundId}`,
        returnModal: 'refund-details',
        filterContextLabel: `Job for Refund ${refundId}`,
        filterCriteria: { jobId, refundId },
      });
    }

    setTargetJobId(jobId);
    setJobFilterUserId(null);
    setJobFilterWorkerId(null);
    setJobFilterStatus('All');
    setActiveTab('jobs');
  };

  // 6. Job -> User Profile
  const handleNavigateToUserFromJob = (userId: string, sourceJobId?: string) => {
    const user = MOCK_USERS.find((u) => u.id.toLowerCase() === userId.toLowerCase());
    if (sourceJobId) {
      pushContext({
        sourceModule: 'jobs',
        sourceModuleName: 'Job Management',
        sourceRecordType: 'job',
        sourceRecordId: sourceJobId,
        sourceRecordName: `Job ${sourceJobId}`,
        returnModal: 'job-details',
        filterContextLabel: `Customer Profile (${user?.name || userId})`,
        filterCriteria: { userId, jobId: sourceJobId, userName: user?.name },
      });
    }

    setTargetUserId(userId);
    setActiveTab('users');
  };

  // 7. Job -> Worker Profile
  const handleNavigateToWorkerFromJob = (workerId: string, sourceJobId?: string) => {
    const worker = MOCK_WORKERS.find((w) => w.id.toLowerCase() === workerId.toLowerCase());
    if (sourceJobId) {
      pushContext({
        sourceModule: 'jobs',
        sourceModuleName: 'Job Management',
        sourceRecordType: 'job',
        sourceRecordId: sourceJobId,
        sourceRecordName: `Job ${sourceJobId}`,
        returnModal: 'job-details',
        filterContextLabel: `Worker Profile (${worker?.name || workerId})`,
        filterCriteria: { workerId, jobId: sourceJobId, workerName: worker?.name },
      });
    }

    setTargetWorkerId(workerId);
    setActiveTab('workers');
  };

  // 8. Dispute -> User Profile
  const handleNavigateToUserFromComplaint = (userId: string, complaintId?: string) => {
    const user = MOCK_USERS.find((u) => u.id.toLowerCase() === userId.toLowerCase());
    if (complaintId) {
      pushContext({
        sourceModule: 'disputes',
        sourceModuleName: 'Disputes & Complaints',
        sourceRecordType: 'complaint',
        sourceRecordId: complaintId,
        sourceRecordName: `Complaint ${complaintId}`,
        returnModal: 'complaint-details',
        filterContextLabel: `Customer Profile for Dispute ${complaintId}`,
        filterCriteria: { userId, complaintId, userName: user?.name },
      });
    }

    setTargetUserId(userId);
    setActiveTab('users');
  };

  // 9. Dispute -> Worker Profile
  const handleNavigateToWorkerFromComplaint = (workerId: string, complaintId?: string) => {
    const worker = MOCK_WORKERS.find((w) => w.id.toLowerCase() === workerId.toLowerCase());
    if (complaintId) {
      pushContext({
        sourceModule: 'disputes',
        sourceModuleName: 'Disputes & Complaints',
        sourceRecordType: 'complaint',
        sourceRecordId: complaintId,
        sourceRecordName: `Complaint ${complaintId}`,
        returnModal: 'complaint-details',
        filterContextLabel: `Worker Profile for Dispute ${complaintId}`,
        filterCriteria: { workerId, complaintId, workerName: worker?.name },
      });
    }

    setTargetWorkerId(workerId);
    setActiveTab('workers');
  };

  // 10. Dispute -> Payment / Transaction
  const handleNavigateToPaymentFromDispute = (transactionId: string, complaintId?: string) => {
    if (complaintId) {
      pushContext({
        sourceModule: 'disputes',
        sourceModuleName: 'Disputes & Complaints',
        sourceRecordType: 'complaint',
        sourceRecordId: complaintId,
        sourceRecordName: `Complaint ${complaintId}`,
        returnModal: 'complaint-details',
        filterContextLabel: `Transaction for Dispute ${complaintId}`,
        filterCriteria: { transactionId, complaintId },
      });
    }

    setTargetTransactionId(transactionId);
    setPaymentsInitialTab('transactions');
    setActiveTab('payments');
  };

  // 11. Transaction -> User Profile
  const handleNavigateToUserFromPayment = (userId: string, transactionId?: string) => {
    const user = MOCK_USERS.find((u) => u.id.toLowerCase() === userId.toLowerCase());
    if (transactionId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: 'Payments & Finance',
        sourceRecordType: 'transaction',
        sourceRecordId: transactionId,
        sourceRecordName: `Transaction ${transactionId}`,
        returnModal: 'transaction-details',
        filterContextLabel: `Customer Profile for Transaction ${transactionId}`,
        filterCriteria: { userId, transactionId, userName: user?.name },
      });
    }

    setTargetUserId(userId);
    setActiveTab('users');
  };

  // 12. Transaction / Payout -> Worker Profile
  const handleNavigateToWorkerFromPayment = (workerId: string, transactionOrPayoutId?: string) => {
    const worker = MOCK_WORKERS.find((w) => w.id.toLowerCase() === workerId.toLowerCase());
    const isPayout = transactionOrPayoutId?.startsWith('PAY-');
    if (transactionOrPayoutId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: isPayout ? 'Payments (Payouts)' : 'Payments & Finance',
        sourceRecordType: isPayout ? 'payout' : 'transaction',
        sourceRecordId: transactionOrPayoutId,
        sourceRecordName: isPayout ? `Payout ${transactionOrPayoutId}` : `Transaction ${transactionOrPayoutId}`,
        returnModal: isPayout ? 'payout-details' : 'transaction-details',
        filterContextLabel: `Worker Profile for ${isPayout ? 'Payout' : 'Transaction'} ${transactionOrPayoutId}`,
        filterCriteria: { workerId, transactionId: transactionOrPayoutId, workerName: worker?.name },
      });
    }

    setTargetWorkerId(workerId);
    setActiveTab('workers');
  };

  // 12b. Job -> Payment / Transaction
  const handleNavigateToPaymentFromJob = (transactionId: string, sourceJobId?: string) => {
    if (sourceJobId) {
      pushContext({
        sourceModule: 'jobs',
        sourceModuleName: 'Job Management',
        sourceRecordType: 'job',
        sourceRecordId: sourceJobId,
        sourceRecordName: `Job ${sourceJobId}`,
        returnModal: 'job-details',
        filterContextLabel: `Transaction ${transactionId} for Job ${sourceJobId}`,
        filterCriteria: { transactionId, jobId: sourceJobId },
      });
    }

    setTargetTransactionId(transactionId);
    setPaymentsInitialTab('transactions');
    setActiveTab('payments');
  };

  // 13. Refund -> Dispute
  const handleNavigateToComplaintFromRefund = (complaintId: string, refundId?: string) => {
    if (refundId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: 'Payments (Refunds)',
        sourceRecordType: 'refund',
        sourceRecordId: refundId,
        sourceRecordName: `Refund ${refundId}`,
        returnModal: 'refund-details',
        filterContextLabel: `Dispute Case for Refund ${refundId}`,
        filterCriteria: { complaintId, refundId },
      });
    }

    setTargetComplaintId(complaintId);
    setActiveTab('disputes');
  };

  // 14. Refund -> Transaction
  const handleNavigateToTransactionFromRefund = (transactionId: string, refundId?: string) => {
    if (refundId) {
      pushContext({
        sourceModule: 'payments',
        sourceModuleName: 'Payments (Refunds)',
        sourceRecordType: 'refund',
        sourceRecordId: refundId,
        sourceRecordName: `Refund ${refundId}`,
        returnModal: 'refund-details',
        filterContextLabel: `Transaction for Refund ${refundId}`,
        filterCriteria: { transactionId, refundId },
      });
    }

    setTargetTransactionId(transactionId);
    setPaymentsInitialTab('transactions');
    setActiveTab('payments');
  };

  // 15. Header Dropdown -> Navigate to specific Admin & Security section
  const handleNavigateToSecuritySection = (section: SecurityTab) => {
    setSecurityInitialTab(section);
    setNavStack([]);
    setActiveTab('security');
  };

  // =========================================================================
  // DIRECT SIDEBAR / HEADER NAVIGATION
  // Clears cross-module context when deliberately selecting a main tab
  // =========================================================================
  const handleTabChange = (tab: AdminNavTab, subtab?: string) => {
    setNavStack([]);

    if (tab !== 'jobs') {
      setJobFilterWorkerId(null);
      setJobFilterUserId(null);
      setJobFilterStatus(null);
      setTargetJobId(null);
    }
    if (tab !== 'users') {
      setTargetUserId(null);
    }
    if (tab !== 'workers') {
      setTargetWorkerId(null);
    }
    if (tab === 'workers' && subtab === 'approvals') {
      setWorkerInitialViewTab('approvals');
    } else if (tab === 'workers' && !subtab) {
      // retain or default
    } else {
      setWorkerInitialViewTab('registry');
    }
    if (tab !== 'disputes') {
      setTargetComplaintId(null);
    }
    if (tab !== 'payments') {
      setTargetTransactionId(null);
      setTargetRefundId(null);
      setPaymentsInitialTab('transactions');
    }
    if (tab !== 'security') {
      setSecurityInitialTab('admin-accounts');
    }
    if (tab !== 'dashboard') {
      setDashboardTargetSection(null);
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboardPage
            jobs={jobs}
            onSelectTab={handleTabChange}
            targetSection={dashboardTargetSection}
            onClearTargetSection={() => setDashboardTargetSection(null)}
          />
        );
      case 'users':
        return (
          <UserManagementPage
            jobs={jobs}
            initialUserId={targetUserId}
            navContext={navContext}
            navStack={navStack}
            onNavigateToStackIndex={handleNavigateToStackIndex}
            onReturnToSource={handleReturnToSource}
            onNavigateToJob={handleNavigateToJobFromUser}
            onNavigateToJobsWithUserFilter={handleNavigateToJobsWithUserFilter}
          />
        );
      case 'workers':
        return (
          <WorkerManagementPage
            jobs={jobs}
            initialWorkerId={targetWorkerId}
            initialViewTab={workerInitialViewTab}
            navContext={navContext}
            navStack={navStack}
            onNavigateToStackIndex={handleNavigateToStackIndex}
            onReturnToSource={handleReturnToSource}
            onNavigateToJobFiltered={handleNavigateToJobFromWorker}
          />
        );
      case 'jobs':
        return (
          <JobManagementPage
            jobs={jobs}
            initialFilterWorkerId={jobFilterWorkerId}
            initialFilterUserId={jobFilterUserId}
            initialStatusFilter={jobFilterStatus}
            initialJobId={targetJobId}
            navContext={navContext}
            navStack={navStack}
            onNavigateToStackIndex={handleNavigateToStackIndex}
            onReturnToSource={handleReturnToSource}
            onViewUserProfile={handleNavigateToUserFromJob}
            onViewWorkerProfile={handleNavigateToWorkerFromJob}
            onNavigateToPayment={handleNavigateToPaymentFromJob}
          />
        );
      case 'disputes':
        return (
          <DisputesManagementPage
            initialComplaintId={targetComplaintId}
            initialJobId={targetJobId}
            navContext={navContext}
            navStack={navStack}
            onNavigateToStackIndex={handleNavigateToStackIndex}
            onReturnToSource={handleReturnToSource}
            onNavigateToJob={handleNavigateToJobFromComplaint}
            onNavigateToUser={handleNavigateToUserFromComplaint}
            onNavigateToWorker={handleNavigateToWorkerFromComplaint}
            onNavigateToPayment={handleNavigateToPaymentFromDispute}
          />
        );
      case 'payments':
        return (
          <PaymentsManagementPage
            initialTab={paymentsInitialTab}
            initialTransactionId={targetTransactionId}
            initialRefundId={targetRefundId}
            navContext={navContext}
            navStack={navStack}
            onNavigateToStackIndex={handleNavigateToStackIndex}
            onReturnToSource={handleReturnToSource}
            onNavigateToJob={(jobId) =>
              paymentsInitialTab === 'refunds'
                ? handleNavigateToJobFromRefund(jobId, targetRefundId || undefined)
                : handleNavigateToJobFromPayment(jobId, targetTransactionId || undefined)
            }
            onNavigateToUser={(userId) => handleNavigateToUserFromPayment(userId, targetTransactionId || undefined)}
            onNavigateToWorker={(workerId) =>
              handleNavigateToWorkerFromPayment(workerId, targetTransactionId || undefined)
            }
            onNavigateToComplaint={(complaintId) =>
              handleNavigateToComplaintFromRefund(complaintId, targetRefundId || undefined)
            }
            onNavigateToTransaction={(transactionId) =>
              handleNavigateToTransactionFromRefund(transactionId, targetRefundId || undefined)
            }
          />
        );
      case 'security':
        return (
          <AdminSecurityPage
            initialTab={securityInitialTab}
            onTabChange={(tab) => setSecurityInitialTab(tab)}
            onNavigateToTab={handleTabChange}
          />
        );
    }
  };

  const handleLoginSuccess = (session: AuthUserSession) => {
    try {
      localStorage.setItem('gigsevak_admin_session', JSON.stringify(session));
    } catch {}
    setCurrentSession(session);
    setActiveTab('dashboard');
    setNavStack([]);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('gigsevak_admin_session');
      localStorage.removeItem('gigsevak_token');
      sessionStorage.removeItem('gigsevak_token');
      localStorage.removeItem('gigsevak_admin_user');
    } catch {}
    setCurrentSession(null);
    setActiveTab('dashboard');
    setNavStack([]);
    setIsMobileMenuOpen(false);
  };

  // If not logged in, render the redesigned Government Administrative Login Page
  if (!currentSession) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex text-[#1F2933] font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        currentSession={currentSession}
        onSelectTab={handleTabChange}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          activeSecurityTab={securityInitialTab}
          currentSession={currentSession}
          onOpenMobileSidebar={() => setIsMobileMenuOpen(true)}
          onNavigateToSecuritySection={handleNavigateToSecuritySection}
          onNotificationClick={handleNotificationClick}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">{renderContent()}</main>

      </div>
    </div>
  );
};

export default App;

