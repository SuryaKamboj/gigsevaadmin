import React from 'react';
import { ComplaintItem, ComplaintStatus } from '../types';
import { Eye, Clock, AlertTriangle, CheckCircle2, XCircle, FileText, ArrowRight, User, HardHat } from 'lucide-react';

interface ComplaintTableProps {
  complaints: ComplaintItem[];
  onViewDetails: (complaint: ComplaintItem) => void;
  onNavigateToJob?: (jobId: string) => void;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToWorker?: (workerId: string) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  onViewDetails,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
}) => {
  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <Clock className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            Pending
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C4E80]">
            <FileText className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
            Under Review
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            Escalated
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
            Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6573]">
            <XCircle className="w-3.5 h-3.5 text-[#5B6573] flex-shrink-0" />
            Rejected
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#B42318] text-white rounded-xs">Critical</span>;
      case 'High':
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#FFF0ED] text-[#B42318] border border-[#FFCDD2] rounded-xs">High</span>;
      case 'Medium':
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082] rounded-xs">Medium</span>;
      default:
        return <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3] rounded-xs">Low</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="py-2.5 px-3">Complaint ID</th>
            <th className="py-2.5 px-3">Job ID</th>
            <th className="py-2.5 px-3">Raised By</th>
            <th className="py-2.5 px-3">Against</th>
            <th className="py-2.5 px-3">Type</th>
            <th className="py-2.5 px-3">Date & Time</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-right">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {complaints.map((complaint) => (
            <tr
              key={complaint.id}
              onClick={() => onViewDetails(complaint)}
              className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
            >
              {/* Complaint ID */}
              <td className="py-3 px-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#12355B] text-xs">
                    {complaint.id}
                  </span>
                  {getPriorityBadge(complaint.priority)}
                </div>
              </td>

              {/* Job ID */}
              <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onNavigateToJob && onNavigateToJob(complaint.jobId)}
                  className="font-mono font-bold text-xs text-[#1C4E80] hover:text-[#12355B] hover:underline flex items-center gap-1 cursor-pointer"
                  title={`View job ${complaint.jobId} in Job Management`}
                >
                  <span>{complaint.jobId}</span>
                  <ArrowRight className="w-3 h-3 text-[#E67E22]" />
                </button>
              </td>

              {/* Raised By */}
              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  {complaint.raisedBy.type === 'Customer' ? (
                    <User className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                  ) : (
                    <HardHat className="w-3.5 h-3.5 text-[#E67E22] flex-shrink-0" />
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (complaint.raisedBy.type === 'Customer') {
                          onNavigateToUser && onNavigateToUser(complaint.raisedBy.id);
                        } else {
                          onNavigateToWorker && onNavigateToWorker(complaint.raisedBy.id);
                        }
                      }}
                      className="font-semibold text-[#1F2933] hover:text-[#12355B] hover:underline text-left cursor-pointer block"
                    >
                      {complaint.raisedBy.name}
                    </button>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      {complaint.raisedBy.type} ({complaint.raisedBy.id})
                    </span>
                  </div>
                </div>
              </td>

              {/* Against */}
              <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  {complaint.against.type === 'Customer' ? (
                    <User className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                  ) : (
                    <HardHat className="w-3.5 h-3.5 text-[#E67E22] flex-shrink-0" />
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (complaint.against.type === 'Customer') {
                          onNavigateToUser && onNavigateToUser(complaint.against.id);
                        } else {
                          onNavigateToWorker && onNavigateToWorker(complaint.against.id);
                        }
                      }}
                      className="font-semibold text-[#1F2933] hover:text-[#12355B] hover:underline text-left cursor-pointer block"
                    >
                      {complaint.against.name}
                    </button>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      {complaint.against.type} ({complaint.against.id})
                    </span>
                  </div>
                </div>
              </td>

              {/* Type */}
              <td className="py-3 px-3 max-w-[180px]">
                <span className="font-semibold text-[#12355B] block truncate" title={complaint.type}>
                  {complaint.type}
                </span>
                <p className="text-[10px] text-[#5B6573] truncate" title={complaint.description}>
                  {complaint.description}
                </p>
              </td>

              {/* Date & Time */}
              <td className="py-3 px-3 whitespace-nowrap">
                <span className="text-xs text-[#1F2933] block">{complaint.createdDate}</span>
                <span className="text-[10px] font-mono text-[#5B6573]">{complaint.createdTime}</span>
              </td>

              {/* Status */}
              <td className="py-3 px-3 whitespace-nowrap">
                {getStatusBadge(complaint.status)}
              </td>

              {/* View Action */}
              <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onViewDetails(complaint)}
                  className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                  title="View Dispute Dossier & Adjudication"
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
