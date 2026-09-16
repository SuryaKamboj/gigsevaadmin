import React, { useState } from 'react';
import { JobItem, JobStatus } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  X,
  Briefcase,
  User,
  HardHat,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XCircle,
  ExternalLink,
  Camera,
  Layers,
  Timer,
} from 'lucide-react';
import { getJobWorkTimingInfo } from '../utils/duration';

interface JobDetailsModalProps {
  isOpen: boolean;
  job: JobItem | null;
  onClose: () => void;
  onViewUserProfile?: (userId: string, sourceJobId?: string) => void;
  onViewWorkerProfile?: (workerId: string, sourceJobId?: string) => void;
  onNavigateToPayment?: (transactionId: string, sourceJobId?: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  job,
  onClose,
  onViewUserProfile,
  onViewWorkerProfile,
  onNavigateToPayment,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  if (!isOpen || !job) return null;

  const timingInfo = getJobWorkTimingInfo(job);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            Completed
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            <Clock3 className="w-3.5 h-3.5 text-[#1C4E80]" />
            Active / In Progress
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B26A00]" />
            Pending Assignment / Dispatch
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <XCircle className="w-3.5 h-3.5 text-[#B42318]" />
            Cancelled
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            Settled / Paid
          </span>
        );
      case 'Escrow Pending':
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
            Escrow Held
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            Refunded
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3]">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4">
        <div
          className="relative bg-white rounded-sm max-w-4xl w-full shadow-lg border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                    Service Work Order Dossier
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#1C4E80] border border-[#2A65A0] rounded-xs text-white">
                    {job.id}
                  </span>
                </div>
                <p className="text-[10px] text-[#A5B9CC]">
                  Departmental Job Record • Operational Central Source of Truth (View-Only)
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

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-5 bg-[#F4F6F8]">
            {/* Section 1: Job Information Banner */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DCE3]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5B6573]">
                      Service Title
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#12355B] border border-[#BAC7D5]">
                      {job.serviceCategory}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#12355B] mt-0.5">{job.service}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#1C4E80] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Scheduled Window</span>
                    <span className="font-semibold text-[#1F2933]">{job.scheduledDate}</span>
                    <span className="text-[#5B6573] block text-[11px]">{job.scheduledTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#1C4E80] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Order Created</span>
                    <span className="font-semibold text-[#1F2933]">{job.createdDate}</span>
                    <span className="text-[#5B6573] block text-[11px] font-mono">{job.createdTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-[#1C4E80] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Order Value</span>
                    <span className="text-base font-bold font-mono text-[#12355B]">{job.payment.amount}</span>
                    <span className="block text-[10px] text-[#5B6573]">{job.payment.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 & 3: Customer & Worker Two-Column Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info Card */}
              <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3] mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-xs bg-[#EAF2F8] text-[#12355B]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Customer / Citizen
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#5B6573] bg-[#F4F6F8] px-1.5 py-0.5 rounded-xs border border-[#D5DCE3]">
                      {job.customer.userId}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573]">Citizen Name</span>
                      <p className="font-bold text-[#1F2933] text-sm">{job.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573]">Registered Mobile</span>
                      <p className="font-mono text-[#1F2933]">{job.customer.phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573]">Service Location</span>
                      <p className="text-[#5B6573] text-[11px] leading-relaxed">{job.customer.address}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#D5DCE3]">
                  {onViewUserProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewUserProfile(job.customer.userId, job.id);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] hover:bg-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer"
                    >
                      <span>View User Profile ({job.customer.userId})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Worker Info Card */}
              <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3] mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-xs bg-[#E8F5E9] text-[#2E7D32]">
                        <HardHat className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Assigned Field Worker
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.5 rounded-xs border border-[#C8E6C9]">
                      {job.worker.workerId}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573]">Worker Name</span>
                      <p className="font-bold text-[#1F2933] text-sm">{job.worker.name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5B6573]">Trade Category</span>
                        <p className="text-[#1F2933] font-semibold">{job.worker.category}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#5B6573]">Rating</span>
                        <p className="font-bold text-[#B26A00] font-mono">★ {job.worker.averageRating} / 5.0</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573]">Official Mobile</span>
                      <p className="font-mono text-[#1F2933]">{job.worker.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#D5DCE3]">
                  {onViewWorkerProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewWorkerProfile(job.worker.workerId, job.id);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#12355B] bg-[#EAF2F8] hover:bg-[#12355B] hover:text-white border border-[#BAC7D5] rounded-xs transition-colors cursor-pointer"
                    >
                      <span>View Worker Profile ({job.worker.workerId})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Service Details & Customer Photos */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D5DCE3]">
                <Layers className="w-4 h-4 text-[#1C4E80]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                  Service Scope & Site Description
                </h4>
              </div>

              <div className="text-xs text-[#1F2933] bg-[#F4F6F8] p-3 rounded-xs border border-[#D5DCE3] leading-relaxed">
                {job.description}
              </div>

              <div className="flex items-start gap-2 text-xs text-[#5B6573]">
                <MapPin className="w-4 h-4 text-[#B42318] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573]">Dispatch Destination Address:</span>
                  <p className="text-[#1F2933] font-medium">{job.location}</p>
                </div>
              </div>

              {job.servicePhotos && job.servicePhotos.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573] block mb-1.5">
                    Customer Uploaded Service Photos ({job.servicePhotos.length})
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {job.servicePhotos.map((photo, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setSelectedPhoto({
                            url: photo,
                            title: `Citizen Uploaded Photo #${index + 1}`,
                            subtitle: `Order: ${job.id} • ${job.service}`,
                          })
                        }
                        className="group relative rounded-xs overflow-hidden border border-[#BAC7D5] hover:border-[#12355B] transition-colors cursor-pointer"
                      >
                        <img
                          src={photo}
                          alt={`Customer upload ${index + 1}`}
                          className="w-20 h-20 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Camera className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Work Execution & On-Site Verification Evidence */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    On-Site Work Execution & Evidence
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] font-mono">
                  Worker Dashboard Stopwatch Sync
                </span>
              </div>

              {/* Work Execution & Timing Card */}
              <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xs border border-[#D5DCE3] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#5B6573] block mb-0.5">
                      Work Started
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
                      <span className="font-mono font-bold text-[#1F2933] text-sm">
                        {timingInfo.workStartedFormatted}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#5B6573] block mb-0.5">
                      Work Completed
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          job.status === 'Completed' ? 'text-[#2E7D32]' : 'text-[#8795A5]'
                        }`}
                      />
                      <span
                        className={`font-mono font-bold text-sm ${
                          job.status === 'Completed' ? 'text-[#1F2933]' : 'text-[#5B6573]'
                        }`}
                      >
                        {timingInfo.workCompletedFormatted}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#12355B] block mb-0.5">
                      Time Taken to Complete
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-[#12355B] flex-shrink-0" />
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          job.status === 'Completed'
                            ? 'text-[#12355B] bg-[#EAF2F8] px-2 py-0.5 rounded-xs border border-[#BAC7D5]'
                            : 'text-[#B26A00] bg-[#FFF8E1] px-2 py-0.5 rounded-xs border border-[#FFE082]'
                        }`}
                      >
                        {timingInfo.timeTakenFormatted}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before-work Proof */}
                <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#1F2933] uppercase">
                      Before-work Proof
                    </span>
                    <span className="text-[10px] font-semibold text-[#5B6573]">
                      {job.workEvidence.beforePhotos.length} recorded
                    </span>
                  </div>
                  {job.workEvidence.beforePhotos.length === 0 ? (
                    <p className="text-[11px] text-[#8795A5] italic py-4 text-center">
                      No pre-work evidence uploaded for this job.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {job.workEvidence.beforePhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setSelectedPhoto({
                              url: photo,
                              title: `Before-Work Evidence #${idx + 1}`,
                              subtitle: `Order: ${job.id} • Assigned to ${job.worker.name}`,
                            })
                          }
                          className="group relative rounded-xs overflow-hidden border border-[#BAC7D5] hover:border-[#12355B] transition-colors cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`Before work ${idx + 1}`}
                            className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-mono text-center py-0.5">
                            Before
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* After-work Proof */}
                <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#2E7D32] uppercase">
                      After-work Proof
                    </span>
                    <span className="text-[10px] font-semibold text-[#5B6573]">
                      {job.workEvidence.afterPhotos.length} recorded
                    </span>
                  </div>
                  {job.workEvidence.afterPhotos.length === 0 ? (
                    <p className="text-[11px] text-[#8795A5] italic py-4 text-center">
                      Work pending completion or proof photos not yet uploaded.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {job.workEvidence.afterPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setSelectedPhoto({
                              url: photo,
                              title: `Proof of Completion #${idx + 1}`,
                              subtitle: `Order: ${job.id} • Completed by ${job.worker.name}`,
                            })
                          }
                          className="group relative rounded-xs overflow-hidden border border-[#C8E6C9] hover:border-[#2E7D32] transition-colors cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`After work ${idx + 1}`}
                            className="w-24 h-24 object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-[#2E7D32]/80 text-white text-[9px] font-mono text-center py-0.5">
                            Completed
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 6: Job Timeline */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    Chronological Job Lifecycle Timeline
                  </h4>
                </div>
                <span className="text-[10px] text-[#5B6573] font-mono">
                  Audit Sequence
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5DCE3]">
                {job.timeline.map((item, index) => {
                  const isCompleted = item.event === 'Work Completed' || item.event === 'Payment Successful';
                  const isCancelled = item.event === 'Booking Cancelled';

                  return (
                    <div key={index} className="relative text-xs">
                      {/* Timeline node */}
                      <span
                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${
                          isCancelled
                            ? 'border-[#B42318] text-[#B42318]'
                            : isCompleted
                            ? 'border-[#2E7D32] text-[#2E7D32]'
                            : 'border-[#12355B] text-[#12355B]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCancelled
                              ? 'bg-[#B42318]'
                              : isCompleted
                              ? 'bg-[#2E7D32]'
                              : 'bg-[#12355B]'
                          }`}
                        />
                      </span>

                      <div className="bg-[#F4F6F8] p-2.5 rounded-xs border border-[#D5DCE3]">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span
                            className={`font-bold uppercase tracking-wide text-[11px] ${
                              isCancelled
                                ? 'text-[#B42318]'
                                : isCompleted
                                ? 'text-[#2E7D32]'
                                : 'text-[#12355B]'
                            }`}
                          >
                            {item.event}
                          </span>
                          <span className="text-[10px] text-[#5B6573] font-mono">
                            {item.date} • {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1F2933] mt-1 leading-snug">{item.detail}</p>
                        {item.referenceId && (
                          <span className="inline-block text-[10px] font-mono text-[#1C4E80] mt-1">
                            Ref: {item.referenceId}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 7: Payment Summary */}
            <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1C4E80]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    Payment & Settlement Summary
                  </h4>
                </div>
                {getPaymentStatusBadge(job.payment.status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F4F6F8] p-3 rounded-xs border border-[#D5DCE3] text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Total Amount</span>
                  <span className="text-lg font-bold font-mono text-[#12355B]">{job.payment.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Transaction Reference</span>
                  {onNavigateToPayment && job.payment.transactionId ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToPayment(job.payment.transactionId, job.id);
                      }}
                      className="font-mono font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      title="Inspect Transaction Voucher in Payments & Finance"
                    >
                      <span>{job.payment.transactionId}</span>
                      <ExternalLink className="w-3 h-3 text-[#E67E22]" />
                    </button>
                  ) : (
                    <span className="font-mono font-bold text-[#1F2933]">{job.payment.transactionId}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Payment Gateway / Method</span>
                  <span className="text-[#1F2933]">{job.payment.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5B6573] block">Settlement Time</span>
                  <span className="text-[#5B6573] font-mono text-[11px]">
                    {job.payment.paidAt || 'Awaiting completion'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer (View Only Notice) */}
          <div className="p-3 border-t border-[#D5DCE3] bg-[#F4F6F8] flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-[11px] text-[#5B6573] text-center sm:text-left">
              <span className="font-bold text-[#12355B]">ADMIN VIEW-ONLY:</span> Normal work assignment and status execution occurs between Citizen and Worker.
            </div>

            <button
              onClick={onClose}
              type="button"
              className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Reusable Image Lightbox */}
      <ImageLightboxModal
        isOpen={!!selectedPhoto}
        imageUrl={selectedPhoto?.url || null}
        title={selectedPhoto?.title}
        subtitle={selectedPhoto?.subtitle}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};
