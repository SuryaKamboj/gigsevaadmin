import React from 'react';
import { WorkerItem, WorkerAccountStatus, WorkerApprovalStatus, JobItem } from '../types';
import {
  Eye,
  Phone,
  MapPin,
  HardHat,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

interface WorkerCardProps {
  worker: WorkerItem;
  jobs: JobItem[];
  onViewDetails: (worker: WorkerItem) => void;
  onApprove?: (worker: WorkerItem) => void;
  onReject?: (worker: WorkerItem) => void;
  onNavigateToJobs?: (workerId: string) => void;
  isApprovalView?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  jobs,
  onViewDetails,
  onApprove,
  onReject,
  onNavigateToJobs,
  isApprovalView = false,
}) => {
  const getStatusBadge = (status: WorkerAccountStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6573]">
            <Clock className="w-3.5 h-3.5 text-[#5B6573] flex-shrink-0" />
            Inactive
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            Suspended
          </span>
        );
      case 'Blocked':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            Blocked
          </span>
        );
    }
  };

  const getApprovalBadge = (approval: WorkerApprovalStatus) => {
    switch (approval) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <Clock className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <XCircle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            Rejected
          </span>
        );
    }
  };

  const totalBookings = jobs.filter((j) => j.worker.workerId.toLowerCase() === worker.id.toLowerCase()).length;

  return (
    <div
      onClick={() => onViewDetails(worker)}
      className="bg-white rounded-sm border border-[#D5DCE3] p-3.5 space-y-3 shadow-xs hover:border-[#12355B] transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-[#12355B]">{worker.id}</span>
          <span className="text-[10px] font-semibold text-[#5B6573]">
            {worker.yearsOfExperience} yrs exp
          </span>
        </div>
        {isApprovalView ? getApprovalBadge(worker.approvalStatus) : getStatusBadge(worker.status)}
      </div>

      <div className="flex items-center gap-3">
        <img
          src={
            worker.image && (worker.image.startsWith('http') || worker.image.startsWith('data:'))
              ? worker.image
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          }
          alt={worker.name}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
          }}
          className="w-12 h-12 rounded-sm object-cover border border-[#BAC7D5] flex-shrink-0"
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[#1F2933] truncate">{worker.name}</h4>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#5B6573]">
            <Phone className="w-3 h-3 text-[#5B6573]" />
            <span>{worker.phone}</span>
          </div>
          <span className="text-[10px] font-semibold text-[#12355B]">{worker.category}</span>
        </div>
      </div>

      <div className="space-y-1 text-[11px] text-[#5B6573]">
        <div className="flex items-center gap-1.5">
          <HardHat className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
          <span className="truncate">Skills: {worker.skills.join(', ')}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#5B6573] flex-shrink-0 mt-0.5" />
          <p className="truncate text-[#5B6573]">{worker.serviceArea}</p>
        </div>
      </div>

      {/* Total Bookings Row */}
      <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-between text-xs">
        <span className="text-[10px] font-bold uppercase text-[#5B6573] flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-[#12355B]" />
          Total Bookings:
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToJobs && onNavigateToJobs(worker.id);
          }}
          className="group inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-mono font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
          title={`View all jobs for ${worker.name}`}
        >
          <span>{totalBookings} {totalBookings === 1 ? 'Job' : 'Jobs'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E67E22] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
      </div>

      {/* Profile Completion Bar */}
      <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-[#5B6573]">Completion:</span>
          <span className="font-mono font-bold text-xs text-[#1F2933]">{worker.profileCompletion}%</span>
        </div>

        {isApprovalView && worker.approvalStatus === 'Pending' ? (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onApprove && onApprove(worker)}
              className="px-2.5 py-1 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#236327] rounded-xs shadow-xs"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => onReject && onReject(worker)}
              className="px-2.5 py-1 text-xs font-bold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs shadow-xs"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(worker);
            }}
            className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
            title="View worker profile dossier"
          >
            <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
            <span>View</span>
          </button>
        )}
      </div>
    </div>
  );
};
