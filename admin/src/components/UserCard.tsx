import React from 'react';
import { UserItem, UserAccountStatus, JobItem } from '../types';
import { Eye, Phone, Calendar, MapPin, ShieldCheck, ShieldAlert, Check, Briefcase, ArrowRight } from 'lucide-react';

interface UserCardProps {
  user: UserItem;
  jobs: JobItem[];
  onViewDetails: (user: UserItem) => void;
  onNavigateToJobs: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  jobs,
  onViewDetails,
  onNavigateToJobs,
}) => {
  const getStatusBadge = (status: UserAccountStatus) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
        <ShieldAlert className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
        Blocked
      </span>
    );
  };

  const totalBookings = jobs.filter((j) => j.customer.userId.toLowerCase() === user.id.toLowerCase()).length;

  return (
    <div
      onClick={() => onViewDetails(user)}
      className="bg-white rounded-sm border border-[#D5DCE3] p-3.5 space-y-3 shadow-xs hover:border-[#12355B] transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-xs text-[#12355B]">{user.id}</span>
        {getStatusBadge(user.status)}
      </div>

      <div className="flex items-center gap-3">
        <img
          src={user.image}
          alt={user.name}
          className="w-12 h-12 rounded-sm object-cover border border-[#BAC7D5] flex-shrink-0"
        />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[#1F2933] truncate">{user.name}</h4>
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#5B6573]">
            <Phone className="w-3 h-3 text-[#5B6573]" />
            <span>{user.phone}</span>
            <span className="text-[9px] text-[#2E7D32] font-semibold flex items-center">
              <Check className="w-2.5 h-2.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Derived Total Bookings Counter / Filter Button */}
      <div className="flex items-center justify-between pt-2 border-t border-[#D5DCE3]">
        <span className="text-[10px] uppercase font-bold text-[#5B6573] flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-[#12355B]" />
          Total Bookings:
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToJobs(user.id);
          }}
          className="group inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-mono font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
          title="Open Job Management filtered by this customer"
        >
          <span>{totalBookings} {totalBookings === 1 ? 'Booking' : 'Bookings'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E67E22] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>
      </div>

      <div className="space-y-1 text-[11px] text-[#5B6573]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
          <span>Member Since: {user.joinedDate}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#5B6573] flex-shrink-0 mt-0.5" />
          <p className="truncate text-[#5B6573]">{user.address}</p>
        </div>
      </div>

      <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(user);
          }}
          className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
          title="View citizen profile dossier"
        >
          <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};
