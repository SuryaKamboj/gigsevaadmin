import React from 'react';
import { JobItem, JobStatus } from '../types';
import { Eye, Calendar, MapPin, User, HardHat, CheckCircle2, AlertTriangle, Clock3, XCircle } from 'lucide-react';

interface JobCardProps {
  job: JobItem;
  onViewDetails: (job: JobItem) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
            Completed
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C4E80]">
            <Clock3 className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <XCircle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-sm border border-[#D5DCE3] p-3.5 space-y-3 shadow-xs hover:border-[#12355B] transition-colors cursor-pointer"
    >
      {/* Top row: ID, Category & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-[#12355B]">{job.id}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#F4F6F8] text-[#5B6573] rounded-xs border border-[#D5DCE3]">
            {job.serviceCategory}
          </span>
        </div>
        {getStatusBadge(job.status)}
      </div>

      {/* Service Title */}
      <div>
        <h4 className="text-xs font-bold text-[#1F2933]">{job.service}</h4>
        <span className="text-xs font-bold font-mono text-[#12355B]">{job.payment.amount}</span>
      </div>

      {/* Customer & Worker Info */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F4F6F8] p-2 rounded-xs border border-[#D5DCE3]">
        <div>
          <div className="flex items-center gap-1 text-[#5B6573] font-bold text-[10px] uppercase">
            <User className="w-3 h-3" />
            <span>Customer</span>
          </div>
          <p className="font-semibold text-[#1F2933] truncate">{job.customer.name}</p>
          <p className="text-[10px] font-mono text-[#5B6573]">{job.customer.userId}</p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-[#5B6573] font-bold text-[10px] uppercase">
            <HardHat className="w-3 h-3" />
            <span>Worker</span>
          </div>
          <p className="font-semibold text-[#1F2933] truncate">{job.worker.name}</p>
          <p className="text-[10px] font-mono text-[#5B6573]">{job.worker.workerId}</p>
        </div>
      </div>

      {/* Schedule & Location */}
      <div className="space-y-1 text-[11px] text-[#5B6573]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
          <span className="truncate">{job.scheduledDate} • {job.scheduledTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(job);
          }}
          className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
          title="View job work-order dossier"
        >
          <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};
