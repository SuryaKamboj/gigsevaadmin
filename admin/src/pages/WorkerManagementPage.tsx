import React, { useState, useMemo, useEffect } from 'react';
import {
  WorkerItem,
  WorkerAccountStatus,
  WorkerApprovalStatus,
  InsuranceStatus,
  WorkerActivityLogItem,
  JobItem,
  NavigationSourceContext,
} from '../types';
import { adminService } from '../services/adminService';
import { WorkerTable } from '../components/WorkerTable';
import { WorkerCard } from '../components/WorkerCard';
import { Pagination } from '../components/Pagination';
import { WorkerDetailsModal } from '../components/WorkerDetailsModal';
import { WorkerConfirmationModal } from '../components/WorkerConfirmationModal';
import { NavigationContextBar } from '../components/NavigationContextBar';
import {
  Search,
  HardHat,
  FileSpreadsheet,
  Filter,
  RotateCcw,
  ShieldAlert,
  LayoutGrid,
  Table,
} from 'lucide-react';

const PAGE_SIZE = 8;

const SERVICE_CATEGORIES = [
  'All',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'AC Repair',
  'Appliance Repair',
  'Home Cleaning',
  'RO / Water Purifier Repair',
  'Handyman',
];

interface WorkerManagementPageProps {
  jobs?: JobItem[];
  initialWorkerId?: string | null;
  initialViewTab?: 'registry' | 'approvals';
  navContext?: NavigationSourceContext | null;
  navStack?: NavigationSourceContext[];
  onReturnToSource?: () => void;
  onNavigateToStackIndex?: (index: number) => void;
  onNavigateToJobFiltered?: (workerId: string, status?: string) => void;
}

