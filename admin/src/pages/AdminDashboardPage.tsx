import React, { useState, useEffect } from 'react';
import {
  UserItem,
  WorkerItem,
  JobItem,
  ComplaintItem,
  TransactionItem,
  PlatformCommissionItem,
  RefundItem,
  AdminNavTab,
} from '../types';
import {
  MOCK_USERS,
  MOCK_WORKERS,
  MOCK_COMPLAINTS,
  MOCK_TRANSACTIONS,
  MOCK_PLATFORM_COMMISSIONS,
  MOCK_REFUNDS,
  RECENT_ACTIVITIES,
} from '../data/mockData';
import { adminService } from '../services/adminService';
import { UserGrowthChart } from '../components/UserGrowthChart';
import { WorkerGrowthChart } from '../components/WorkerGrowthChart';
import { JobsPerDayChart } from '../components/JobsPerDayChart';
import { JobCompletionRateChart } from '../components/JobCompletionRateChart';
import { PopularServicesChart } from '../components/PopularServicesChart';
import { GeographicDistributionChart } from '../components/GeographicDistributionChart';
import { PlatformEarningsChart } from '../components/PlatformEarningsChart';
import { RecentActivity } from '../components/RecentActivity';
import {
  Users,
  HardHat,
  Briefcase,
  AlertOctagon,
  CreditCard,
  RefreshCw,
  Download,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  FileText,
} from 'lucide-react';

interface PendingActionItem {
  id: string;
  category: string;
  code: string;
  count: number;
  urgency: 'Immediate' | 'High' | 'Normal';
  actionLabel: string;
  icon: React.ElementType;
  tab: AdminNavTab;
}

interface AdminDashboardPageProps {
  jobs?: JobItem[];
  users?: UserItem[];
  workers?: WorkerItem[];
  complaints?: ComplaintItem[];
  transactions?: TransactionItem[];
  commissions?: PlatformCommissionItem[];
  refunds?: RefundItem[];
  onSelectTab?: (tab: AdminNavTab, subtab?: string) => void;
  targetSection?: string | null;
  onClearTargetSection?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  jobs = [],
  users = MOCK_USERS,
  workers = MOCK_WORKERS,
  complaints = MOCK_COMPLAINTS,
  transactions = MOCK_TRANSACTIONS,
  commissions = MOCK_PLATFORM_COMMISSIONS,
  refunds = MOCK_REFUNDS,
  onSelectTab,
  targetSection,
  onClearTargetSection,
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');

