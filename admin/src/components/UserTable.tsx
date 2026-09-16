import React from 'react';
import { UserItem, UserAccountStatus, JobItem } from '../types';
import { Eye, ShieldCheck, ShieldAlert, Check, Briefcase, ArrowRight } from 'lucide-react';

interface UserTableProps {
  users: UserItem[];
  jobs: JobItem[];
  onViewDetails: (user: UserItem) => void;
  onNavigateToJobs: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
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

  const getUserJobCount = (userId: string) => {
    return jobs.filter((j) => j.customer.userId.toLowerCase() === userId.toLowerCase()).length;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider select-none">
          <tr>
            <th className="py-2.5 px-3">User ID</th>
            <th className="py-2.5 px-3 text-center">Profile</th>
            <th className="py-2.5 px-3">Name</th>
            <th className="py-2.5 px-3">Mobile</th>
            <th className="py-2.5 px-3 text-center">Total Bookings</th>
            <th className="py-2.5 px-3">Member Since</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3 text-right">View</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {users.map((user) => {
            const totalBookings = getUserJobCount(user.id);

            return (
              <tr
                key={user.id}
                onClick={() => onViewDetails(user)}
                className="hover:bg-[#F4F6F8]/70 transition-colors cursor-pointer"
              >
                {/* User ID */}
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-[#12355B] text-xs">
                    {user.id}
                  </span>
                </td>

                {/* Profile Image */}
                <td className="py-3 px-3 text-center">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-9 h-9 rounded-sm object-cover border border-[#BAC7D5] mx-auto"
                  />
                </td>

                {/* Name */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-[#1F2933]">{user.name}</div>
                  <div className="text-[10px] text-[#5B6573] truncate max-w-[180px]" title={user.address}>
                    {user.address}
                  </div>
                </td>

                {/* Mobile */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="font-mono text-[#1F2933]">{user.phone}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[#2E7D32]">
                    <Check className="w-2.5 h-2.5" />
                    <span>Verified</span>
                  </div>
                </td>

                {/* Total Bookings (Inline text-first clickable element with icon and arrow) */}
                <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onNavigateToJobs(user.id)}
                    className="group inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-mono font-bold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                    title={`View all ${totalBookings} jobs for ${user.name} in Job Management`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#12355B] group-hover:text-[#1C4E80] transition-colors flex-shrink-0" />
                    <span>{totalBookings} {totalBookings === 1 ? 'Booking' : 'Bookings'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E67E22] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>
                </td>

                {/* Member Since */}
                <td className="py-3 px-3 whitespace-nowrap text-[#5B6573]">
                  {user.joinedDate}
                </td>

                {/* Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>

                {/* View Button (Inline text-first clickable button) */}
                <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onViewDetails(user)}
                    className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                    title="View citizen profile dossier"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
