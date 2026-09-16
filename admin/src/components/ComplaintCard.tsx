import React from 'react';
import { ComplaintItem, ComplaintStatus } from '../types';
import { Eye, Clock, AlertTriangle, CheckCircle2, XCircle, FileText, User, HardHat, Briefcase } from 'lucide-react';

interface ComplaintCardProps {
  complaint: ComplaintItem;
  onViewDetails: (complaint: ComplaintItem) => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onViewDetails,
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
    <div
      onClick={() => onViewDetails(complaint)}
      className="bg-white rounded-sm border border-[#D5DCE3] p-3.5 space-y-3 shadow-xs hover:border-[#12355B] transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-[#12355B]">{complaint.id}</span>
          {getPriorityBadge(complaint.priority)}
        </div>
        {getStatusBadge(complaint.status)}
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase text-[#5B6573]">Grievance Type:</span>
        <p className="text-xs font-bold text-[#1F2933]">{complaint.type}</p>
        <p className="text-[11px] text-[#5B6573] line-clamp-2 leading-relaxed">{complaint.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#D5DCE3]">
        <div>
          <span className="text-[9px] font-bold uppercase text-[#5B6573] block">Raised By</span>
          <div className="flex items-center gap-1 mt-0.5">
            {complaint.raisedBy.type === 'Customer' ? (
              <User className="w-3 h-3 text-[#12355B]" />
            ) : (
              <HardHat className="w-3 h-3 text-[#E67E22]" />
            )}
            <span className="font-semibold text-[#1F2933] truncate text-[11px]">{complaint.raisedBy.name}</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-[#5B6573] block">Against</span>
          <div className="flex items-center gap-1 mt-0.5">
            {complaint.against.type === 'Customer' ? (
              <User className="w-3 h-3 text-[#12355B]" />
            ) : (
              <HardHat className="w-3 h-3 text-[#E67E22]" />
            )}
            <span className="font-semibold text-[#1F2933] truncate text-[11px]">{complaint.against.name}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 font-mono text-[#1C4E80]">
          <Briefcase className="w-3 h-3" />
          <span>{complaint.jobId}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(complaint);
          }}
          className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
          title="View dispute dossier"
        >
          <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};
