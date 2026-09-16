import React from 'react';
import { WorkerItem, WorkerAccountStatus, WorkerApprovalStatus, JobItem } from '../types';
import {
  Eye,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

interface WorkerTableProps {
  workers: WorkerItem[];
  jobs: JobItem[];
  onViewDetails: (worker: WorkerItem) => void;
  onApprove?: (worker: WorkerItem) => void;
  onReject?: (worker: WorkerItem) => void;
  onNavigateToJobs?: (workerId: string) => void;
  isApprovalView?: boolean;
}

export const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
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

  const getWorkerJobCount = (workerId: string) => {
    return jobs.filter((j) => j.worker.workerId.toLowerCase() === workerId.toLowerCase()).length;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="py-2.5 px-3">Worker ID</th>
            <th className="py-2.5 px-3 text-center">Profile</th>
            <th className="py-2.5 px-3">Name & Mobile</th>
            <th className="py-2.5 px-3">Primary Category & Skills</th>
            <th className="py-2.5 px-3">Service Area</th>
            <th className="py-2.5 px-3 text-center">Total Bookings</th>
            <th className="py-2.5 px-3 text-center">Profile Completion</th>
            <th className="py-2.5 px-3">{isApprovalView ? 'Approval Status' : 'Account Status'}</th>
            <th className="py-2.5 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {workers.map((worker) => (
            <tr
              key={worker.id}
              onClick={() => onViewDetails(worker)}
              className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
            >
              {/* Worker ID */}
              <td className="py-3 px-3">
                <span className="font-mono font-bold text-[#12355B] text-xs block">
                  {worker.id}
                </span>
                <span className="text-[10px] text-[#5B6573]">
                  {worker.yearsOfExperience} yrs exp
                </span>
              </td>

              {/* Profile Image */}
              <td className="py-3 px-3 text-center">
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-9 h-9 rounded-sm object-cover border border-[#BAC7D5] mx-auto"
                />
              </td>

              {/* Name & Phone */}
              <td className="py-3 px-3">
                <div className="font-semibold text-[#1F2933]">{worker.name}</div>
                <div className="text-[10px] font-mono text-[#5B6573]">{worker.phone}</div>
                {worker.aadhaarNumberMasked && (
                  <div className="text-[10px] font-mono text-[#2E7D32] font-semibold mt-0.5">
                    Aadhaar: {worker.aadhaarNumberMasked}
                  </div>
                )}
              </td>

              {/* Category & Skills */}
              <td className="py-3 px-3">
                <span className="font-semibold text-[#12355B] block">{worker.category}</span>
                <div className="text-[10px] text-[#5B6573] truncate max-w-[200px]" title={worker.skills.join(', ')}>
                  {worker.skills.slice(0, 2).join(', ')}
                  {worker.skills.length > 2 && ` +${worker.skills.length - 2}`}
                </div>
              </td>

              {/* Service Area */}
              <td className="py-3 px-3 max-w-[160px]">
                <p className="text-[11px] text-[#1F2933] truncate" title={worker.serviceArea}>
                  {worker.serviceArea}
                </p>
                <span className="text-[10px] text-[#5B6573] truncate block">
                  {typeof worker.location === 'string'
                    ? worker.location
                    : (typeof (worker.location as any) === 'object' && worker.location
                        ? [(worker.location as any).currentAddress, (worker.location as any).city].filter(Boolean).join(', ')
                        : 'Not provided')}
                </span>
              </td>

              {/* Total Bookings (Inline text-first clickable element) */}
              <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onNavigateToJobs && onNavigateToJobs(worker.id)}
                  className="group inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-mono font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                  title={`View all jobs assigned to worker ${worker.id} in Job Management`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#12355B] group-hover:text-[#1C4E80] transition-colors flex-shrink-0" />
                  <span>{getWorkerJobCount(worker.id)} {getWorkerJobCount(worker.id) === 1 ? 'Job' : 'Jobs'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E67E22] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
              </td>

              {/* Profile Completion */}
              <td className="py-3 px-3 text-center">
                <div className="inline-flex flex-col items-center">
                  <span className="font-mono font-bold text-xs text-[#1F2933]">
                    {worker.profileCompletion}%
                  </span>
                  <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-xs overflow-hidden mt-0.5">
                    <div
                      className={`h-full ${
                        worker.profileCompletion >= 90
                          ? 'bg-[#2E7D32]'
                          : worker.profileCompletion >= 70
                          ? 'bg-[#1C4E80]'
                          : 'bg-[#B26A00]'
                      }`}
                      style={{ width: `${worker.profileCompletion}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Status Column */}
              <td className="py-3 px-3 whitespace-nowrap">
                {isApprovalView ? getApprovalBadge(worker.approvalStatus) : getStatusBadge(worker.status)}
              </td>

              {/* Action Buttons */}
              <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {isApprovalView && worker.approvalStatus === 'Pending' ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onApprove && onApprove(worker)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-[#2E7D32] hover:bg-[#236327] rounded-xs transition-colors cursor-pointer shadow-xs"
                      title="Approve worker onboarding"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject && onReject(worker)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs transition-colors cursor-pointer shadow-xs"
                      title="Reject worker onboarding"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onViewDetails(worker)}
                    className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                    title="View worker profile dossier"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                    <span>View</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
