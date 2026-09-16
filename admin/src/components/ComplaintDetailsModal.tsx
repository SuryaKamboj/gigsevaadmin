import React, { useState } from 'react';
import {
  ComplaintItem,
  ComplaintStatus,
  ComplaintDecisionType,
  ComplaintActionType,
  ComplaintInvestigationRemark,
  ComplaintAdminDecision,
  ComplaintRefundAction,
  ComplaintPenaltyAction,
  ComplaintResolution,
} from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileText,
  User,
  HardHat,
  Briefcase,
  ExternalLink,
  Camera,
  Layers,
  Send,
  Save,
  Check,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

interface ComplaintDetailsModalProps {
  isOpen: boolean;
  complaint: ComplaintItem | null;
  onClose: () => void;
  onUpdateComplaint: (updated: ComplaintItem) => void;
  onNavigateToJob?: (jobId: string, complaintId?: string) => void;
  onNavigateToUser?: (userId: string, complaintId?: string) => void;
  onNavigateToWorker?: (workerId: string, complaintId?: string) => void;
  onNavigateToPayment?: (transactionId: string, complaintId?: string) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onUpdateComplaint,
  onNavigateToJob,
  onNavigateToUser,
  onNavigateToWorker,
  onNavigateToPayment,
}) => {
  // Lightbox state for evidence preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Investigation Remark Input
  const [newRemarkText, setNewRemarkText] = useState('');
  const [remarkError, setRemarkError] = useState('');

  // Decision Form State
  const [decisionType, setDecisionType] = useState<ComplaintDecisionType | ''>('');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionError, setDecisionError] = useState('');

  // Action Form State
  const [actionType, setActionType] = useState<ComplaintActionType | ''>('');
  const [refundType, setRefundType] = useState<'Full Refund' | 'Partial Refund' | 'No Refund'>('No Refund');
  const [refundAmountInput, setRefundAmountInput] = useState<number | ''>('');
  const [refundReasonInput, setRefundReasonInput] = useState('');

  const [workerPenaltyType, setWorkerPenaltyType] = useState<'Warning' | 'Monetary Penalty' | 'Suspension'>('Warning');
  const [workerPenaltyAmount, setWorkerPenaltyAmount] = useState<number | ''>('');
  const [workerSuspensionDuration, setWorkerSuspensionDuration] = useState('7 Days');
  const [workerPenaltyReason, setWorkerPenaltyReason] = useState('');

  const [customerPenaltyType, setCustomerPenaltyType] = useState<'Warning' | 'Monetary Penalty' | 'Suspension'>('Warning');
  const [customerPenaltyAmount, setCustomerPenaltyAmount] = useState<number | ''>('');
  const [customerSuspensionDuration, setCustomerSuspensionDuration] = useState('7 Days');
  const [customerPenaltyReason, setCustomerPenaltyReason] = useState('');

  const [resolutionRemarksInput, setResolutionRemarksInput] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  if (!isOpen || !complaint) return null;

  const getFormattedNow = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { dateStr, timeStr };
  };

  const handleAddRemark = () => {
    if (!newRemarkText.trim()) {
      setRemarkError('Please enter an administrative investigation remark.');
      return;
    }
    const { dateStr, timeStr } = getFormattedNow();
    const remark: ComplaintInvestigationRemark = {
      id: `rem-${Date.now()}`,
      officer: 'Administrative Officer (Disputes Cell)',
      date: dateStr,
      time: timeStr,
      remark: newRemarkText.trim(),
    };

    const updatedTimeline = [
      ...complaint.timeline,
      {
        id: `ct-${Date.now()}`,
        event: 'Investigation Note Added',
        date: dateStr,
        time: timeStr,
        officer: 'Administrative Officer',
        details: newRemarkText.trim().slice(0, 80) + (newRemarkText.length > 80 ? '...' : ''),
      },
    ];

    const updated: ComplaintItem = {
      ...complaint,
      investigationRemarks: [...complaint.investigationRemarks, remark],
      timeline: updatedTimeline,
    };

    onUpdateComplaint(updated);
    setNewRemarkText('');
    setRemarkError('');
  };

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    if (newStatus === complaint.status) return;
    const { dateStr, timeStr } = getFormattedNow();

    const updatedTimeline = [
      ...complaint.timeline,
      {
        id: `ct-${Date.now()}`,
        event: `Complaint Status Updated: ${newStatus}`,
        date: dateStr,
        time: timeStr,
        officer: 'Administrative Officer',
        details: `Dispute workflow status updated from ${complaint.status} to ${newStatus}.`,
      },
    ];

    const updated: ComplaintItem = {
      ...complaint,
      status: newStatus,
      timeline: updatedTimeline,
    };

    onUpdateComplaint(updated);
  };

  const handleSaveDecision = () => {
    if (!decisionType) {
      setDecisionError('Please select a valid administrative decision.');
      return;
    }
    if (!decisionReason.trim()) {
      setDecisionError('Mandatory administrative reasoning is required for recording decision.');
      return;
    }

    const { dateStr, timeStr } = getFormattedNow();
    const decision: ComplaintAdminDecision = {
      decision: decisionType,
      reason: decisionReason.trim(),
      officer: 'Senior Dispute Adjudicator',
      date: dateStr,
      time: timeStr,
    };

    const updatedTimeline = [
      ...complaint.timeline,
      {
        id: `ct-${Date.now()}`,
        event: 'Admin Decision Recorded',
        date: dateStr,
        time: timeStr,
        officer: 'Senior Dispute Adjudicator',
        details: `Decision: ${decisionType} - ${decisionReason.trim().slice(0, 60)}...`,
      },
    ];

    const updated: ComplaintItem = {
      ...complaint,
      decision,
      status: 'Under Review',
      timeline: updatedTimeline,
    };

    onUpdateComplaint(updated);
    setDecisionError('');
    setActionSuccessMsg('Official Administrative Decision recorded successfully.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleApplyActionAndResolve = () => {
    if (!actionType) {
      setActionError('Please select an administrative action to apply.');
      return;
    }

    const { dateStr, timeStr } = getFormattedNow();
    let refundAction: ComplaintRefundAction | undefined = undefined;
    let workerPenaltyAction: ComplaintPenaltyAction | undefined = undefined;
    let customerPenaltyAction: ComplaintPenaltyAction | undefined = undefined;

    const originalAmount = 1000; // Reference baseline amount from job/transaction

    if (actionType === 'Refund') {
      if (refundType === 'Partial Refund') {
        if (!refundAmountInput || Number(refundAmountInput) <= 0) {
          setActionError('Please enter a valid partial refund amount (₹).');
          return;
        }
        if (!refundReasonInput.trim()) {
          setActionError('Please specify the refund justification.');
          return;
        }
        refundAction = {
          type: 'Partial Refund',
          refundAmount: Number(refundAmountInput),
          reason: refundReasonInput.trim(),
          originalAmount,
          transactionId: complaint.transactionId || 'TXN-4001',
          refundId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        };
      } else if (refundType === 'Full Refund') {
        refundAction = {
          type: 'Full Refund',
          refundAmount: originalAmount,
          reason: '100% full refund awarded by dispute adjudication cell.',
          originalAmount,
          transactionId: complaint.transactionId || 'TXN-4001',
          refundId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        };
      }
    } else if (actionType === 'Worker Penalty') {
      if (workerPenaltyType === 'Monetary Penalty') {
        if (!workerPenaltyAmount || Number(workerPenaltyAmount) <= 0) {
          setActionError('Please specify monetary penalty amount (₹).');
          return;
        }
        if (!workerPenaltyReason.trim()) {
          setActionError('Please state the penalty reason.');
          return;
        }
        workerPenaltyAction = {
          type: 'Monetary Penalty',
          penaltyAmount: Number(workerPenaltyAmount),
          reason: workerPenaltyReason.trim(),
        };
      } else if (workerPenaltyType === 'Suspension') {
        if (!workerPenaltyReason.trim()) {
          setActionError('Please state the suspension justification.');
          return;
        }
        workerPenaltyAction = {
          type: 'Suspension',
          suspensionDuration: workerSuspensionDuration,
          reason: workerPenaltyReason.trim(),
        };
      } else {
        workerPenaltyAction = {
          type: 'Warning',
          reason: workerPenaltyReason.trim() || 'Formal warning issued for service breach.',
        };
      }
    } else if (actionType === 'Customer Penalty') {
      if (customerPenaltyType === 'Monetary Penalty') {
        if (!customerPenaltyAmount || Number(customerPenaltyAmount) <= 0) {
          setActionError('Please specify penalty amount (₹).');
          return;
        }
        if (!customerPenaltyReason.trim()) {
          setActionError('Please state reason.');
          return;
        }
        customerPenaltyAction = {
          type: 'Monetary Penalty',
          penaltyAmount: Number(customerPenaltyAmount),
          reason: customerPenaltyReason.trim(),
        };
      } else if (customerPenaltyType === 'Suspension') {
        if (!customerPenaltyReason.trim()) {
          setActionError('Please state reason.');
          return;
        }
        customerPenaltyAction = {
          type: 'Suspension',
          suspensionDuration: customerSuspensionDuration,
          reason: customerPenaltyReason.trim(),
        };
      } else {
        customerPenaltyAction = {
          type: 'Warning',
          reason: customerPenaltyReason.trim() || 'Warning notice issued regarding platform policy.',
        };
      }
    }

    const currentDecisionType = complaint.decision?.decision || 'Complaint Valid';

    const resolution: ComplaintResolution = {
      finalDecision: currentDecisionType,
      actionTaken: actionType,
      refundAmount: refundAction?.refundAmount,
      penaltyAmount: workerPenaltyAction?.penaltyAmount || customerPenaltyAction?.penaltyAmount,
      suspensionDuration: workerPenaltyAction?.suspensionDuration || customerPenaltyAction?.suspensionDuration,
      resolutionRemarks:
        resolutionRemarksInput.trim() ||
        `Action ${actionType} implemented pursuant to official adjudication award.`,
      resolvedBy: 'Senior Dispute Adjudicator',
      resolvedDate: dateStr,
      resolvedTime: timeStr,
    };

    const newTimelineEvents = [
      ...complaint.timeline,
      {
        id: `ct-${Date.now()}-1`,
        event: `Administrative Action Initiated: ${actionType}`,
        date: dateStr,
        time: timeStr,
        officer: 'Senior Dispute Adjudicator',
        details: `Action applied: ${actionType}. ${
          refundAction ? `Refund ID: ${refundAction.refundId} (₹${refundAction.refundAmount})` : ''
        }`,
      },
      {
        id: `ct-${Date.now()}-2`,
        event: 'Complaint Resolved',
        date: dateStr,
        time: timeStr,
        officer: 'Senior Dispute Adjudicator',
        details: `Dispute ${complaint.id} formally resolved and closed in register.`,
      },
    ];

    const updated: ComplaintItem = {
      ...complaint,
      status: 'Resolved',
      refundAction,
      workerPenaltyAction,
      customerPenaltyAction,
      resolution,
      timeline: newTimelineEvents,
    };

    onUpdateComplaint(updated);
    setActionError('');
    setActionSuccessMsg('Action applied and dispute case marked as Resolved.');
  };

  const getStatusHeaderBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082] rounded-xs">Pending Review</span>;
      case 'Under Review':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5] rounded-xs">Under Investigation</span>;
      case 'Escalated':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2] rounded-xs">Escalated</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-xs">Resolved & Closed</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3] rounded-xs">Rejected</span>;
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
          {/* Official Modal Header */}
          <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                    Dispute & Grievance Case Dossier
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                    {complaint.id}
                  </span>
                </div>
                <p className="text-[10px] text-[#A5B9CC]">
                  Departmental Adjudication, Evidence Review & Financial Settlement Record
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStatusHeaderBadge(complaint.status)}
              <button
                onClick={onClose}
                className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-[#F4F6F8]">
            {actionSuccessMsg && (
              <div className="p-3 rounded-xs bg-[#E8F5E9] border border-[#C8E6C9] text-xs font-semibold text-[#2E7D32] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Status Workflow Ribbon */}
            <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Investigation Workflow Status</span>
                <p className="text-xs font-bold text-[#1F2933] mt-0.5">
                  Current: <span className="text-[#12355B]">{complaint.status}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#5B6573] mr-1">Move to:</span>
                {complaint.status !== 'Under Review' && complaint.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Under Review')}
                    className="px-2.5 py-1 text-xs font-bold text-[#1C4E80] bg-[#EAF2F8] hover:bg-[#1C4E80] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer"
                  >
                    Under Review
                  </button>
                )}
                {complaint.status !== 'Escalated' && complaint.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Escalated')}
                    className="px-2.5 py-1 text-xs font-bold text-[#B42318] bg-[#FFEBEE] hover:bg-[#B42318] hover:text-white border border-[#FFCDD2] rounded-xs transition-colors cursor-pointer"
                  >
                    Escalate
                  </button>
                )}
                {complaint.status !== 'Rejected' && complaint.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Rejected')}
                    className="px-2.5 py-1 text-xs font-bold text-[#5B6573] bg-[#F4F6F8] hover:bg-[#5B6573] hover:text-white border border-[#D5DCE3] rounded-xs transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 1: COMPLAINT INFORMATION (View-Only) */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    1. Grievance Registration Details (View-Only)
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] italic">Citizen / Partner Registered Entry</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F4F6F8] p-3 rounded-xs border border-[#D5DCE3]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Complaint ID</span>
                  <span className="font-mono font-bold text-[#12355B]">{complaint.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Grievance Category</span>
                  <span className="font-bold text-[#1F2933]">{complaint.type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Adjudication Priority</span>
                  <span className="font-bold text-[#B42318]">{complaint.priority}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Logged Date & Time</span>
                  <span className="font-mono text-[#1F2933]">{complaint.createdDate} • {complaint.createdTime}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block mb-1">Original Statement of Complaint</span>
                <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] text-xs text-[#1F2933] leading-relaxed select-text">
                  {complaint.description}
                </div>
              </div>
            </div>

            {/* SECTIONS 2 & 3: RAISED BY & AGAINST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SECTION 2: RAISED BY */}
              <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                  <div className="flex items-center gap-1.5">
                    {complaint.raisedBy.type === 'Customer' ? (
                      <User className="w-4 h-4 text-[#12355B]" />
                    ) : (
                      <HardHat className="w-4 h-4 text-[#E67E22]" />
                    )}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                      2. Raised By ({complaint.raisedBy.type})
                    </h4>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-[#1F2933]">{complaint.raisedBy.name}</div>
                  <div className="font-mono text-[#12355B] font-semibold">{complaint.raisedBy.id}</div>
                  <div className="font-mono text-[#5B6573]">{complaint.raisedBy.phone}</div>
                </div>

                <div className="pt-2 border-t border-[#D5DCE3]">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (complaint.raisedBy.type === 'Customer') {
                        onNavigateToUser && onNavigateToUser(complaint.raisedBy.id, complaint.id);
                      } else {
                        onNavigateToWorker && onNavigateToWorker(complaint.raisedBy.id, complaint.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] hover:bg-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer w-full justify-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View {complaint.raisedBy.type} Profile</span>
                  </button>
                </div>
              </div>

              {/* SECTION 3: AGAINST */}
              <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                  <div className="flex items-center gap-1.5">
                    {complaint.against.type === 'Customer' ? (
                      <User className="w-4 h-4 text-[#12355B]" />
                    ) : (
                      <HardHat className="w-4 h-4 text-[#E67E22]" />
                    )}
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#B42318]">
                      3. Respondent Party ({complaint.against.type})
                    </h4>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-[#1F2933]">{complaint.against.name}</div>
                  <div className="font-mono text-[#12355B] font-semibold">{complaint.against.id}</div>
                  <div className="font-mono text-[#5B6573]">{complaint.against.phone}</div>
                </div>

                <div className="pt-2 border-t border-[#D5DCE3]">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (complaint.against.type === 'Customer') {
                        onNavigateToUser && onNavigateToUser(complaint.against.id, complaint.id);
                      } else {
                        onNavigateToWorker && onNavigateToWorker(complaint.against.id, complaint.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] hover:bg-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer w-full justify-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View {complaint.against.type} Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: RELATED JOB */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    4. Associated Job Work Order ({complaint.jobId})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToJob && onNavigateToJob(complaint.jobId, complaint.id);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1C4E80] hover:text-[#12355B] hover:underline cursor-pointer"
                >
                  <span>Open in Job Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F4F6F8] p-3 rounded-xs border border-[#D5DCE3]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Service</span>
                  <p className="font-bold text-[#1F2933] mt-0.5">{complaint.relatedJob.service}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Scheduled Window</span>
                  <p className="font-mono text-[#1F2933] mt-0.5">
                    {complaint.relatedJob.scheduledDate} • {complaint.relatedJob.scheduledTime}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Work Order Status</span>
                  <p className="font-bold text-[#12355B] mt-0.5">{complaint.relatedJob.jobStatus}</p>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Job Location</span>
                  <p className="text-[#5B6573] mt-0.5">{complaint.relatedJob.location}</p>
                </div>
              </div>
            </div>

            {/* SECTION 5: EVIDENCE (View-Only Gallery with Lightbox) */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    5. Evidentiary Submissions ({complaint.evidence.length})
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] italic">Immutable View-Only Records</span>
              </div>

              {complaint.evidence.length === 0 ? (
                <div className="p-6 text-center bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] text-xs text-[#5B6573]">
                  <Layers className="w-6 h-6 mx-auto text-[#BAC7D5] mb-1" />
                  <p className="font-semibold text-[#1F2933]">No evidence submitted.</p>
                  <p className="text-[11px] text-[#5B6573] mt-0.5">
                    Parties have not attached photographic or documentary exhibits for this grievance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {complaint.evidence.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxImage(item.url)}
                      className="group bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] p-2 hover:border-[#12355B] transition-colors cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-xs overflow-hidden bg-black/5 border border-[#BAC7D5]">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                          Click to Enlarge Exhibit
                        </span>
                      </div>
                      <div className="pt-2 space-y-0.5">
                        <span className="font-bold text-[11px] text-[#1F2933] block truncate">{item.title}</span>
                        <p className="text-[10px] text-[#5B6573] truncate">By {item.uploadedBy}</p>
                        {item.description && (
                          <p className="text-[10px] text-[#1F2933] italic line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 6: INVESTIGATION (Internal Remarks & Log) */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    6. Internal Investigation Remarks Log
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] italic">Internal Departmental Notes</span>
              </div>

              {/* Historical Remarks */}
              {complaint.investigationRemarks.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {complaint.investigationRemarks.map((rem) => (
                    <div key={rem.id} className="p-2.5 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#12355B]">{rem.officer}</span>
                        <span className="font-mono text-[#5B6573]">{rem.date} • {rem.time}</span>
                      </div>
                      <p className="text-xs text-[#1F2933] leading-relaxed">{rem.remark}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Remark */}
              <div className="pt-2 border-t border-[#D5DCE3] space-y-2">
                <label className="text-[10px] font-bold uppercase text-[#5B6573] block">
                  Add Administrative Finding / Investigation Note:
                </label>
                <textarea
                  value={newRemarkText}
                  onChange={(e) => {
                    setNewRemarkText(e.target.value);
                    if (remarkError) setRemarkError('');
                  }}
                  rows={2}
                  placeholder="Record verification notes, telephonic statements, or on-site supervisor findings..."
                  className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                />
                {remarkError && <p className="text-[11px] text-[#B42318] font-semibold">{remarkError}</p>}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddRemark}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Save Investigation Remark</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 7: ADMIN DECISION */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    7. Adjudication Decision
                  </h4>
                </div>
                {complaint.decision && (
                  <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-xs border border-[#C8E6C9]">
                    Decision Logged: {complaint.decision.decision}
                  </span>
                )}
              </div>

              {complaint.decision ? (
                <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#12355B]">{complaint.decision.decision}</span>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      {complaint.decision.date} • {complaint.decision.time}
                    </span>
                  </div>
                  <p className="text-[#1F2933] italic">"{complaint.decision.reason}"</p>
                  <span className="text-[10px] text-[#5B6573] block font-mono pt-1">
                    Officer: {complaint.decision.officer}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        'Complaint Valid',
                        'Complaint Partially Valid',
                        'Complaint Invalid',
                        'Insufficient Evidence',
                      ] as ComplaintDecisionType[]
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setDecisionType(type);
                          if (decisionError) setDecisionError('');
                        }}
                        className={`p-2.5 text-xs font-bold rounded-xs border text-center transition-all cursor-pointer ${
                          decisionType === type
                            ? 'bg-[#12355B] text-white border-[#12355B] shadow-xs'
                            : 'bg-[#F4F6F8] text-[#1F2933] border-[#BAC7D5] hover:border-[#12355B]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                      Mandatory Decision Reason / Findings *
                    </label>
                    <textarea
                      value={decisionReason}
                      onChange={(e) => {
                        setDecisionReason(e.target.value);
                        if (decisionError) setDecisionError('');
                      }}
                      rows={2}
                      placeholder="State the findings, contract clauses, and factual basis for this decision..."
                      className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                    />
                    {decisionError && <p className="text-[11px] text-[#B42318] font-semibold mt-1">{decisionError}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDecision}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2E7D32] hover:bg-[#236327] rounded-xs shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Record Official Decision</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 8: ADMINISTRATIVE ACTIONS */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    8. Administrative Actions & Redressal
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] italic">Refunds / Disciplinary Measures</span>
              </div>

              {complaint.resolution ? (
                <div className="p-3 bg-[#E8F5E9] rounded-xs border border-[#C8E6C9] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2E7D32] uppercase tracking-wider">
                      Action Executed: {complaint.resolution.actionTaken}
                    </span>
                    <span className="font-mono text-[#5B6573]">
                      {complaint.resolution.resolvedDate} • {complaint.resolution.resolvedTime}
                    </span>
                  </div>
                  {complaint.refundAction && (
                    <div className="flex items-center justify-between">
                      <p className="text-[#1F2933]">
                        <strong>Refund Awarded:</strong> ₹{complaint.refundAction.refundAmount} (Ref:{' '}
                        <span className="font-mono">{complaint.refundAction.refundId}</span>)
                      </p>
                      {onNavigateToPayment && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToPayment(complaint.refundAction?.refundId || '');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#12355B] hover:underline cursor-pointer"
                        >
                          <CreditCard className="w-3 h-3 text-[#2E7D32]" />
                          <span>View Refund Voucher</span>
                        </button>
                      )}
                    </div>
                  )}
                  {complaint.workerPenaltyAction && (
                    <p className="text-[#1F2933]">
                      <strong>Worker Measure:</strong> {complaint.workerPenaltyAction.type}{' '}
                      {complaint.workerPenaltyAction.penaltyAmount && `(₹${complaint.workerPenaltyAction.penaltyAmount})`}
                      {complaint.workerPenaltyAction.suspensionDuration && `(${complaint.workerPenaltyAction.suspensionDuration})`}
                    </p>
                  )}
                  <p className="text-[#5B6573] italic">"{complaint.resolution.resolutionRemarks}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Refund', 'Worker Penalty', 'Customer Penalty', 'No Action'] as ComplaintActionType[]).map((act) => (
                      <button
                        key={act}
                        type="button"
                        onClick={() => {
                          setActionType(act);
                          if (actionError) setActionError('');
                        }}
                        className={`p-2 text-xs font-bold rounded-xs border text-center transition-all cursor-pointer ${
                          actionType === act
                            ? 'bg-[#12355B] text-white border-[#12355B] shadow-xs'
                            : 'bg-[#F4F6F8] text-[#1F2933] border-[#BAC7D5] hover:border-[#12355B]'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>

                  {/* REFUND OPTIONS */}
                  {actionType === 'Refund' && (
                    <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-3 text-xs">
                      <span className="font-bold text-[#12355B] uppercase text-[11px] block">Refund Configuration</span>
                      <div className="flex gap-3">
                        {(['Full Refund', 'Partial Refund', 'No Refund'] as const).map((r) => (
                          <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="refundOption"
                              checked={refundType === r}
                              onChange={() => setRefundType(r)}
                              className="text-[#12355B]"
                            />
                            <span>{r}</span>
                          </label>
                        ))}
                      </div>

                      {refundType === 'Full Refund' && (
                        <p className="text-xs text-[#2E7D32] font-semibold">
                          Original transaction amount of ₹1,000 will be refunded to customer source account.
                        </p>
                      )}

                      {refundType === 'Partial Refund' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Partial Refund Amount (₹) *
                            </label>
                            <input
                              type="number"
                              value={refundAmountInput}
                              onChange={(e) => setRefundAmountInput(e.target.value ? Number(e.target.value) : '')}
                              placeholder="e.g. 250"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Refund Reason *
                            </label>
                            <input
                              type="text"
                              value={refundReasonInput}
                              onChange={(e) => setRefundReasonInput(e.target.value)}
                              placeholder="e.g. Compensation for chemical solvent fee"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WORKER PENALTY OPTIONS */}
                  {actionType === 'Worker Penalty' && (
                    <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-3 text-xs">
                      <span className="font-bold text-[#B42318] uppercase text-[11px] block">Worker Penalty Specification</span>
                      <div className="flex gap-3">
                        {(['Warning', 'Monetary Penalty', 'Suspension'] as const).map((p) => (
                          <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="workerPenaltyOption"
                              checked={workerPenaltyType === p}
                              onChange={() => setWorkerPenaltyType(p)}
                              className="text-[#B42318]"
                            />
                            <span>{p}</span>
                          </label>
                        ))}
                      </div>

                      {workerPenaltyType === 'Monetary Penalty' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Penalty Amount (₹) *
                            </label>
                            <input
                              type="number"
                              value={workerPenaltyAmount}
                              onChange={(e) => setWorkerPenaltyAmount(e.target.value ? Number(e.target.value) : '')}
                              placeholder="e.g. 200"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Penalty Reason *
                            </label>
                            <input
                              type="text"
                              value={workerPenaltyReason}
                              onChange={(e) => setWorkerPenaltyReason(e.target.value)}
                              placeholder="e.g. Tariff overcharging penalty"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            />
                          </div>
                        </div>
                      )}

                      {workerPenaltyType === 'Suspension' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Recommended Suspension Duration
                            </label>
                            <select
                              value={workerSuspensionDuration}
                              onChange={(e) => setWorkerSuspensionDuration(e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            >
                              <option value="3 Days">3 Days</option>
                              <option value="7 Days">7 Days</option>
                              <option value="14 Days">14 Days</option>
                              <option value="30 Days">30 Days</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Suspension Reason *
                            </label>
                            <input
                              type="text"
                              value={workerPenaltyReason}
                              onChange={(e) => setWorkerPenaltyReason(e.target.value)}
                              placeholder="e.g. Safety negligence breach"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CUSTOMER PENALTY OPTIONS */}
                  {actionType === 'Customer Penalty' && (
                    <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5] space-y-3 text-xs">
                      <span className="font-bold text-[#B42318] uppercase text-[11px] block">Customer Penalty Specification</span>
                      <div className="flex gap-3">
                        {(['Warning', 'Monetary Penalty', 'Suspension'] as const).map((p) => (
                          <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="customerPenaltyOption"
                              checked={customerPenaltyType === p}
                              onChange={() => setCustomerPenaltyType(p)}
                              className="text-[#B42318]"
                            />
                            <span>{p}</span>
                          </label>
                        ))}
                      </div>

                      {customerPenaltyType === 'Monetary Penalty' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Penalty Amount (₹) *
                            </label>
                            <input
                              type="number"
                              value={customerPenaltyAmount}
                              onChange={(e) => setCustomerPenaltyAmount(e.target.value ? Number(e.target.value) : '')}
                              placeholder="e.g. 150"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Penalty Reason *
                            </label>
                            <input
                              type="text"
                              value={customerPenaltyReason}
                              onChange={(e) => setCustomerPenaltyReason(e.target.value)}
                              placeholder="e.g. Unannounced technician entry denial"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            />
                          </div>
                        </div>
                      )}

                      {customerPenaltyType === 'Suspension' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Recommended Suspension Duration
                            </label>
                            <select
                              value={customerSuspensionDuration}
                              onChange={(e) => setCustomerSuspensionDuration(e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            >
                              <option value="7 Days">7 Days</option>
                              <option value="14 Days">14 Days</option>
                              <option value="30 Days">30 Days</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                              Suspension Reason *
                            </label>
                            <input
                              type="text"
                              value={customerPenaltyReason}
                              onChange={(e) => setCustomerPenaltyReason(e.target.value)}
                              placeholder="e.g. Platform misconduct"
                              className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resolution Remarks */}
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1">
                      Final Resolution Remarks (Communicated to Parties)
                    </label>
                    <textarea
                      value={resolutionRemarksInput}
                      onChange={(e) => setResolutionRemarksInput(e.target.value)}
                      rows={2}
                      placeholder="State the formal resolution communicated to both citizen and worker..."
                      className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                    />
                    {actionError && <p className="text-[11px] text-[#B42318] font-semibold mt-1">{actionError}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleApplyActionAndResolve}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Action & Formally Resolve Dispute</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 9: RESOLUTION SUMMARY & TIMELINE */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    9. Chronological Adjudication Timeline (Immutable)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#5B6573]">
                  Events: {complaint.timeline.length}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pt-1">
                {complaint.timeline.map((evt, idx) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2.5 text-xs p-2 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#12355B] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#12355B]">{evt.event}</span>
                        <span className="text-[10px] font-mono text-[#5B6573]">
                          {evt.date} • {evt.time}
                        </span>
                      </div>
                      <p className="text-[#1F2933] text-[11px]">{evt.details}</p>
                      <span className="text-[10px] text-[#5B6573] font-mono block">
                        Officer: {evt.officer}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-between">
            <span className="text-[10px] text-[#5B6573]">
              Official Record • GigSevak Grievance & Dispute Redressal Portal
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox Gallery Modal for Evidence */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          imageUrl={lightboxImage}
          title="Exhibit Photographic Evidence Preview"
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
};
