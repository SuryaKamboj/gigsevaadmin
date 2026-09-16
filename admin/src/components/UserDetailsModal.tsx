import React, { useState } from 'react';
import { UserItem, UserAccountStatus, UserActivityItem, JobItem } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  X,
  User,
  Phone,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Edit3,
  Save,
  Check,
  CreditCard,
  Briefcase,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface UserDetailsModalProps {
  isOpen: boolean;
  user: UserItem | null;
  jobs: JobItem[];
  onClose: () => void;
  onUpdateStatus: (userId: string, newStatus: UserAccountStatus, reason?: string) => void;
  onUpdateAdminNote: (userId: string, newNote: string) => void;
  onNavigateToJob?: (jobId: string, userId: string) => void;
  onNavigateToJobsWithUserFilter?: (userId: string, status?: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  user,
  jobs,
  onClose,
  onUpdateStatus,
  onUpdateAdminNote,
  onNavigateToJob,
  onNavigateToJobsWithUserFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  // Admin note editing state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Block modal / reason prompt state
  const [showBlockReasonModal, setShowBlockReasonModal] = useState(false);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [blockError, setBlockError] = useState('');
  const [statusActionFeedback, setStatusActionFeedback] = useState<string | null>(null);

  // Sync state when user changes
  React.useEffect(() => {
    if (user) {
      setAdminNoteText(user.adminNote || '');
      setIsEditingNote(false);
      setShowBlockReasonModal(false);
      setBlockReasonInput('');
      setBlockError('');
      setStatusActionFeedback(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // DYNAMICALLY DERIVED from central Job Management single source of truth
  const userJobs = jobs.filter((j) => j.customer.userId.toLowerCase() === user.id.toLowerCase());
  const totalBookings = userJobs.length;
  const completedBookings = userJobs.filter((j) => j.status === 'Completed').length;
  const activeBookings = userJobs.filter((j) => j.status === 'Active').length;
  const cancelledBookings = userJobs.filter((j) => j.status === 'Cancelled').length;

  const handleSaveNote = () => {
    onUpdateAdminNote(user.id, adminNoteText);
    setIsEditingNote(false);
  };

  const handleToggleBlock = () => {
    if (user.status === 'Active') {
      setShowBlockReasonModal(true);
      setBlockReasonInput('');
      setBlockError('');
    } else {
      onUpdateStatus(user.id, 'Active');
      setStatusActionFeedback('Account access successfully restored to Active.');
    }
  };

  const handleConfirmBlock = () => {
    const reasonToUse = blockReasonInput.trim() || 'Administrative suspension by department officer for policy compliance review';
    onUpdateStatus(user.id, 'Blocked', reasonToUse);
    setShowBlockReasonModal(false);
    setBlockReasonInput('');
    setBlockError('');
    setStatusActionFeedback('Account successfully placed on Administrative Block.');
  };

  const getActivityBadge = (activity: UserActivityItem['activity']) => {
    switch (activity) {
      case 'Booking Completed':
      case 'Payment Successful':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
            {activity}
          </span>
        );
      case 'Booking Cancelled':
      case 'Payment Failed':
      case 'Account Status Changed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            <AlertCircle className="w-3 h-3 text-[#B42318]" />
            {activity}
          </span>
        );
      case 'Booking Accepted':
      case 'Payment Refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] border border-[#BAC7D5]">
            <Clock className="w-3 h-3 text-[#1C4E80]" />
            {activity}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#F4F6F8] text-[#5B6573] border border-[#D5DCE3]">
            {activity}
          </span>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
        <div
          className="relative bg-white rounded-sm max-w-2xl w-full shadow-xl border border-[#D5DCE3] flex flex-col max-h-[90vh] overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                    Citizen Registry Dossier
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#1C4E80] border border-[#2A65A0] rounded-xs text-white">
                    {user.id}
                  </span>
                </div>
                <p className="text-[10px] text-[#A5B9CC]">
                  Customer Profile & Meaningful Activity Record
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

          {/* Navigation Tabs (Profile and Activity ONLY - No Booking History tab) */}
          <div className="flex border-b border-[#D5DCE3] bg-[#F4F6F8] px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x ${
                activeTab === 'profile'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              1. Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xs transition-colors cursor-pointer border-t border-x ${
                activeTab === 'activity'
                  ? 'bg-white text-[#12355B] border-[#D5DCE3] border-b-white -mb-px'
                  : 'text-[#5B6573] border-transparent hover:text-[#12355B]'
              }`}
            >
              2. Activity ({user.activity.length})
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#F4F6F8]">
            {statusActionFeedback && (
              <div className="p-2.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-xs text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                  <span>{statusActionFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusActionFeedback(null)}
                  className="text-[#2E7D32] hover:text-[#1B5E20] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activeTab === 'profile' ? (
              <div className="space-y-4">
                {/* User Information Card */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-4">
                  {/* Photo & Basic Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-[#D5DCE3]">
                    {/* Clickable Profile Photo for Lightbox */}
                    <div className="relative group cursor-pointer" onClick={() => setIsPhotoLightboxOpen(true)}>
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-20 h-20 rounded-sm object-cover border border-[#BAC7D5] group-hover:border-[#12355B] transition-colors"
                      />
                      <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-sm flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                        Enlarge
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-[#1F2933]">{user.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                            user.status === 'Active'
                              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                              : 'bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]'
                          }`}
                        >
                          {user.status === 'Active' ? 'Active Account' : 'Blocked Account'}
                        </span>
                      </div>

                      <p className="text-xs font-mono font-bold text-[#12355B]">{user.id}</p>

                      {/* Mobile & Verification status */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <span className="font-mono text-[#1F2933] flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#5B6573]" />
                          {user.phone}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.2 rounded-xs border border-[#C8E6C9]">
                          <Check className="w-3 h-3 text-[#2E7D32]" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Derived Job Metrics Section (Connected to Job Management) */}
                  <div className="p-3 bg-[#F4F6F8] rounded-sm border border-[#D5DCE3] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#1C4E80]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#12355B]">
                          Derived Service Bookings ({totalBookings} Total)
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5B6573] italic">
                        Click count to open in Job Management
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Total Bookings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToJobsWithUserFilter && onNavigateToJobsWithUserFilter(user.id);
                        }}
                        className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:border-[#12355B] hover:bg-[#EAF2F8] text-center transition-colors cursor-pointer group"
                        title="View all jobs for this customer in Job Management"
                      >
                        <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Total Bookings</span>
                        <span className="text-base font-bold font-mono text-[#12355B] flex items-center justify-center gap-1">
                          {totalBookings}
                          <ArrowRight className="w-3 h-3 text-[#E67E22] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>

                      {/* Completed Bookings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToJobsWithUserFilter && onNavigateToJobsWithUserFilter(user.id, 'Completed');
                        }}
                        className="p-2 bg-white rounded-xs border border-[#C8E6C9] hover:border-[#2E7D32] hover:bg-[#E8F5E9] text-center transition-colors cursor-pointer group"
                        title="View completed jobs for this customer"
                      >
                        <span className="text-[10px] uppercase font-bold text-[#2E7D32] block">Completed</span>
                        <span className="text-base font-bold font-mono text-[#2E7D32] flex items-center justify-center gap-1">
                          {completedBookings}
                          <ArrowRight className="w-3 h-3 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>

                      {/* Active Bookings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToJobsWithUserFilter && onNavigateToJobsWithUserFilter(user.id, 'Active');
                        }}
                        className="p-2 bg-white rounded-xs border border-[#BAC7D5] hover:border-[#1C4E80] hover:bg-[#EAF2F8] text-center transition-colors cursor-pointer group"
                        title="View active / in-progress jobs for this customer"
                      >
                        <span className="text-[10px] uppercase font-bold text-[#1C4E80] block">Active</span>
                        <span className="text-base font-bold font-mono text-[#1C4E80] flex items-center justify-center gap-1">
                          {activeBookings}
                          <ArrowRight className="w-3 h-3 text-[#1C4E80] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>

                      {/* Cancelled Bookings Button */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToJobsWithUserFilter && onNavigateToJobsWithUserFilter(user.id, 'Cancelled');
                        }}
                        className="p-2 bg-white rounded-xs border border-[#FFCDD2] hover:border-[#B42318] hover:bg-[#FFEBEE] text-center transition-colors cursor-pointer group"
                        title="View cancelled jobs for this customer"
                      >
                        <span className="text-[10px] uppercase font-bold text-[#B42318] block">Cancelled</span>
                        <span className="text-base font-bold font-mono text-[#B42318] flex items-center justify-center gap-1">
                          {cancelledBookings}
                          <ArrowRight className="w-3 h-3 text-[#B42318] group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Profile Read-Only Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Member Since</span>
                      <div className="flex items-center gap-1.5 text-[#1F2933] mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1C4E80]" />
                        <span>{user.joinedDate}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Account Status</span>
                      <div className="flex items-center gap-1.5 text-[#1F2933] mt-0.5">
                        {user.status === 'Active' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-[#B42318]" />
                        )}
                        <span className="font-semibold">{user.status}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-[#5B6573] block">
                        Registered Service Address / Location
                      </span>
                      <div className="flex items-start gap-1.5 text-[#1F2933] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5B6573] flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">{user.address}</p>
                      </div>
                    </div>

                    {user.blockReason && (
                      <div className="sm:col-span-2 p-2.5 bg-[#FFEBEE] rounded-xs border border-[#FFCDD2]">
                        <span className="text-[10px] uppercase font-bold text-[#B42318] block">
                          Official Block Reason
                        </span>
                        <p className="text-[11px] text-[#B42318] mt-0.5">{user.blockReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Small Internal Admin Note (Not visible to customer) */}
                <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#D5DCE3]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#12355B]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Internal Admin Note
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#8795A5] italic">
                      Admin-only • Hidden from customer
                    </span>
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2">
                      <textarea
                        value={adminNoteText}
                        onChange={(e) => setAdminNoteText(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2 bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                        placeholder="Add internal officer note regarding this user..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminNoteText(user.adminNote || '');
                            setIsEditingNote(false);
                          }}
                          className="px-3 py-1 text-xs text-[#5B6573] bg-white border border-[#D5DCE3] rounded-xs hover:bg-[#F4F6F8] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNote}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs cursor-pointer shadow-xs"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Note</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 p-2.5 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3]">
                      <p className="text-xs text-[#1F2933] italic leading-relaxed">
                        {user.adminNote || 'No internal remarks logged for this customer account.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditingNote(true)}
                        className="p-1 text-[#1C4E80] hover:text-[#12355B] hover:bg-white rounded-xs border border-transparent hover:border-[#BAC7D5] transition-colors cursor-pointer flex-shrink-0"
                        title="Edit Admin Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Status Action Bar */}
                <div className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1F2933] block">Account Access Management</span>
                    <span className="text-[10px] text-[#5B6573]">
                      {user.status === 'Active'
                        ? 'Account is active and authorized to request services.'
                        : 'Account is currently blocked from creating new bookings.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleBlock}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xs shadow-xs transition-colors cursor-pointer ${
                      user.status === 'Active'
                        ? 'bg-[#B42318] text-white hover:bg-[#911810]'
                        : 'bg-[#2E7D32] text-white hover:bg-[#236327]'
                    }`}
                  >
                    {user.status === 'Active' ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Block User</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Unblock User</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: USER ACTIVITY */
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1C4E80]" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                        Chronological Customer Activity Log
                      </h4>
                      <p className="text-[10px] text-[#5B6573]">
                        Audit of booking lifecycles, payment transactions, and administrative modifications
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#EAF2F8] text-[#12355B] rounded-xs border border-[#BAC7D5]">
                    {user.activity.length} Events
                  </span>
                </div>

                {user.activity.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-sm border border-[#D5DCE3] text-xs text-[#5B6573]">
                    No activity recorded for this citizen profile yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {user.activity.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-sm border border-[#D5DCE3] shadow-xs space-y-2 hover:border-[#BAC7D5] transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          {getActivityBadge(item.activity)}
                          <span className="text-[10px] font-mono text-[#5B6573]">
                            {item.date} • {item.time}
                          </span>
                        </div>

                        <p className="text-xs text-[#1F2933] leading-relaxed">{item.details}</p>

                        {/* Associated IDs and Cross-Module Links */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#F4F6F8] text-xs">
                          {item.jobId && (
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <Briefcase className="w-3.5 h-3.5 text-[#1C4E80]" />
                              <span className="text-[#5B6573]">Job:</span>
                              {onNavigateToJob ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onNavigateToJob(item.jobId!, user.id);
                                  }}
                                  className="font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                  title="Open in Job Management"
                                >
                                  <span>{item.jobId}</span>
                                  <ArrowRight className="w-3 h-3 text-[#E67E22]" />
                                </button>
                              ) : (
                                <span className="font-bold text-[#12355B]">{item.jobId}</span>
                              )}
                            </div>
                          )}

                          {item.transactionId && (
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-[#5B6573]" />
                              <span className="text-[#5B6573]">Txn:</span>
                              <span className="font-bold text-[#1F2933]">{item.transactionId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#5B6573] font-mono">
              Citizen Registry ID: {user.id} • Verified
            </span>
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

      {/* Mandatory Reason Modal for Blocking User */}
      {showBlockReasonModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-sm max-w-md w-full p-4 border border-[#B42318] shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D5DCE3]">
              <ShieldAlert className="w-5 h-5 text-[#B42318]" />
              <h4 className="text-sm font-bold text-[#B42318] uppercase">
                Mandatory Administrative Block Reason
              </h4>
            </div>

            <p className="text-xs text-[#5B6573]">
              You are applying an official administrative suspension to customer{' '}
              <strong className="text-[#1F2933]">{user.name} ({user.id})</strong>. Please provide a clear official justification.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-[#5B6573]">
                Reason for Account Suspension *
              </label>
              <textarea
                autoFocus
                value={blockReasonInput}
                onChange={(e) => {
                  setBlockReasonInput(e.target.value);
                  if (blockError) setBlockError('');
                }}
                rows={3}
                placeholder="e.g. Repeated late cancellations, abusive conduct with service technicians, or billing non-compliance..."
                className="w-full text-xs p-2 bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs focus:outline-none focus:border-[#B42318] focus:ring-1 focus:ring-[#B42318]"
              />
              {blockError && <p className="text-[11px] text-[#B42318] font-semibold">{blockError}</p>}
            </div>

            <div className="pt-2 border-t border-[#D5DCE3] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlockReasonModal(false)}
                className="px-3 py-1.5 text-xs text-[#5B6573] bg-[#F4F6F8] border border-[#D5DCE3] rounded-xs hover:bg-[#EAF2F8] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs shadow-xs cursor-pointer"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Profile Photo */}
      <ImageLightboxModal
        isOpen={isPhotoLightboxOpen}
        imageUrl={user.image}
        title={`${user.name} - Profile Image`}
        subtitle={`Citizen UID: ${user.id} • Verified Resident`}
        onClose={() => setIsPhotoLightboxOpen(false)}
      />
    </>
  );
};
