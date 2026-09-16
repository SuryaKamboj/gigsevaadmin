import React from 'react';
import { RecentActivityItem, AdminNavTab } from '../types';
import { History, ShieldCheck, ArrowRight, User, HardHat, Briefcase, AlertOctagon, CreditCard, CheckCircle2 } from 'lucide-react';

interface RecentActivityProps {
  activities: RecentActivityItem[];
  onNavigateTab?: (tab: AdminNavTab) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, onNavigateTab }) => {
  const getStatusBadge = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'worker':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32] flex-shrink-0" />
            Approved
          </span>
        );
      case 'job':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C4E80]">
            <CheckCircle2 className="w-3 h-3 text-[#1C4E80] flex-shrink-0" />
            Processed
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#12355B]">
            <CheckCircle2 className="w-3 h-3 text-[#12355B] flex-shrink-0" />
            Registered
          </span>
        );
      case 'dispute':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B26A00]">
            <CheckCircle2 className="w-3 h-3 text-[#B26A00] flex-shrink-0" />
            Resolved
          </span>
        );
      case 'payment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32]">
            <CheckCircle2 className="w-3 h-3 text-[#2E7D32] flex-shrink-0" />
            Settled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B6573]">
            Logged
          </span>
        );
    }
  };

  const getTargetTab = (type: RecentActivityItem['type']): AdminNavTab => {
    switch (type) {
      case 'worker':
        return 'workers';
      case 'job':
        return 'jobs';
      case 'user':
        return 'users';
      case 'dispute':
        return 'disputes';
      case 'payment':
        return 'payments';
      default:
        return 'dashboard';
    }
  };

  const getTypeIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'worker':
        return <HardHat className="w-3.5 h-3.5 text-[#E67E22]" />;
      case 'job':
        return <Briefcase className="w-3.5 h-3.5 text-[#1C4E80]" />;
      case 'user':
        return <User className="w-3.5 h-3.5 text-[#12355B]" />;
      case 'dispute':
        return <AlertOctagon className="w-3.5 h-3.5 text-[#B42318]" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-[#2E7D32]" />;
      default:
        return <History className="w-3.5 h-3.5 text-[#5B6573]" />;
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#D5DCE3] p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#D5DCE3] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-[#EAF2F8] text-[#12355B]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#12355B] text-sm uppercase tracking-wide">
              Recent Administrative Activity
            </h3>
            <p className="text-[11px] text-[#5B6573]">Cryptographic audit log of departmental actions</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2E7D32] px-2 py-0.5 rounded-xs bg-[#E8F5E9] border border-[#C8E6C9]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2 px-2.5">Time</th>
              <th className="py-2 px-2.5">Type</th>
              <th className="py-2 px-2.5">Activity Record</th>
              <th className="py-2 px-2.5">Status</th>
              <th className="py-2 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                <td className="py-2.5 px-2.5 font-mono text-[10px] text-[#5B6573] whitespace-nowrap">
                  {activity.timestamp}
                </td>
                <td className="py-2.5 px-2.5">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(activity.type)}
                    <span className="font-mono text-[10px] font-semibold uppercase text-[#12355B]">
                      {activity.type}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2.5">
                  <div className="font-semibold text-[#1F2933] text-[11px]">{activity.title}</div>
                  <div className="text-[11px] text-[#5B6573] leading-snug">{activity.description}</div>
                </td>
                <td className="py-2.5 px-2.5 whitespace-nowrap">
                  {getStatusBadge(activity.type)}
                </td>
                <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(getTargetTab(activity.type))}
                      className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                      title="View activity section"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E67E22]" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