  // Automatic smooth scroll to target section (via prop or URL query param)
  useEffect(() => {
    // 1. Check prop targetSection
    if (targetSection === 'pending-administrative-actions' || targetSection === 'pending-actions') {
      const timer = setTimeout(() => {
        const el = document.getElementById('pending-administrative-actions');
        if (el) {
          const headerOffset = 84;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
        if (onClearTargetSection) {
          onClearTargetSection();
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // 2. Check URL search param if present (e.g. /dashboard?section=pending-actions)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sectionParam = params.get('section');
      if (sectionParam === 'pending-actions' || sectionParam === 'pending-administrative-actions') {
        const timer = setTimeout(() => {
          const el = document.getElementById('pending-administrative-actions');
          if (el) {
            const headerOffset = 84;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
            // Clean up URL query param so refresh / normal navigation is not affected
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [targetSection, onClearTargetSection]);

  // Live analytics state from backend
  const [analytics, setAnalytics] = useState<{
    totalWorkers: number;
    pendingKyc: number;
    activeBookings: number;
    completedBookings: number;
    totalUsers: number;
    totalRevenue: number;
  } | null>(null);

  const fetchLiveAnalytics = async () => {
    try {
      const res = await adminService.getAnalytics();
      const data = res?.data || res;
      if (data && (data.totalWorkers !== undefined || data.totalUsers !== undefined)) {
        setAnalytics(data);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Notice fetching analytics:', err);
    }
  };

  useEffect(() => {
    fetchLiveAnalytics();
    const interval = setInterval(fetchLiveAnalytics, 4000);
    return () => clearInterval(interval);
  }, []);

  // Operational Indicator Calculations
  const totalUsersCount = analytics ? analytics.totalUsers : (users.length || 0);
  const totalWorkersCount = analytics ? analytics.totalWorkers : (workers.length || 0);
  const activeJobsCount = analytics ? analytics.activeBookings : jobs.filter((j) => j.status === 'Active').length;
  const pendingComplaintsCount = complaints.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review' || c.status === 'Escalated'
  ).length;
  const pendingPaymentsCount = transactions.filter((t) => t.status === 'Refunded').length;
  const pendingKycCount = analytics ? analytics.pendingKyc : workers.filter((w) => w.approvalStatus === 'Pending').length;

  const pendingActionsList: PendingActionItem[] = [
    {
      id: 'act-1',
      category: 'Pending Worker Profile Reviews',
      code: 'WRK-REVIEW',
      count: pendingKycCount,
      urgency: pendingKycCount > 0 ? 'Immediate' : 'Normal',
      actionLabel: 'Review Profiles',
      icon: HardHat,
      tab: 'workers',
    },
    {
      id: 'act-2',
      category: 'Citizen Grievances & Disputes',
      code: 'GRV-ESCAL',
      count: pendingComplaintsCount,
      urgency: pendingComplaintsCount > 0 ? 'High' : 'Normal',
      actionLabel: 'Adjudicate',
      icon: AlertOctagon,
      tab: 'disputes',
    },
    {
      id: 'act-3',
      category: 'Service Applications Under Scrutiny',
      code: 'OPS-SCRUT',
      count: activeJobsCount,
      urgency: 'Normal',
      actionLabel: 'Inspect Orders',
      icon: Briefcase,
      tab: 'jobs',
    },
    {
      id: 'act-4',
      category: 'Escrow Payout Reconciliations',
      code: 'FIN-AUDIT',
      count: pendingPaymentsCount,
      urgency: pendingPaymentsCount > 0 ? 'High' : 'Normal',
      actionLabel: 'Audit Ledger',
      icon: CreditCard,
      tab: 'payments',
    },
  ];

  const getUrgencyBadge = (urgency: PendingActionItem['urgency']) => {
    switch (urgency) {
      case 'Immediate':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
            Immediate Action
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B26A00]">
            <Clock className="w-3.5 h-3.5 text-[#B26A00] flex-shrink-0" />
            High Priority
          </span>
        );
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C4E80]">
            <FileText className="w-3.5 h-3.5 text-[#1C4E80] flex-shrink-0" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Date Range Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DCE3]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#12355B] tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-[#5B6573] mt-0.5">Platform overview and operational insights.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white rounded-xs border border-[#BAC7D5] p-0.5 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                dateRange === '7d' ? 'bg-[#12355B] text-white' : 'text-[#5B6573] hover:text-[#12355B]'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                dateRange === '30d' ? 'bg-[#12355B] text-white' : 'text-[#5B6573] hover:text-[#12355B]'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange('90d')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                dateRange === '90d' ? 'bg-[#12355B] text-white' : 'text-[#5B6573] hover:text-[#12355B]'
              }`}
            >
              Last 90 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRange('custom')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                dateRange === 'custom' ? 'bg-[#12355B] text-white' : 'text-[#5B6573] hover:text-[#12355B]'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 text-[#5B6573] bg-white border border-[#D5DCE3] hover:bg-[#F4F6F8] hover:text-[#12355B] rounded-xs shadow-xs transition-colors cursor-pointer"
            title="Refresh administrative metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => alert('Generating Administrative Summary Digest (PDF/CSV)...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* TOP COMPACT SUMMARY CARDS (OPERATIONAL INDICATORS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Users */}
        <div
          onClick={() => onSelectTab && onSelectTab('users')}
          className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] hover:border-[#12355B] transition-all shadow-xs cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Total Users</span>
            <div className="p-1 rounded-xs bg-[#EAF2F8] text-[#12355B]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-bold text-xl text-[#12355B]">{totalUsersCount.toLocaleString()}</div>
          <div className="flex items-center justify-between text-[10px] text-[#5B6573]">
            <span>+8.2% this month</span>
            <span className="text-[#1C4E80] font-semibold hover:underline">Manage →</span>
          </div>
        </div>

        {/* Total Workers */}
        <div
          onClick={() => onSelectTab && onSelectTab('workers')}
          className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] hover:border-[#12355B] transition-all shadow-xs cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Total Workers</span>
            <div className="p-1 rounded-xs bg-[#FFF8E1] text-[#E67E22]">
              <HardHat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-bold text-xl text-[#12355B]">{totalWorkersCount.toLocaleString()}</div>
          <div className="flex items-center justify-between text-[10px] text-[#5B6573]">
            <span>+12.4% this month</span>
            <span className="text-[#1C4E80] font-semibold hover:underline">Manage →</span>
          </div>
        </div>

        {/* Active Jobs */}
        <div
          onClick={() => onSelectTab && onSelectTab('jobs')}
          className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] hover:border-[#12355B] transition-all shadow-xs cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Active Jobs</span>
            <div className="p-1 rounded-xs bg-[#EAF2F8] text-[#1C4E80]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-bold text-xl text-[#1C4E80]">{activeJobsCount.toLocaleString()}</div>
          <div className="flex items-center justify-between text-[10px] text-[#5B6573]">
            <span>Dispatched / Active</span>
            <span className="text-[#1C4E80] font-semibold hover:underline">View Jobs →</span>
          </div>
        </div>

        {/* Pending Complaints */}
        <div
          onClick={() => onSelectTab && onSelectTab('disputes')}
          className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] hover:border-[#B42318] transition-all shadow-xs cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B42318]">Pending Complaints</span>
            <div className="p-1 rounded-xs bg-[#FFEBEE] text-[#B42318]">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-bold text-xl text-[#B42318]">{pendingComplaintsCount}</div>
          <div className="flex items-center justify-between text-[10px] text-[#5B6573]">
            <span className="text-[#B42318] font-semibold">Requires Adjudication</span>
            <span className="text-[#B42318] font-semibold hover:underline">Review →</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div
          onClick={() => onSelectTab && onSelectTab('payments')}
          className="bg-white p-3.5 rounded-sm border border-[#D5DCE3] hover:border-[#12355B] transition-all shadow-xs cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">Pending Payments</span>
            <div className="p-1 rounded-xs bg-[#E8F5E9] text-[#2E7D32]">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-bold text-xl text-[#2E7D32]">{pendingPaymentsCount}</div>
          <div className="flex items-center justify-between text-[10px] text-[#5B6573]">
            <span>Escrow & Disbursals</span>
            <span className="text-[#1C4E80] font-semibold hover:underline">Ledger →</span>
          </div>
        </div>
      </div>

      {/* 1. USER GROWTH & 2. WORKER GROWTH (ROW 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UserGrowthChart users={users} dateRange={dateRange} />
        <WorkerGrowthChart workers={workers} dateRange={dateRange} />
      </div>

      {/* 3. JOBS PER DAY (ROW 2) */}
      <div className="grid grid-cols-1 gap-4">
        <JobsPerDayChart jobs={jobs} dateRange={dateRange} />
      </div>

      {/* 4. COMPLETION RATE & 5. POPULAR SERVICES (ROW 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <JobCompletionRateChart jobs={jobs} />
        <PopularServicesChart jobs={jobs} />
      </div>

      {/* 6. GEOGRAPHIC DISTRIBUTION (ROW 4) */}
      <div className="grid grid-cols-1 gap-4">
        <GeographicDistributionChart jobs={jobs} />
      </div>

      {/* 7. PLATFORM EARNINGS (ROW 5) */}
      <div className="grid grid-cols-1 gap-4">
        <PlatformEarningsChart
          commissions={commissions}
          refunds={refunds}
          dateRange={dateRange}
          onNavigateToPayments={() => onSelectTab && onSelectTab('payments')}
        />
      </div>

      {/* PENDING ADMINISTRATIVE ACTIONS TABLE */}
      <div id="pending-administrative-actions" className="bg-white rounded-sm border border-[#D5DCE3] p-4 sm:p-5 shadow-xs scroll-mt-24">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#D5DCE3] mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-sm bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#12355B] uppercase tracking-wide">
                Pending Administrative Actions
              </h2>
              <p className="text-[11px] text-[#5B6573]">Items requiring prompt officer review and departmental scrutiny</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]">
            {pendingActionsList.reduce((sum, a) => sum + a.count, 0)} Total Pending
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-3">Administrative Category</th>
                <th className="py-2 px-3">Section Code</th>
                <th className="py-2 px-3 text-center">Pending Count</th>
                <th className="py-2 px-3">Priority Level</th>
                <th className="py-2 px-3 text-right">Official Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {pendingActionsList.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <tr key={item.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xs bg-[#EAF2F8] text-[#12355B] flex items-center justify-center flex-shrink-0">
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-[#1F2933] text-[11px]">{item.category}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573]">{item.code}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-xs bg-[#12355B] text-white font-mono font-bold text-xs">
                        {item.count}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{getUrgencyBadge(item.urgency)}</td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectTab && onSelectTab(item.tab, item.code === 'WRK-REVIEW' ? 'approvals' : undefined)}
                        className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#E67E22]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <RecentActivity activities={RECENT_ACTIVITIES} onNavigateTab={onSelectTab} />
    </div>
  );
};