export const WorkerManagementPage: React.FC<WorkerManagementPageProps> = ({
  jobs = [],
  initialWorkerId,
  initialViewTab = 'registry',
  navContext,
  navStack = [],
  onReturnToSource,
  onNavigateToStackIndex,
  onNavigateToJobFiltered,
}) => {
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [mainViewTab, setMainViewTab] = useState<'registry' | 'approvals'>(initialViewTab);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    if (initialViewTab) {
      setMainViewTab(initialViewTab);
    }
  }, [initialViewTab]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('All');
  const [selectedAccountStatus, setSelectedAccountStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [selectedWorkerForDetails, setSelectedWorkerForDetails] = useState<WorkerItem | null>(null);
  const [workerToConfirm, setWorkerToConfirm] = useState<WorkerItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    'activate' | 'deactivate' | 'suspend' | 'restore' | 'block' | 'unblock' | null
  >(null);

  // Reject Approval Modal State
  const [workerToReject, setWorkerToReject] = useState<WorkerItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Handle initialWorkerId navigation from Job Management
  useEffect(() => {
    if (initialWorkerId) {
      const target = workers.find((w) => w.id.toLowerCase() === initialWorkerId.toLowerCase());
      if (target) {
        handleOpenWorkerDetails(target);
      }
    }
  }, [initialWorkerId, workers]);

  // Open worker dossier and fetch live full canonical details from backend
  const handleOpenWorkerDetails = async (worker: WorkerItem) => {
    setSelectedWorkerForDetails(worker);
    try {
      const detailed = await adminService.getWorkerDetails(worker.id);
      if (detailed) {
        const normalizedLocation = typeof detailed.location === 'string'
          ? detailed.location
          : (detailed.currentAddress
              ? `${detailed.currentAddress}${detailed.city ? `, ${detailed.city}` : ''}`
              : (typeof detailed.location === 'object' && detailed.location !== null
                  ? [detailed.location.currentAddress, detailed.location.city, detailed.location.pincode].filter(Boolean).join(', ')
                  : (worker.location || 'New Delhi')));

        setSelectedWorkerForDetails((prev) => (prev && prev.id === worker.id ? {
          ...prev,
          ...detailed,
          location: normalizedLocation
        } : {
          ...detailed,
          location: normalizedLocation
        }));
      }
    } catch (err) {
      console.warn('[WorkerManagementPage] Live dossier fetch notice:', err);
    }
  };

  // Fetch real workers from backend
  const fetchBackendWorkers = async () => {
    try {
      const res = await adminService.getWorkers({ limit: 100 });
      const rawList: any[] = 
        res?.data?.workers ||
        res?.workers ||
        (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));

      if (Array.isArray(rawList)) {
        const mappedBackend: WorkerItem[] = rawList.map((w: any) => {
          const kyc = (w.kycVerificationStatus || 'PENDING').toUpperCase();
          const approvalStatus: WorkerApprovalStatus =
            kyc === 'VERIFIED' ? 'Approved' : kyc === 'REJECTED' ? 'Rejected' : 'Pending';
          const accountStatus: WorkerAccountStatus =
            kyc === 'VERIFIED' ? (w.availabilityStatus === 'SUSPENDED' ? 'Suspended' : 'Active') : 'Inactive';

          const primaryCategory = w.primarySkill || w.primaryServiceCategory || w.skills?.[0]?.category || 'Electrician';
          const skillList = Array.isArray(w.servicesOffered) && w.servicesOffered.length > 0
            ? w.servicesOffered
            : (Array.isArray(w.skills) && w.skills.length > 0
                ? w.skills.map((s: any) => (typeof s === 'string' ? s : s.category || 'General Skill'))
                : [primaryCategory]);

          const joined = w.createdAt
            ? new Date(w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Today';

          const aadhaarMasked = w.aadhaarNumberMasked || w.privateData?.aadhaarNumberMasked || 'XXXX-XXXX-0124';

          const rawImg = w.avatarUrl || w.profilePhoto || w.image || w.selfieUrl;
          const validImg = rawImg && (rawImg.startsWith('http') || rawImg.startsWith('data:'))
            ? rawImg
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

          const rawExp = w.yearsOfExperience !== undefined ? w.yearsOfExperience : (w.skills?.[0]?.experienceYears || 0);
          const yearsOfExp = typeof rawExp === 'number' ? rawExp : parseInt(String(rawExp).replace(/\D/g, ''), 10) || 0;

          const workingHoursDisplay = w.workingHours || (w.workingHoursStart && w.workingHoursEnd ? `${w.workingHoursStart} – ${w.workingHoursEnd}` : '09:00 AM – 06:00 PM');

          const certs = Array.isArray(w.certifications) && w.certifications.length > 0
            ? w.certifications.map((c: any, idx: number) => ({
                id: c.id || `cert-${idx + 1}`,
                name: typeof c === 'string' ? c : c.name || 'Trade Certificate',
                issuer: c.issuer || '',
                certificateNumber: c.certificateNumber || '',
                documentUrl: c.documentUrl || '',
                status: c.status || 'Verified',
                issueDate: c.issueDate || '',
                expiryDate: c.expiryDate || '',
                verifiedDate: c.verifiedDate || '',
                verifiedBy: c.verifiedBy || 'Admin Officer',
                rejectionReason: c.rejectionReason || ''
              }))
            : [];

          return {
            id: w.workerCode || w.id || w._id || `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
            name: w.fullName || w.name || 'Worker Applicant',
            phone: w.phone || w.userId?.mobileNumber || w.mobileNumber || '+91 98765 00000',
            image: validImg,
            category: primaryCategory,
            primarySkill: primaryCategory,
            skills: skillList,
            yearsOfExperience: yearsOfExp,
            skillLevel: w.skillLevel || 'Intermediate',
            servicesOffered: skillList,
            toolsAndEquipment: Array.isArray(w.toolsAndEquipment) ? w.toolsAndEquipment : [],
            availableDays: Array.isArray(w.availableDays) ? w.availableDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            workingHoursStart: w.workingHoursStart || '09:00',
            workingHoursEnd: w.workingHoursEnd || '18:00',
            workType: w.workType || 'Full-time',
            aboutMe: w.aboutMe || '',
            previousWorkExperience: w.previousWorkExperience || '',
            trainingCompleted: Array.isArray(w.trainingCompleted) ? w.trainingCompleted : [],
            portfolio: Array.isArray(w.portfolio) ? w.portfolio : [],
            currentAddress: w.currentAddress || w.addressLine || '',
            city: w.city || '',
            pincode: w.pincode || '',
            preferredWorkingAreas: Array.isArray(w.preferredWorkingAreas) ? w.preferredWorkingAreas : [primaryCategory],
            dateOfBirth: w.dateOfBirth || '',
            gender: w.gender || '',
            email: w.email || w.userId?.email || '',
            joinedDate: joined,
            location: typeof w.location === 'string'
              ? w.location
              : (w.currentAddress
                  ? `${w.currentAddress}${w.city ? `, ${w.city}` : ''}`
                  : (typeof w.location === 'object' && w.location !== null
                      ? [w.location.currentAddress, w.location.city, w.location.pincode].filter(Boolean).join(', ')
                      : (w.addressLine || w.serviceArea || 'New Delhi'))),
            serviceArea: w.serviceArea || (w.city ? `${w.city} & Surrounding Areas` : 'Delhi NCR & Surrounding Areas'),
            workingHours: workingHoursDisplay,
            approvalStatus,
            rejectionReason: w.rejectionReason,
            aadhaarNumberMasked: aadhaarMasked,
            aadhaarVerified: w.aadhaarVerified !== false,
            selfieUrl: w.selfieUrl || validImg,
            status: accountStatus,
            profileCompletion: kyc === 'VERIFIED' ? 100 : 75,
            adminRemarks: w.rejectionReason || '',
            certifications: certs,
            insurance: w.insurance || {
              status: 'Not Applied',
              planName: 'Basic Worker Protection',
              coverage: '₹2,00,000'
            },
            activityLogs: Array.isArray(w.activityLogs) && w.activityLogs.length > 0
              ? w.activityLogs
              : [
                  {
                    id: `log-init-${w._id || w.id}`,
                    date: joined,
                    time: '10:00 AM',
                    action: 'Application Submitted',
                    details: `Worker applied with Aadhaar ${aadhaarMasked}`,
                    performedBy: 'System'
                  }
                ],
            totalJobs: w.totalJobs || w.metrics?.completedJobsCount || 0,
            completedJobs: w.completedJobs || w.metrics?.completedJobsCount || 0,
            cancelledJobs: 0,
            averageRating: w.averageRating || w.metrics?.averageRating || 5.0,
            totalRatings: w.totalRatings || w.metrics?.reviewCount || 0,
            complaintsCount: 0,
            reviews: Array.isArray(w.reviews) ? w.reviews : []
          };
        });

        // Directly set live backend applicants without mock items
        setWorkers(mappedBackend);
      }
    } catch (err) {
      console.warn('Backend workers fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchBackendWorkers();
    const interval = setInterval(fetchBackendWorkers, 4000);
    return () => clearInterval(interval);
  }, []);

  // Statistics (view-only)
  const totalCount = workers.length;
  const pendingApprovalCount = workers.filter((w) => w.approvalStatus === 'Pending').length;
  const activeCount = workers.filter((w) => w.status === 'Active' && w.approvalStatus === 'Approved').length;
  const inactiveCount = workers.filter((w) => w.status === 'Inactive').length;
  const suspendedCount = workers.filter((w) => w.status === 'Suspended').length;
  const blockedCount = workers.filter((w) => w.status === 'Blocked').length;

  // Filter and Search Logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      // Main View Tab Filter
      if (mainViewTab === 'approvals') {
        if (worker.approvalStatus !== 'Pending' && worker.approvalStatus !== 'Rejected') {
          return false;
        }
      } else {
        // Registry tab shows approved / registered workers
        if (worker.approvalStatus !== 'Approved') {
          return false;
        }
      }

      // Approval Status Filter
      if (selectedApprovalStatus !== 'All' && worker.approvalStatus !== selectedApprovalStatus) {
        return false;
      }

      // Worker Status Filter
      if (selectedAccountStatus !== 'All' && worker.status !== selectedAccountStatus) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'All' && worker.category !== selectedCategory) {
        return false;
      }

      // Search Query (Worker ID, Name, Mobile)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = worker.id.toLowerCase().includes(query);
        const matchesName = worker.name.toLowerCase().includes(query);
        const matchesPhone = worker.phone.toLowerCase().includes(query);
        return matchesId || matchesName || matchesPhone;
      }

      return true;
    });
  }, [
    workers,
    mainViewTab,
    selectedApprovalStatus,
    selectedAccountStatus,
    selectedCategory,
    searchQuery,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredWorkers.length / PAGE_SIZE) || 1;
  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWorkers.slice(start, start + PAGE_SIZE);
  }, [filteredWorkers, currentPage]);

  const getFormattedNow = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { dateStr, timeStr };
  };

  // Worker Approval Actions
  const handleApproveWorker = async (worker: WorkerItem) => {
    const { dateStr, timeStr } = getFormattedNow();

    try {
      await adminService.updateWorkerKyc(worker.id, 'VERIFIED');
      await fetchBackendWorkers();
    } catch (err) {
      console.warn('Backend verification sync notice:', err);
    }

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Admin Approved',
      details: 'Worker onboarding verified and authorized for cooperative workforce operations.',
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...worker,
      approvalStatus: 'Approved',
      status: 'Active',
      rejectionReason: undefined,
      activityLogs: [newLog, ...(worker.activityLogs || [])],
    };

    const updatedList = workers.map((w) => (w.id === worker.id ? updatedWorker : w));
    setWorkers(updatedList);
  };

  const handleOpenRejectModal = (worker: WorkerItem) => {
    setWorkerToReject(worker);
    setRejectReasonInput('');
    setRejectError('');
  };

  const handleConfirmRejectWorker = async () => {
    if (!workerToReject || !rejectReasonInput.trim()) {
      setRejectError('A specific reason for rejection is mandatory.');
      return;
    }

    const { dateStr, timeStr } = getFormattedNow();
    const reasonText = rejectReasonInput.trim();

    try {
      await adminService.updateWorkerKyc(workerToReject.id, 'REJECTED', reasonText);
      await fetchBackendWorkers();
    } catch (err) {
      console.warn('Backend rejection sync notice:', err);
    }

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Admin Rejected',
      details: `Worker onboarding rejected: ${reasonText}`,
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...workerToReject,
      approvalStatus: 'Rejected',
      status: 'Inactive',
      rejectionReason: reasonText,
      activityLogs: [newLog, ...(workerToReject.activityLogs || [])],
    };

    const updatedList = workers.map((w) => (w.id === workerToReject.id ? updatedWorker : w));
    setWorkers(updatedList);
    setWorkerToReject(null);
    setRejectReasonInput('');
    setRejectError('');
  };

  // Profile Update Handler
  const handleUpdateWorker = (updatedWorker: WorkerItem, changeSummary: string[]) => {
    const { dateStr, timeStr } = getFormattedNow();

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Profile Changes',
      details: changeSummary.length > 0 ? changeSummary.join('; ') : 'Official worker profile modified by administrative officer.',
      performedBy: 'Admin Officer',
    };

    const workerWithLog: WorkerItem = {
      ...updatedWorker,
      activityLogs: [newLog, ...(updatedWorker.activityLogs || [])],
    };

    const updatedList = workers.map((w) => (w.id === workerWithLog.id ? workerWithLog : w));
    setWorkers(updatedList);
    setSelectedWorkerForDetails(workerWithLog);
  };

  // Certification Review Handler
  const handleUpdateCertification = (
    workerId: string,
    certId: string,
    newStatus: 'Verified' | 'Rejected',
    reason?: string
  ) => {
    const { dateStr, timeStr } = getFormattedNow();

    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    const certName = targetWorker.certifications?.find((c) => c.id === certId)?.name || 'Certificate';

    const updatedCerts = targetWorker.certifications.map((c) => {
      if (c.id === certId) {
        return {
          ...c,
          status: newStatus,
          verifiedDate: newStatus === 'Verified' ? dateStr : undefined,
          verifiedBy: newStatus === 'Verified' ? 'Admin Officer' : undefined,
          rejectionReason: newStatus === 'Rejected' ? reason : undefined,
        };
      }
      return c;
    });

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Certification Decisions',
      details: `${certName} marked as ${newStatus}${reason ? `: ${reason}` : ''}.`,
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...targetWorker,
      certifications: updatedCerts,
      activityLogs: [newLog, ...(targetWorker.activityLogs || [])],
    };

    const updatedList = workers.map((w) => (w.id === workerId ? updatedWorker : w));
    setWorkers(updatedList);
    if (selectedWorkerForDetails && selectedWorkerForDetails.id === workerId) {
      setSelectedWorkerForDetails(updatedWorker);
    }
  };

  // Insurance Update Handler
  const handleUpdateInsurance = (
    workerId: string,
    planName: string,
    coverage: string,
    status: InsuranceStatus,
    rejectionReason?: string
  ) => {
    const { dateStr, timeStr } = getFormattedNow();

    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;

    const updatedInsurance = {
      status,
      planName,
      coverage,
      applicationDate: targetWorker.insurance?.applicationDate || dateStr,
      validUntil: status === 'Active' ? '31 Dec 2026' : targetWorker.insurance?.validUntil,
      policyNumber:
        status === 'Active'
          ? targetWorker.insurance?.policyNumber || `GIG-INS-2026-${Math.floor(1000 + Math.random() * 9000)}`
          : undefined,
      rejectionReason,
    };

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Insurance Changes',
      details: `${planName} (${coverage}) status set to ${status}.`,
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...targetWorker,
      insurance: updatedInsurance,
      activityLogs: [newLog, ...(targetWorker.activityLogs || [])],
    };

    const updatedList = workers.map((w) => (w.id === workerId ? updatedWorker : w));
    setWorkers(updatedList);
    if (selectedWorkerForDetails && selectedWorkerForDetails.id === workerId) {
      setSelectedWorkerForDetails(updatedWorker);
    }
  };

  // Status Confirmation Handlers
  const handleRequestStatusChange = (
    worker: WorkerItem,
    action: 'activate' | 'deactivate' | 'suspend' | 'restore' | 'block' | 'unblock'
  ) => {
    setWorkerToConfirm(worker);
    setConfirmAction(action);
  };

  const handleConfirmStatusChange = () => {
    if (!workerToConfirm || !confirmAction) return;

    const { dateStr, timeStr } = getFormattedNow();
    let nextStatus: WorkerAccountStatus = workerToConfirm.status;
    if (confirmAction === 'activate' || confirmAction === 'restore' || confirmAction === 'unblock') nextStatus = 'Active';
    if (confirmAction === 'deactivate') nextStatus = 'Inactive';
    if (confirmAction === 'suspend') nextStatus = 'Suspended';
    if (confirmAction === 'block') nextStatus = 'Blocked';

    const newLog: WorkerActivityLogItem = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Worker Status Changes',
      details: `Account status transitioned from ${workerToConfirm.status} to ${nextStatus}.`,
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...workerToConfirm,
      status: nextStatus,
      activityLogs: [newLog, ...(workerToConfirm.activityLogs || [])],
    };

    const updated = workers.map((w) => (w.id === workerToConfirm.id ? updatedWorker : w));
    setWorkers(updated);

    if (selectedWorkerForDetails && selectedWorkerForDetails.id === workerToConfirm.id) {
      setSelectedWorkerForDetails(updatedWorker);
    }

    setWorkerToConfirm(null);
    setConfirmAction(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedApprovalStatus('All');
    setSelectedAccountStatus('All');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedApprovalStatus !== 'All' ||
    selectedAccountStatus !== 'All' ||
    selectedCategory !== 'All';

  return (
    <div className="space-y-5">
      {/* Top Cross-Module Navigation Context Bar */}
      {navContext && onReturnToSource && (
        <NavigationContextBar
          navContext={navContext}
          navStack={navStack}
          onReturnToSource={onReturnToSource}
          onNavigateToStackIndex={onNavigateToStackIndex}
          currentDestinationName="Worker Management"
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DCE3]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#12355B] tracking-tight">Worker Management</h1>
          <p className="text-xs text-[#5B6573] mt-0.5">
            Manage approved workers, their administrative profiles, credentials, insurance and status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting Official Worker Registry (CSV)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] hover:bg-[#F4F6F8] rounded-sm shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Export Registry (CSV)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Small administrative summary cards: Total, Pending, Active, Inactive, Suspended, Blocked) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Workers */}
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] block">Total Workers</span>
          <div className="text-lg font-bold font-mono text-[#1F2933] mt-0.5">{totalCount}</div>
          <span className="text-[10px] text-[#5B6573]">All Intake Records</span>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => {
            setMainViewTab('approvals');
            setCurrentPage(1);
          }}
          className={`bg-white p-3 rounded-sm border shadow-xs cursor-pointer transition-colors ${
            mainViewTab === 'approvals' ? 'border-[#B26A00] ring-1 ring-[#B26A00]' : 'border-[#D5DCE3] hover:border-[#BAC7D5]'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B26A00] block">Pending Approval</span>
          <div className="text-lg font-bold font-mono text-[#B26A00] mt-0.5">{pendingApprovalCount}</div>
          <span className="text-[10px] text-[#B26A00] font-semibold">Awaiting Review</span>
        </div>

        {/* Active */}
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] block">Active</span>
          <div className="text-lg font-bold font-mono text-[#2E7D32] mt-0.5">{activeCount}</div>
          <span className="text-[10px] text-[#2E7D32] font-semibold">Authorized Active</span>
        </div>

        {/* Inactive */}
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] block">Inactive</span>
          <div className="text-lg font-bold font-mono text-[#5B6573] mt-0.5">{inactiveCount}</div>
          <span className="text-[10px] text-[#5B6573]">Dormant / Off-Duty</span>
        </div>

        {/* Suspended */}
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B26A00] block">Suspended</span>
          <div className="text-lg font-bold font-mono text-[#B26A00] mt-0.5">{suspendedCount}</div>
          <span className="text-[10px] text-[#5B6573]">Temporary Hold</span>
        </div>

        {/* Blocked */}
        <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318] block">Blocked</span>
          <div className="text-lg font-bold font-mono text-[#B42318] mt-0.5">{blockedCount}</div>
          <span className="text-[10px] text-[#B42318] font-semibold">Disciplinary Flag</span>
        </div>
      </div>

      {/* Main Table & Filters Container */}
      <div className="bg-white rounded-sm border border-[#D5DCE3] shadow-xs overflow-hidden">
        {/* Main Area View Tabs: Workforce Registry vs Approval Requests */}
        <div className="flex border-b border-[#D5DCE3] bg-[#F4F6F8] px-3 pt-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMainViewTab('registry');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x ${
              mainViewTab === 'registry'
                ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
            }`}
          >
            Find Workers & Registry ({workers.filter((w) => w.approvalStatus === 'Approved').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setMainViewTab('approvals');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x flex items-center gap-1.5 ${
              mainViewTab === 'approvals'
                ? 'bg-white text-[#B26A00] border-[#D5DCE3] border-b-white -mb-px'
                : 'text-[#5B6573] border-transparent hover:text-[#B26A00]'
            }`}
          >
            <span>Approval Requests</span>
            {pendingApprovalCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#B26A00] text-white text-[10px] font-bold rounded-full">
                {pendingApprovalCount}
              </span>
            )}
          </button>
        </div>

        {/* Notice banner when on Registry tab and there are pending approvals */}
        {mainViewTab === 'registry' && pendingApprovalCount > 0 && (
          <div className="mx-3 mt-3 p-3 bg-[#FFF9E6] border border-[#FFE082] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8D5B00]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#E67E22] animate-pulse flex-shrink-0" />
              <span>
                <strong>{pendingApprovalCount} Worker Applicant{pendingApprovalCount > 1 ? 's' : ''}</strong> submitted onboarding and {pendingApprovalCount > 1 ? 'are' : 'is'} awaiting verification before dashboard access unlocks.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMainViewTab('approvals');
                setCurrentPage(1);
              }}
              className="font-bold underline text-[#8D5B00] hover:text-[#5D3C00] whitespace-nowrap cursor-pointer text-left sm:text-right"
            >
              View Approval Requests ({pendingApprovalCount}) →
            </button>
          </div>
        )}

        {/* Structured Administrative Toolbar */}
        <div className="p-3 border-b border-[#D5DCE3] bg-[#F4F6F8] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6573]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Worker ID, Name or Mobile..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#8795A5] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#5B6573]">
              <Filter className="w-3.5 h-3.5 text-[#12355B]" />
              <span className="hidden sm:inline font-semibold text-[11px] uppercase">Filters:</span>
            </div>

            {/* Approval Status Filter */}
            {mainViewTab === 'approvals' && (
              <div className="flex items-center">
                <select
                  value={selectedApprovalStatus}
                  onChange={(e) => {
                    setSelectedApprovalStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                >
                  <option value="All">Approval Status: All</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            )}

            {/* Worker Status Filter */}
            {mainViewTab === 'registry' && (
              <div className="flex items-center">
                <select
                  value={selectedAccountStatus}
                  onChange={(e) => {
                    setSelectedAccountStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                >
                  <option value="All">Worker Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            )}

            {/* Service Category Filter */}
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs bg-white border border-[#BAC7D5] text-[#1F2933] rounded-xs py-1.5 px-2.5 font-medium focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
              >
                <option value="All">Category: All</option>
                {SERVICE_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-white border border-[#BAC7D5] rounded-xs p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#12355B] text-white shadow-xs'
                    : 'text-[#5B6573] hover:text-[#12355B] hover:bg-[#F4F6F8]'
                }`}
                title="Workers Card Format"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#12355B] text-white shadow-xs'
                    : 'text-[#5B6573] hover:text-[#12355B] hover:bg-[#F4F6F8]'
                }`}
                title="Table Format"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>

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
        {filteredWorkers.length === 0 ? (
          <div className="py-12 text-center text-[#5B6573]">
            <HardHat className="w-8 h-8 mx-auto text-[#BAC7D5] mb-2" />
            <p className="text-xs font-bold text-[#1F2933] uppercase">
              {totalCount === 0
                ? mainViewTab === 'approvals'
                  ? 'No Worker Applications Pending Review'
                  : 'No Approved Workers in Registry Yet'
                : 'No workers found'}
            </p>
            <p className="text-[11px] text-[#5B6573] mt-0.5 max-w-sm mx-auto">
              {totalCount === 0
                ? mainViewTab === 'approvals'
                  ? 'When workers submit their onboarding application with Aadhaar verification in the Worker App, they will appear here for admin review.'
                  : 'Approved workers will appear here in the active workforce registry.'
                : 'No workers match your selected filters.'}
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
            {/* View Mode: Table View */}
            {viewMode === 'table' ? (
              <>
                <div className="hidden md:block">
                  <WorkerTable
                    workers={paginatedWorkers}
                    jobs={jobs}
                    onViewDetails={handleOpenWorkerDetails}
                    onApprove={handleApproveWorker}
                    onReject={handleOpenRejectModal}
                    onNavigateToJobs={(workerId) => onNavigateToJobFiltered && onNavigateToJobFiltered(workerId)}
                    isApprovalView={mainViewTab === 'approvals'}
                  />
                </div>
                <div className="md:hidden p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paginatedWorkers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      jobs={jobs}
                      onViewDetails={handleOpenWorkerDetails}
                      onApprove={handleApproveWorker}
                      onReject={handleOpenRejectModal}
                      onNavigateToJobs={(workerId) => onNavigateToJobFiltered && onNavigateToJobFiltered(workerId)}
                      isApprovalView={mainViewTab === 'approvals'}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* View Mode: Workers Card Format */
              <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 bg-[#F8F9FA]">
                {paginatedWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    jobs={jobs}
                    onViewDetails={handleOpenWorkerDetails}
                    onApprove={handleApproveWorker}
                    onReject={handleOpenRejectModal}
                    onNavigateToJobs={(workerId) => onNavigateToJobFiltered && onNavigateToJobFiltered(workerId)}
                    isApprovalView={mainViewTab === 'approvals'}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredWorkers.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="workers"
            />
          </>
        )}
      </div>

      {/* Worker Details Modal */}
      <WorkerDetailsModal
        isOpen={!!selectedWorkerForDetails}
        worker={selectedWorkerForDetails}
        onClose={() => setSelectedWorkerForDetails(null)}
        onUpdateWorker={handleUpdateWorker}
        onUpdateCertification={handleUpdateCertification}
        onUpdateInsurance={handleUpdateInsurance}
        onRequestStatusChange={handleRequestStatusChange}
        onNavigateToJobFiltered={onNavigateToJobFiltered}
        onApproveWorker={handleApproveWorker}
        onRejectWorker={handleOpenRejectModal}
      />

      {/* Confirmation Modal for Worker Status Actions */}
      <WorkerConfirmationModal
        isOpen={!!workerToConfirm}
        worker={workerToConfirm}
        action={confirmAction}
        onConfirm={handleConfirmStatusChange}
        onClose={() => {
          setWorkerToConfirm(null);
          setConfirmAction(null);
        }}
      />

      {/* Reject Approval Modal (Mandatory Rejection Reason) */}
      {workerToReject && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-sm max-w-md w-full p-4 border border-[#B42318] shadow-2xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D5DCE3]">
              <ShieldAlert className="w-5 h-5 text-[#B42318]" />
              <h4 className="text-sm font-bold text-[#B42318] uppercase">
                Reject Worker Onboarding Application
              </h4>
            </div>

            <p className="text-xs text-[#5B6573]">
              You are rejecting onboarding intake for{' '}
              <strong className="text-[#1F2933]">{workerToReject.name} ({workerToReject.id})</strong>. Please state the specific reason so the worker can correct their profile and resubmit.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-[#5B6573]">
                Mandatory Reason for Rejection *
              </label>
              <textarea
                value={rejectReasonInput}
                onChange={(e) => {
                  setRejectReasonInput(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                rows={3}
                placeholder="e.g. Incomplete service area definition, insufficient trade experience details, or unreadable category description..."
                className="w-full text-xs p-2 bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs focus:outline-none focus:border-[#B42318] focus:ring-1 focus:ring-[#B42318]"
              />
              {rejectError && <p className="text-[11px] text-[#B42318] font-semibold">{rejectError}</p>}
            </div>

            <div className="pt-2 border-t border-[#D5DCE3] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWorkerToReject(null)}
                className="px-3 py-1.5 text-xs text-[#5B6573] bg-[#F4F6F8] border border-[#D5DCE3] rounded-xs hover:bg-[#EAF2F8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectWorker}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
