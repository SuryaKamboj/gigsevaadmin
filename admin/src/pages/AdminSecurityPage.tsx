import React, { useState, useMemo, useEffect } from 'react';
import {
  AdminAccountItem,
  LoginActivityItem,
  AuditLogItem,
  SecuritySettingsConfig,
  AdminNavTab,
  SecurityTab,
} from '../types';
import {
  MOCK_ADMIN_ACCOUNTS,
  MOCK_LOGIN_ACTIVITIES,
  MOCK_AUDIT_LOGS,
  MOCK_SECURITY_SETTINGS,
} from '../data/mockData';
import { Pagination } from '../components/Pagination';
import { AdminProfileModal } from '../components/AdminProfileModal';
import { AuditLogDetailsModal } from '../components/AuditLogDetailsModal';
import {
  Users,
  KeyRound,
  History,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  RotateCcw,
  Check,
  Save,
  Globe,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const PAGE_SIZE = 10;

interface AdminSecurityPageProps {
  initialTab?: SecurityTab;
  onTabChange?: (tab: SecurityTab) => void;
  onNavigateToTab?: (tab: AdminNavTab, targetId?: string) => void;
}

export const AdminSecurityPage: React.FC<AdminSecurityPageProps> = ({
  initialTab = 'admin-accounts',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<SecurityTab>(initialTab);

  // Sync with initialTab prop if it changes externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Datasets
  const [adminAccounts] = useState<AdminAccountItem[]>(MOCK_ADMIN_ACCOUNTS);
  const [loginActivities] = useState<LoginActivityItem[]>(MOCK_LOGIN_ACTIVITIES);
  const [auditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsConfig>(MOCK_SECURITY_SETTINGS);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [selectedAdminForModal, setSelectedAdminForModal] = useState<AdminAccountItem | null>(null);
  const [selectedAuditForModal, setSelectedAuditForModal] = useState<AuditLogItem | null>(null);

  // Password Form State (Mock)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security Settings Form State
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  const handleTabChange = (tab: SecurityTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
    setSearchQuery('');
    setStatusFilter('All');
    setRoleFilter('All');
    setModuleFilter('All');
    setCurrentPage(1);
    setPasswordMsg(null);
    setSettingsSavedMsg(false);
  };

  // Section 1: Filtered Admin Accounts
  const filteredAdmins = useMemo(() => {
    return adminAccounts.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (roleFilter !== 'All' && a.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = a.id.toLowerCase().includes(q);
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesEmail = a.email.toLowerCase().includes(q);
        const matchesRole = a.role.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesRole) return false;
      }
      return true;
    });
  }, [adminAccounts, statusFilter, roleFilter, searchQuery]);

  // Section 4: Filtered Login Activities
  const filteredLogins = useMemo(() => {
    return loginActivities.filter((l) => {
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesAdmin = l.adminName.toLowerCase().includes(q) || l.adminId.toLowerCase().includes(q);
        const matchesIp = l.ipAddress.toLowerCase().includes(q);
        const matchesLocation = l.location.toLowerCase().includes(q);
        const matchesAct = l.activity.toLowerCase().includes(q);
        if (!matchesAdmin && !matchesIp && !matchesLocation && !matchesAct) return false;
      }
      return true;
    });
  }, [loginActivities, statusFilter, searchQuery]);

  // Section 5: Filtered Audit Logs
  const filteredAudits = useMemo(() => {
    return auditLogs.filter((aud) => {
      if (moduleFilter !== 'All' && aud.module !== moduleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRecord = aud.recordId.toLowerCase().includes(q);
        const matchesAdmin = aud.adminName.toLowerCase().includes(q) || aud.adminId.toLowerCase().includes(q);
        const matchesAction = aud.action.toLowerCase().includes(q);
        const matchesDetails = aud.details.toLowerCase().includes(q);
        if (!matchesRecord && !matchesAdmin && !matchesAction && !matchesDetails) return false;
      }
      return true;
    });
  }, [auditLogs, moduleFilter, searchQuery]);

  // Paginated Slices
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAdmins.slice(start, start + PAGE_SIZE);
  }, [filteredAdmins, currentPage]);

  const paginatedLogins = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogins.slice(start, start + PAGE_SIZE);
  }, [filteredLogins, currentPage]);

  const paginatedAudits = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAudits.slice(start, start + PAGE_SIZE);
  }, [filteredAudits, currentPage]);

  // Handle Mock Password Change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ text: 'Current password is required.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }
    setPasswordMsg({ text: 'Password successfully updated in security credential vault.', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#D5DCE3]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#12355B] tracking-tight">Admin & Security</h1>
        <p className="text-xs text-[#5B6573] mt-0.5">
          Administrative officer accounts, access control policies, login diagnostics, and audit registers.
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#BAC7D5] overflow-x-auto bg-white rounded-t-sm px-2 pt-1 gap-1 shadow-xs">
        {[
          { id: 'admin-accounts' as SecurityTab, label: 'Admin Accounts', count: adminAccounts.length, icon: Users },
          { id: 'roles-permissions' as SecurityTab, label: 'Roles & Permissions', icon: ShieldCheck, isPlaceholder: true },
          { id: 'login-security' as SecurityTab, label: 'Login & Security', icon: Lock },
          { id: 'login-activity' as SecurityTab, label: 'Login Activity', count: loginActivities.length, icon: KeyRound },
          { id: 'audit-logs' as SecurityTab, label: 'Audit Logs', count: auditLogs.length, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#12355B] text-[#12355B] bg-[#F4F6F8]'
                  : 'border-transparent text-[#5B6573] hover:text-[#12355B] hover:bg-[#F4F6F8]/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#12355B]' : 'text-[#5B6573]'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-xs font-mono text-[10px] ${
                    isActive ? 'bg-[#12355B] text-white' : 'bg-[#EAF2F8] text-[#12355B]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.isPlaceholder && (
                <span className="text-[9px] uppercase font-bold text-[#87A2C0] bg-[#EAF2F8] px-1 py-0.2 rounded-xs">
                  Phase 2
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div className="bg-white rounded-b-sm border border-[#D5DCE3] p-4 sm:p-5 shadow-xs">
        {/* ========================================================================= */}
        {/* TAB 1: ADMIN ACCOUNTS */}
        {/* ========================================================================= */}
        {activeTab === 'admin-accounts' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6573]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Admin ID, Name, Email, Role..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#5B6573] focus:outline-none focus:border-[#12355B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                >
                  <option value="All">All Roles</option>
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Dispute Adjudicator">Dispute Adjudicator</option>
                  <option value="Operations Officer">Operations Officer</option>
                  <option value="Finance Auditor">Finance Auditor</option>
                  <option value="Support Supervisor">Support Supervisor</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setRoleFilter('All');
                  }}
                  className="p-1.5 text-[#5B6573] hover:text-[#12355B] bg-white border border-[#BAC7D5] rounded-xs"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Admin Table */}
            <div className="overflow-x-auto border border-[#D5DCE3] rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Admin ID</th>
                    <th className="py-2.5 px-3">Officer Name</th>
                    <th className="py-2.5 px-3">Official Email</th>
                    <th className="py-2.5 px-3">Departmental Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Login</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#5B6573]">
                        No administrative officer accounts match your query.
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#12355B] whitespace-nowrap">
                          {admin.id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#1F2933]">
                          {admin.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573]">
                          {admin.email}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1C4E80]">
                          {admin.role}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {admin.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
                              <ShieldAlert className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573] whitespace-nowrap">
                          {admin.lastLoginDate} ({admin.lastLoginTime})
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedAdminForModal(admin)}
                            className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                            title="View admin officer profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAdmins.length / PAGE_SIZE)}
              totalItems={filteredAdmins.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              itemLabel="admins"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ROLES & PERMISSIONS (PLACEHOLDER ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'roles-permissions' && (
          <div className="p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-sm bg-[#EAF2F8] text-[#12355B] border border-[#BAC7D5] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#E67E22] bg-[#FFF8E1] px-2 py-0.5 rounded-xs border border-[#FFE082]">
                Coming Soon • Phase 2
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#12355B] pt-1">Roles & Permissions</h3>
              <p className="text-xs text-[#5B6573] leading-relaxed">
                Role and permission management will be available here. Departmental access matrices and policy delegation
                rules are currently provisioned through standard security tiers.
              </p>
            </div>

            <div className="p-3 bg-[#F4F6F8] rounded-xs border border-[#D5DCE3] text-xs text-left space-y-1 text-[#5B6573]">
              <span className="font-bold text-[#1F2933] block text-[11px]">Active System Tier:</span>
              <p>• Super Administrator (Full Read/Write/Adjudicate)</p>
              <p>• Dispute Adjudicator (Complaints & Redressal Cell)</p>
              <p>• Operations & Workforce Officer (Field Registry)</p>
              <p>• Finance Auditor (Escrow Ledger & DBT Disbursals)</p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LOGIN & SECURITY SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'login-security' && (
          <div className="space-y-6 max-w-4xl">
            {/* 1. Change Password */}
            <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#BAC7D5]">
                <KeyRound className="w-4 h-4 text-[#12355B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                  1. Update Administrative Password
                </h4>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#5B6573] block mb-1">
                    Current Master Password *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current administrative password"
                    className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5B6573] block mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#5B6573] block mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full text-xs p-2 bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                    />
                  </div>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-2 rounded-xs text-xs font-semibold ${
                      passwordMsg.type === 'success'
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                        : 'bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* 2. Two-Factor Authentication */}
            <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#BAC7D5]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    2. Two-Factor Authentication (2FA)
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                    securitySettings.twoFactorRequired
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                      : 'bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]'
                  }`}
                >
                  {securitySettings.twoFactorRequired ? 'Status: Enabled' : 'Status: Disabled'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-3 rounded-xs border border-[#BAC7D5]">
                <div>
                  <span className="font-bold text-[#1F2933] block">Enforce 2FA on All Administrator Logins</span>
                  <p className="text-[11px] text-[#5B6573]">
                    Requires secondary TOTP authenticator code or SMS token upon password verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSecuritySettings({
                      ...securitySettings,
                      twoFactorRequired: !securitySettings.twoFactorRequired,
                    });
                    setSettingsSavedMsg(true);
                  }}
                  className={`px-3 py-1.5 rounded-xs font-semibold text-xs border transition-colors cursor-pointer ${
                    securitySettings.twoFactorRequired
                      ? 'bg-[#FFEBEE] text-[#B42318] border-[#FFCDD2] hover:bg-[#FFCDD2]'
                      : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9]'
                  }`}
                >
                  {securitySettings.twoFactorRequired ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>

            {/* 3. Session Timeout & Policy Controls */}
            <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#BAC7D5]">
                <Clock className="w-4 h-4 text-[#1C4E80]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                  3. Session Timeout & Inactivity Policy
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3 rounded-xs border border-[#BAC7D5] space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#5B6573] block">
                    Administrative Session Timeout
                  </label>
                  <select
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeoutMinutes: Number(e.target.value),
                      });
                      setSettingsSavedMsg(true);
                    }}
                    className="w-full p-2 text-xs bg-white border border-[#BAC7D5] rounded-xs font-semibold"
                  >
                    <option value={15}>15 Minutes Inactivity</option>
                    <option value={30}>30 Minutes Inactivity (Standard)</option>
                    <option value={60}>60 Minutes Inactivity</option>
                    <option value={120}>120 Minutes Inactivity</option>
                  </select>
                  <p className="text-[10px] text-[#5B6573]">
                    Automatically terminates session token upon exceeding idle period.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xs border border-[#BAC7D5] space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-[#5B6573] block">
                    Account Lockout Threshold
                  </label>
                  <select
                    value={securitySettings.maxFailedAttempts}
                    onChange={(e) => {
                      setSecuritySettings({
                        ...securitySettings,
                        maxFailedAttempts: Number(e.target.value),
                      });
                      setSettingsSavedMsg(true);
                    }}
                    className="w-full p-2 text-xs bg-white border border-[#BAC7D5] rounded-xs font-semibold"
                  >
                    <option value={3}>3 Failed Login Attempts</option>
                    <option value={5}>5 Failed Login Attempts (Standard)</option>
                    <option value={10}>10 Failed Login Attempts</option>
                  </select>
                  <p className="text-[10px] text-[#5B6573]">
                    Locks officer credentials for 30 minutes upon reaching threshold.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Login Alerts */}
            <div className="p-4 rounded-sm border border-[#D5DCE3] bg-[#F4F6F8] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#BAC7D5]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#12355B]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
                    4. Security Alerts & Notifications
                  </h4>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-xs border border-[#BAC7D5] text-xs">
                <div>
                  <span className="font-bold text-[#1F2933] block">Unrecognized IP / Device Login Alerts</span>
                  <p className="text-[11px] text-[#5B6573]">
                    Dispatches instant SMS and email alert to officer upon login from unregistered IP addresses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSecuritySettings({
                      ...securitySettings,
                      loginAlertsEnabled: !securitySettings.loginAlertsEnabled,
                    });
                    setSettingsSavedMsg(true);
                  }}
                  className={`px-3 py-1.5 rounded-xs font-semibold text-xs border transition-colors cursor-pointer ${
                    securitySettings.loginAlertsEnabled
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                      : 'bg-[#F4F6F8] text-[#5B6573] border-[#BAC7D5]'
                  }`}
                >
                  {securitySettings.loginAlertsEnabled ? 'Alerts Active' : 'Alerts Disabled'}
                </button>
              </div>
            </div>

            {settingsSavedMsg && (
              <div className="p-2.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-xs text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Security policy parameters updated in system register.</span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LOGIN ACTIVITY (VIEW-ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'login-activity' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6573]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Admin ID, Name, IP, Location..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#5B6573] focus:outline-none focus:border-[#12355B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Successful">Successful</option>
                  <option value="Failed">Failed</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                  className="p-1.5 text-[#5B6573] hover:text-[#12355B] bg-white border border-[#BAC7D5] rounded-xs"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Login Activity Table */}
            <div className="overflow-x-auto border border-[#D5DCE3] rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Admin Officer</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Device / Browser</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Activity Action</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedLogins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#5B6573]">
                        No login activity records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogins.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573] whitespace-nowrap">
                          {item.date} • {item.time}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#1F2933] block">{item.adminName}</span>
                          <span className="font-mono text-[10px] text-[#5B6573]">{item.adminId}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#12355B]">
                          {item.ipAddress}
                        </td>
                        <td className="py-2.5 px-3 text-[#5B6573] text-[11px]">
                          {item.device}
                        </td>
                        <td className="py-2.5 px-3 text-[#1F2933] font-semibold text-[11px]">
                          {item.location}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-[#1F2933] block">{item.activity}</span>
                          {item.failureReason && (
                            <span className="text-[10px] text-[#B42318] block mt-0.5 italic">
                              Reason: {item.failureReason}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {item.status === 'Successful' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] flex-shrink-0" />
                              Successful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B42318]">
                              <XCircle className="w-3.5 h-3.5 text-[#B42318] flex-shrink-0" />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#5B6573] italic">
                Read-only security activity audit register (Immutable)
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredLogins.length / PAGE_SIZE)}
                totalItems={filteredLogins.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setCurrentPage(page)}
                itemLabel="records"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUDIT LOGS (VIEW-ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'audit-logs' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F4F6F8] rounded-xs border border-[#BAC7D5]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B6573]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Record ID, Action, Officer, Details..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#5B6573] focus:outline-none focus:border-[#12355B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933]"
                >
                  <option value="All">All Modules</option>
                  <option value="Worker Management">Worker Management</option>
                  <option value="User Management">User Management</option>
                  <option value="Job Management">Job Management</option>
                  <option value="Disputes & Complaints">Disputes & Complaints</option>
                  <option value="Payments & Finance">Payments & Finance</option>
                  <option value="Admin & Security">Admin & Security</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setModuleFilter('All');
                  }}
                  className="p-1.5 text-[#5B6573] hover:text-[#12355B] bg-white border border-[#BAC7D5] rounded-xs"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto border border-[#D5DCE3] rounded-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Admin Officer</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Action Executed</th>
                    <th className="py-2.5 px-3">Record ID</th>
                    <th className="py-2.5 px-3">Details Summary</th>
                    <th className="py-2.5 px-3 text-right">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {paginatedAudits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#5B6573]">
                        No departmental audit log records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAudits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573] whitespace-nowrap">
                          {aud.date} • {aud.time}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-[#1F2933] block">{aud.adminName}</span>
                          <span className="font-mono text-[10px] text-[#5B6573]">{aud.adminId}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-[#1C4E80] text-[11px]">
                            {aud.module}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#1F2933] whitespace-nowrap">
                          {aud.action}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#12355B] whitespace-nowrap">
                          {aud.recordId}
                        </td>
                        <td className="py-2.5 px-3 text-[#5B6573] text-[11px] max-w-xs truncate">
                          {aud.details}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedAuditForModal(aud)}
                            className="inline-flex items-center gap-1.5 py-1 px-1.5 text-xs font-semibold text-[#12355B] hover:text-[#1C4E80] hover:underline transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#12355B] rounded-xs"
                            title="View audit ledger details"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#12355B] flex-shrink-0" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#5B6573] italic">
                Statutory audit log registry • Read-only and immutable
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAudits.length / PAGE_SIZE)}
                totalItems={filteredAudits.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => setCurrentPage(page)}
                itemLabel="records"
              />
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AdminProfileModal
        isOpen={!!selectedAdminForModal}
        admin={selectedAdminForModal}
        onClose={() => setSelectedAdminForModal(null)}
      />

      <AuditLogDetailsModal
        isOpen={!!selectedAuditForModal}
        log={selectedAuditForModal}
        onClose={() => setSelectedAuditForModal(null)}
      />
    </div>
  );
};
