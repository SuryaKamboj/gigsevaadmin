import React from 'react';
import { JobItem, JobStatus } from '../types';
import { Eye, CheckCircle2, AlertTriangle, Clock3, XCircle } from 'lucide-react';

interface JobTableProps {
  jobs: JobItem[];
  onViewDetails: (job: JobItem) => void;
}

export const JobTable: React.FC<JobTableProps> = ({ jobs, onViewDetails }) => {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="py-2.5 px-3">Job ID</th>
            <th className="py-2.5 px-3">Customer</th>
            <th className="py-2.5 px-3">Worker</th>
            <th className="py-2.5 px-3">Service</th>
            <th className="py-2.5 px-3">Date & Time</th>
            <th className="py-2.5 px-3">Location</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {jobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => onViewDetails(job)}
              className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
            >
              {/* Job ID */}
              <td className="py-3 px-3">
                <span className="font-mono font-bold text-[#12355B] text-xs">
                  {job.id}
                </span>
                <span className="block text-[10px] font-mono text-[#5B6573]">
                  {job.payment.amount}
                </span>
              </td>

              {/* Customer */}
              <td className="py-3 px-3">
                <div className="font-semibold text-[#1F2933]">{job.customer.name}</div>
                <div className="text-[10px] font-mono text-[#5B6573]">
                  {job.customer.userId} • {job.customer.phone}
                </div>
              </td>

              {/* Worker */}
              <td className="py-3 px-3">
                <div className="font-semibold text-[#1F2933]">{job.worker.name}</div>
                <div className="text-[10px] font-mono text-[#5B6573]">
                  {job.worker.workerId} • {job.worker.category}
                </div>
              </td>

              {/* Service */}
              <td className="py-3 px-3">
                <span className="font-medium text-[#1F2933] block max-w-[160px] truncate" title={job.service}>
                  {job.service}
                </span>
                <span className="text-[10px] text-[#5B6573]">
                  {job.serviceCategory}
                </span>
              </td>

              {/* Date & Time */}
              <td className="py-3 px-3 whitespace-nowrap">
                <span className="font-medium text-[#1F2933] block">
                  {job.scheduledDate}
                </span>
                <span className="text-[10px] text-[#5B6573]">
                  {job.scheduledTime}
                </span>
              </td>

              {/* Location */}
              <td className="py-3 px-3 max-w-[150px]">
                <p className="text-[11px] text-[#5B6573] truncate" title={job.location}>
                  {job.location}
                </p>
              </td>

              {/* Status */}
              <td className="py-3 px-3 whitespace-nowrap">
                {getStatusBadge(job.status)}
              </td>

              {/* View Action */}
              <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onViewDetails(job)}
                  className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                  title="View job work-order dossier"
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
  );
};
