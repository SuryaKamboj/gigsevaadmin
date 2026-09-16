import React, { useState } from 'react';
import {
  WorkerItem,
  WorkerAccountStatus,
  InsuranceStatus,
  WorkerCertificationItem,
} from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import { WorkerEditProfileModal } from './WorkerEditProfileModal';
import { WorkerCertReviewModal } from './WorkerCertReviewModal';
import {
  X,
  HardHat,
  Phone,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Award,
  Shield,
  FileText,
  Activity,
  Star,
  Edit3,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Save,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface WorkerDetailsModalProps {
  isOpen: boolean;
  worker: WorkerItem | null;
  onClose: () => void;
  onUpdateWorker: (updatedWorker: WorkerItem, changeSummary: string[]) => void;
  onUpdateCertification: (
    workerId: string,
    certId: string,
    status: 'Verified' | 'Rejected',
    reason?: string
  ) => void;
  onUpdateInsurance: (
    workerId: string,
    planName: string,
    coverage: string,
    status: InsuranceStatus,
    rejectionReason?: string
  ) => void;
  onRequestStatusChange: (
    worker: WorkerItem,
    action: 'activate' | 'deactivate' | 'suspend' | 'restore' | 'block' | 'unblock'
  ) => void;
  onNavigateToJobFiltered?: (workerId: string, status?: string) => void;
  onApproveWorker?: (worker: WorkerItem) => void;
  onRejectWorker?: (worker: WorkerItem) => void;
}

export const WorkerDetailsModal: React.FC<WorkerDetailsModalProps> = ({
  isOpen,
  worker,
  onClose,
  onUpdateWorker,
  onUpdateCertification,
  onUpdateInsurance: _onUpdateInsurance,
  onRequestStatusChange,
  onNavigateToJobFiltered,
  onApproveWorker,
  onRejectWorker,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'certifications' | 'insurance' | 'remarks' | 'activity' | 'performance'>('profile');
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  // Sub-modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedCertForReview, setSelectedCertForReview] = useState<WorkerCertificationItem | null>(null);
  const [isInsuranceConfirmedOpen, setIsInsuranceConfirmedOpen] = useState(false);

  // Admin remarks editing state
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState('');

  React.useEffect(() => {
    if (worker) {
      setRemarksText(worker.adminRemarks || '');
      setIsEditingRemarks(false);
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  const handleSaveRemarks = () => {
    if (!worker) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newLog = {
      id: `wlog-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      action: 'Admin Remarks',
      details: `Internal officer remarks updated: "${remarksText}"`,
      performedBy: 'Admin Officer',
    };

    const updatedWorker: WorkerItem = {
      ...worker,
      adminRemarks: remarksText,
      activityLogs: [newLog, ...(worker.activityLogs || [])],
    };

    onUpdateWorker(updatedWorker, ['Updated internal administrative remarks']);
    setIsEditingRemarks(false);
  };

  const getStatusBadge = (status: WorkerAccountStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <ShieldCheck className="w-3 h-3 text-[#2E7D32]" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3]">
            <Clock className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <AlertTriangle className="w-3 h-3 text-[#B26A00]" />
            Suspended
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <ShieldAlert className="w-3 h-3 text-[#B42318]" />
            Blocked
          </span>
        );
    }
  };

  const getCertBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        );
      case 'Submitted':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3]">
            {status}
          </span>
        );
    }
  };

  const getInsuranceBadge = (status: InsuranceStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <Shield className="w-3 h-3 text-[#2E7D32]" />
            Active Coverage
          </span>
        );
      case 'Application Submitted':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <Clock className="w-3 h-3 text-[#B26A00]" />
            Pending Processing
          </span>
        );
      case 'Expired':
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <ShieldAlert className="w-3 h-3 text-[#B42318]" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3]">
            Not Enrolled
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
        <div
          className="relative bg-white rounded-sm max-w-4xl w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
                <HardHat className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                    Worker Administrative Dossier
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                    {worker.id}
                  </span>
                </div>
                <p className="text-[10px] text-[#A5B9CC]">
                  Credentials, Trade Skills, Insurance, Audit Trail & Derived Performance
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#D5DCE3] bg-[#F4F6F8] px-4 pt-2 gap-1.5 overflow-x-auto select-none">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              1. Profile & Skills
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('certifications')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'certifications'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              2. Certifications ({worker.certifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('insurance')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'insurance'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              3. Insurance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('remarks')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'remarks'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              4. Remarks & Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              5. Activity Log ({worker.activityLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              6. Performance & Reviews
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F4F6F8]">
            {/* TAB 1: PROFILE & SKILLS */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-4">
                  {/* Photo & Basic Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-4">
                      {/* Clickable Photo for Lightbox */}
                      <div className="relative group cursor-pointer" onClick={() => setIsPhotoLightboxOpen(true)}>
                        <img
                          src={worker.image}
                          alt={worker.name}
                          className="w-20 h-20 rounded-sm object-cover border border-[#BAC7D5] group-hover:border-[#12355B] transition-colors"
                        />
                        <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-sm flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                          Enlarge
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-[#1F2933]">{worker.name}</h4>
                          {getStatusBadge(worker.status)}
                        </div>
                        <p className="text-xs font-mono font-bold text-[#12355B]">
                          WORKER ID: {worker.id}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#5B6573]">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="font-mono">{worker.phone}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#12355B]">{worker.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit Profile Action Button */}
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] hover:bg-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Admin Profile</span>
                    </button>
                  </div>

                  {/* Profile Completion & Service Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Trade Experience</span>
                      <p className="font-semibold text-[#1F2933] mt-0.5">{worker.yearsOfExperience} Years Verified</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Working Hours</span>
                      <p className="text-[#1F2933] mt-0.5">{worker.workingHours}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Profile Completion</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-[#1F2933]">{worker.profileCompletion}%</span>
                        <div className="w-20 h-1.5 bg-[#E2E8F0] rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-[#2E7D32]"
                            style={{ width: `${worker.profileCompletion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Designated Service Area</span>
                      <p className="text-[#1F2933] font-medium mt-0.5">{worker.serviceArea}</p>
                      <p className="text-[10px] text-[#5B6573] mt-0.5">Base Station: {worker.location}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Registry Registration</span>
                      <p className="text-[#5B6573] mt-0.5">{worker.joinedDate}</p>
                    </div>
                  </div>

                  {/* Skills & Categories List */}
                  <div className="pt-3 border-t border-[#D5DCE3]">
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block mb-1.5">
                      Authorized Categories & Additional Skill Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-xs bg-[#12355B] text-white text-[11px] font-semibold">
                        ★ Primary: {worker.category}
                      </span>
                      {worker.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xs bg-[#F4F6F8] text-[#1F2933] border border-[#D5DCE3] text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Aadhaar & Identity Verification Dossier Card */}
                  <div className="pt-3 border-t border-[#D5DCE3] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                        <span className="text-[11px] uppercase font-bold text-[#12355B]">
                          Aadhaar & Biometric Verification Dossier
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs border ${
                          worker.approvalStatus === 'Approved'
                            ? 'text-[#2E7D32] bg-[#E8F5E9] border-[#C8E6C9]'
                            : worker.approvalStatus === 'Rejected'
                            ? 'text-[#B42318] bg-red-50 border-red-200'
                            : 'text-[#B26A00] bg-amber-50 border-amber-200'
                        }`}
                      >
                        KYC {worker.approvalStatus === 'Approved' ? 'Verified & Active' : worker.approvalStatus === 'Rejected' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-xs border border-[#E2E8F0]">
                      {/* Aadhaar Card Record */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#5B6573] block">
                          Aadhaar Number (UIDAI)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#1F2933]">
                            {worker.aadhaarNumberMasked || 'XXXX-XXXX-0124'}
                          </span>
                          <span className="text-[10px] font-semibold text-[#2E7D32] bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                            ✓ OTP Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-[#5B6573]">
                          Verhoeff checksum validated during worker onboarding.
                        </p>
                      </div>

                      {/* Live Selfie Verification */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#5B6573] block">
                          Biometric Live Selfie
                        </span>
                        <div className="flex items-center gap-3">
                          {worker.image && (
                            <img
                              src={worker.image}
                              alt="Selfie verification"
                              className="w-12 h-12 rounded-xs object-cover border border-[#BAC7D5]"
                            />
                          )}
                          <div>
                            <span className="text-[10px] font-semibold text-[#1C4E80] bg-[#EAF2F8] px-1.5 py-0.5 rounded-xs border border-[#BAC7D5] block w-fit">
                              ✓ Live Selfie Verified
                            </span>
                            <span className="text-[10px] text-[#5B6573] block mt-0.5">
                              Face match and liveness confirmed.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {worker.rejectionReason && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xs text-xs text-red-700">
                        <strong>Rejection Reason:</strong> {worker.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CERTIFICATIONS */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#1C4E80]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Professional Trade Certifications
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#5B6573] italic">
                      Admin Verification Workflow • Does not affect profile completion
                    </span>
                  </div>

                  {worker.certifications.length === 0 ? (
                    <div className="text-center py-8 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] text-xs text-[#5B6573]">
                      No professional trade certificates submitted by worker yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {worker.certifications.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs font-bold text-[#1F2933]">{cert.name}</h5>
                              {getCertBadge(cert.status)}
                            </div>
                            <div className="text-[11px] text-[#5B6573] space-y-0.5">
                              {cert.issuer && <p>Issuer: <span className="text-[#1F2933]">{cert.issuer}</span></p>}
                              {cert.certificateNumber && <p className="font-mono">Cert No: {cert.certificateNumber}</p>}
                              {cert.expiryDate && <p>Validity: Valid until {cert.expiryDate}</p>}
                              {cert.rejectionReason && (
                                <p className="text-[#B42318] font-medium">Rejection reason: {cert.rejectionReason}</p>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedCertForReview(cert)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#12355B] bg-white border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs transition-colors cursor-pointer self-start sm:self-center"
                          >
                            <span>Review Credential</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: INSURANCE */}
            {activeTab === 'insurance' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#1C4E80]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Worker Insurance & Social Security
                      </h4>
                    </div>
                    {getInsuranceBadge(worker.insurance.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4F6F8] p-3 rounded-xs border border-[#D5DCE3] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Plan Name</span>
                      <p className="font-semibold text-[#1F2933] mt-0.5">{worker.insurance.planName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Insurance Coverage</span>
                      <p className="font-mono font-bold text-[#12355B] text-sm mt-0.5">{worker.insurance.coverage}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Policy Number</span>
                      <p className="font-mono text-[#1F2933] mt-0.5">{worker.insurance.policyNumber || 'Pending Issuance'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Validity Status</span>
                      <p className="text-[#1F2933] mt-0.5">{worker.insurance.validUntil ? `Valid until ${worker.insurance.validUntil}` : 'Not Activated'}</p>
                    </div>
                    {worker.insurance.rejectionReason && (
                      <div className="sm:col-span-2 text-[#B42318] pt-1">
                        <strong>Rejection Reason:</strong> {worker.insurance.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsInsuranceConfirmedOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Manage Insurance Policy</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REMARKS & STATUS */}
            {activeTab === 'remarks' && (
              <div className="space-y-4">
                {/* Admin Remarks */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#12355B]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Internal Admin Remarks
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8795A5] italic">
                      Hidden from worker • Logged in Activity
                    </span>
                  </div>

                  {isEditingRemarks ? (
                    <div className="space-y-2">
                      <textarea
                        value={remarksText}
                        onChange={(e) => setRemarksText(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2 bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                        placeholder="Add internal administrative remarks..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRemarksText(worker.adminRemarks || '');
                            setIsEditingRemarks(false);
                          }}
                          className="px-3 py-1 text-xs text-[#5B6573] bg-white border border-[#D5DCE3] rounded-xs hover:bg-[#F4F6F8] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveRemarks}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs cursor-pointer shadow-xs"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Remarks</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 p-2.5 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                      <p className="text-xs text-[#1F2933] italic leading-relaxed">
                        {worker.adminRemarks || 'No internal remarks recorded for this worker.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditingRemarks(true)}
                        className="p-1 text-[#1C4E80] hover:text-[#12355B] hover:bg-white rounded-xs border border-transparent hover:border-[#BAC7D5] transition-colors cursor-pointer flex-shrink-0"
                        title="Edit remarks"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Worker Status Management */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#1C4E80]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Worker Account Status Management
                      </h4>
                    </div>
                    {getStatusBadge(worker.status)}
                  </div>

                  <p className="text-xs text-[#5B6573]">
                    Administrative controls for field access authorization. Worker daily availability is controlled directly by the worker from the GigSevak field mobile app.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {worker.status !== 'Active' && (
                      <button
                        type="button"
                        onClick={() => onRequestStatusChange(worker, 'activate')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#236327] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Activate Account
                      </button>
                    )}
                    {worker.status === 'Active' && (
                      <button
                        type="button"
                        onClick={() => onRequestStatusChange(worker, 'deactivate')}
                        className="px-3 py-1.5 text-xs font-bold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs transition-colors cursor-pointer"
                      >
                        Deactivate (Inactive)
                      </button>
                    )}
                    {worker.status !== 'Suspended' && (
                      <button
                        type="button"
                        onClick={() => onRequestStatusChange(worker, 'suspend')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#B26A00] hover:bg-[#8F5500] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Suspend Worker
                      </button>
                    )}
                    {worker.status !== 'Blocked' && (
                      <button
                        type="button"
                        onClick={() => onRequestStatusChange(worker, 'block')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Block Account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVITY LOG */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#1C4E80]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                      Official Worker Audit Trail Log
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#5B6573]">
                    Immutable Historical Records ({worker.activityLogs.length})
                  </span>
                </div>

                {worker.activityLogs.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-sm border border-[#D5DCE3] text-xs text-[#5B6573]">
                    No activity logs recorded.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {worker.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs space-y-1 hover:border-[#BAC7D5] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#12355B] uppercase">
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-[#5B6573]">
                            {log.date} • {log.time}
                          </span>
                        </div>
                        <p className="text-xs text-[#1F2933]">{log.details}</p>
                        <span className="text-[10px] text-[#5B6573] font-mono block pt-1">
                          Officer: {log.performedBy}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: PERFORMANCE & REVIEWS */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                {/* SMALL Derived Summary (Clicking counts opens Job Management filtered by Worker ID) */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#1C4E80]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Derived Operational Performance Indicators
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#5B6573] italic">
                      Click metric to view associated job work orders
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                    {/* Total Jobs */}
                    <div
                      onClick={() => {
                        onClose();
                        onNavigateToJobFiltered && onNavigateToJobFiltered(worker.id);
                      }}
                      className="p-2.5 rounded-xs bg-[#F4F6F8] border border-[#D5DCE3] hover:border-[#12355B] hover:bg-[#EAF2F8] transition-colors cursor-pointer"
                      title="View all jobs for this worker"
                    >
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Total Jobs</span>
                      <span className="text-base font-bold font-mono text-[#12355B] flex items-center justify-center gap-1">
                        {worker.totalJobs}
                        <ArrowRight className="w-3 h-3 text-[#E67E22]" />
                      </span>
                    </div>

                    {/* Completed Jobs */}
                    <div
                      onClick={() => {
                        onClose();
                        onNavigateToJobFiltered && onNavigateToJobFiltered(worker.id, 'Completed');
                      }}
                      className="p-2.5 rounded-xs bg-[#E8F5E9] border border-[#C8E6C9] hover:border-[#2E7D32] transition-colors cursor-pointer"
                      title="View completed jobs for this worker"
                    >
                      <span className="text-[10px] uppercase font-bold text-[#2E7D32] block">Completed</span>
                      <span className="text-base font-bold font-mono text-[#2E7D32] flex items-center justify-center gap-1">
                        {worker.completedJobs}
                        <ArrowRight className="w-3 h-3 text-[#2E7D32]" />
                      </span>
                    </div>

                    {/* Cancelled Jobs */}
                    <div
                      onClick={() => {
                        onClose();
                        onNavigateToJobFiltered && onNavigateToJobFiltered(worker.id, 'Cancelled');
                      }}
                      className="p-2.5 rounded-xs bg-[#FFEBEE] border border-[#FFCDD2] hover:border-[#B42318] transition-colors cursor-pointer"
                      title="View cancelled jobs for this worker"
                    >
                      <span className="text-[10px] uppercase font-bold text-[#B42318] block">Cancelled</span>
                      <span className="text-base font-bold font-mono text-[#B42318] flex items-center justify-center gap-1">
                        {worker.cancelledJobs}
                        <ArrowRight className="w-3 h-3 text-[#B42318]" />
                      </span>
                    </div>

                    {/* Average Rating */}
                    <div className="p-2.5 rounded-xs bg-[#FFF8E1] border border-[#FFE082]">
                      <span className="text-[10px] uppercase font-bold text-[#B26A00] block">Avg. Rating</span>
                      <span className="text-base font-bold font-mono text-[#B26A00]">
                        ★ {worker.averageRating}
                      </span>
                    </div>

                    {/* Complaints */}
                    <div className="p-2.5 rounded-xs bg-[#F4F6F8] border border-[#D5DCE3]">
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Complaints</span>
                      <span className="text-base font-bold font-mono text-[#1F2933]">
                        {worker.complaintsCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View-Only Citizen Ratings & Reviews */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E67E22]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Citizen Feedback & Reviews ({worker.reviews.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#5B6573] italic">
                      View-Only Record • Authenticated Citizens
                    </span>
                  </div>

                  {worker.reviews.length === 0 ? (
                    <p className="text-center py-6 text-xs text-[#8795A5] italic bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                      No citizen reviews submitted for this worker yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {worker.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-[#1F2933]">{rev.customerName}</span>
                              <span className="text-[10px] font-mono text-[#5B6573]">({rev.userId})</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#B26A00]">
                              <span>★ {rev.rating}.0</span>
                              <span className="text-[#5B6573] font-mono text-[10px]">• {rev.date}</span>
                            </div>
                          </div>

                          <p className="text-xs text-[#1F2933] leading-relaxed italic">"{rev.comment}"</p>

                          <div className="text-[10px] font-mono text-[#1C4E80]">
                            Related Job Order: {rev.jobId}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#D5DCE3] bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-[#5B6573] font-mono">
              Worker Registry Record: {worker.id} • {worker.status} • KYC: {worker.approvalStatus}
            </span>
            <div className="flex items-center gap-2">
              {worker.approvalStatus === 'Pending' && onApproveWorker && (
                <button
                  type="button"
                  onClick={() => {
                    onApproveWorker(worker);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2E7D32] hover:bg-[#1B5E20] rounded-xs shadow-xs transition-colors cursor-pointer"
                >
                  ✓ Approve Worker ID
                </button>
              )}
              {worker.approvalStatus === 'Pending' && onRejectWorker && (
                <button
                  type="button"
                  onClick={() => {
                    onRejectWorker(worker);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#B42318] bg-[#FFEBEE] hover:bg-[#FFCDD2] border border-[#FFCDD2] rounded-xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
              )}
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      <ImageLightboxModal
        isOpen={isPhotoLightboxOpen}
        imageUrl={worker.image}
        title={`${worker.name} - Official Worker Photo`}
        subtitle={`Worker ID: ${worker.id} • Trade: ${worker.category}`}
        onClose={() => setIsPhotoLightboxOpen(false)}
      />

      <WorkerEditProfileModal
        isOpen={isEditProfileOpen}
        worker={worker}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={(updatedWorker, summary) => {
          onUpdateWorker(updatedWorker, summary);
          setIsEditProfileOpen(false);
        }}
      />

      <WorkerCertReviewModal
        isOpen={!!selectedCertForReview}
        cert={selectedCertForReview}
        workerId={worker.id}
        workerName={worker.name}
        onClose={() => setSelectedCertForReview(null)}
        onVerify={(certId) => {
          onUpdateCertification(worker.id, certId, 'Verified');
          setSelectedCertForReview(null);
        }}
        onReject={(certId, reason) => {
          onUpdateCertification(worker.id, certId, 'Rejected', reason);
          setSelectedCertForReview(null);
        }}
      />

      {/* Insurance Application Confirmation Modal */}
      {isInsuranceConfirmedOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div
            className="relative bg-white rounded-sm max-w-md w-full shadow-2xl border border-[#D5DCE3] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insurance-confirmed-title"
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-xs bg-[#1C4E80] text-white flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    id="insurance-confirmed-title"
                    className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate"
                  >
                    Insurance Application Confirmed
                  </h3>
                  <p className="text-[10px] text-[#A5B9CC] font-mono">
                    Worker ID: {worker.id} • Scheme: SEC-INS-GIG
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsInsuranceConfirmedOpen(false)}
                className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer"
                aria-label="Close confirmation modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs bg-[#F4F6F8]">
              {/* Success Indicator */}
              <div className="flex items-center gap-2 p-3 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-xs font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                <span>✓ Insurance Application Confirmed</span>
              </div>

              {/* Message & Details Card */}
              <div className="bg-white p-3.5 rounded-xs border border-[#D5DCE3] space-y-2.5">
                <p className="text-xs text-[#1F2933] font-medium leading-relaxed">
                  The insurance application for worker <span className="font-bold font-mono text-[#12355B]">{worker.id}</span> has been confirmed successfully.
                </p>

                <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Worker Name</span>
                    <p className="font-semibold text-[#1F2933] truncate">{worker.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Insurance Plan</span>
                    <p className="font-semibold text-[#1F2933] truncate">{worker.insurance?.planName || 'Basic Worker Protection Plan'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Coverage Amount</span>
                    <p className="font-mono font-bold text-[#12355B]">{worker.insurance?.coverage || '₹5,00,000'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Status</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.2 rounded-xs border border-[#C8E6C9]">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInsuranceConfirmedOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
