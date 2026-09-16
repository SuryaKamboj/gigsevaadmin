import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Shield,
  ChevronDown,
  ChevronUp,
  Landmark,
  CheckCircle2,
  Users,
  KeyRound,
  ShieldCheck,
  Clock,
  FileText,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { AdminNavTab, SecurityTab, AuthUserSession } from '../types';

interface AdminHeaderProps {
  activeTab: AdminNavTab;
  activeSecurityTab?: SecurityTab;
  currentSession?: AuthUserSession | null;
  onOpenMobileSidebar: () => void;
  onNavigateToSecuritySection?: (section: SecurityTab) => void;
  onNotificationClick?: () => void;
  onLogout?: () => void;
}


interface SecurityMenuOption {
  id: SecurityTab;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECURITY_OPTIONS: SecurityMenuOption[] = [
  {
    id: 'admin-accounts',
    label: 'Admin Accounts',
    subtitle: 'Manage administrative users',
    icon: Users,
  },
  {
    id: 'roles-permissions',
    label: 'Roles & Permissions',
    subtitle: 'Access rights & privileges',
    icon: KeyRound,
  },
  {
    id: 'login-security',
    label: 'Login & Security',
    subtitle: 'Password policy & 2FA controls',
    icon: ShieldCheck,
  },
  {
    id: 'login-activity',
    label: 'Login Activity',
    subtitle: 'Audit session authentication',
    icon: Clock,
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    subtitle: 'Administrative event audit trail',
    icon: FileText,
  },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  activeSecurityTab = 'admin-accounts',
  currentSession,
  onOpenMobileSidebar,
  onNavigateToSecuritySection,
  onNotificationClick,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSocietyRole = currentSession?.role === 'society_member';
  const roleTitle = currentSession?.roleTitle || (isSocietyRole ? 'Society Administrative Member' : 'Admin Officer');
  const roleUserId = currentSession?.userId || (isSocietyRole ? 'SOC-7821' : 'ADM-001');


  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard & Operational Overview';
      case 'users':
        return 'User Management';
      case 'workers':
        return 'Worker Management';
      case 'jobs':
        return 'Job Management';
      case 'disputes':
        return 'Disputes & Complaints';
      case 'payments':
        return 'Payments & Settlement Audit';
      case 'security':
        return 'Admin & Security Control Center';
      default:
        return 'Administrative Portal';
    }
  };

  const handleSelectSecuritySection = (sectionId: SecurityTab) => {
    setIsDropdownOpen(false);
    if (onNavigateToSecuritySection) {
      onNavigateToSecuritySection(sectionId);
    }
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="relative bg-[#FFFFFF] border-b border-[#D5DCE3] sticky top-0 z-30 shadow-xs">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile menu toggle + Department Identity / Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            type="button"
            className="md:hidden w-9 h-9 rounded-md bg-[#F4F6F8] hover:bg-[#EAF2F8] border border-[#D5DCE3] flex items-center justify-center text-[#12355B] cursor-pointer transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-sm bg-[#12355B] text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6573]">
                  Department Administration
                </span>
                <span className="text-[#BAC7D5] hidden sm:inline">•</span>
                <span className="text-[11px] font-medium text-[#5B6573] hidden sm:inline">
                  Operations & Workforce Registry
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#12355B] leading-tight">
                {getTabTitle()}
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Security Badge, Notification & Officer Profile Dropdown Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security status indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>PORTAL SECURE • LIVE</span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label="View notifications"
            className="relative w-8 h-8 rounded-sm bg-[#FFFFFF] hover:bg-[#F4F6F8] border border-[#D5DCE3] flex items-center justify-center text-[#5B6573] hover:text-[#12355B] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E67E22] rounded-full ring-1 ring-white" />
          </button>

          {/* Officer profile area with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className={`flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 py-1 pr-1.5 sm:pr-2 rounded-sm border transition-all cursor-pointer select-none ${
                isDropdownOpen
                  ? 'bg-[#EAF2F8] border-[#12355B] shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-[#F4F6F8] border-l-[#D5DCE3]'
              }`}
              title="Admin Officer Account & Security Menu"
            >
              <div className="w-8 h-8 rounded-sm bg-[#12355B] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#1F2933] leading-none truncate max-w-[120px]">
                  {currentSession?.name || roleTitle}
                </p>
                <p className="text-[10px] text-[#5B6573] mt-0.5 leading-none">
                  {isSocietyRole ? 'Society Member' : 'Federation Officer'}
                </p>
              </div>

              <div className="text-[#5B6573] pl-0.5 flex items-center justify-center">
                {isDropdownOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#12355B]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#5B6573]" />
                )}
              </div>
            </button>

            {/* Dropdown Menu Container */}
            {isDropdownOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 top-full mt-1.5 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] bg-white border border-[#D5DCE3] rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs"
              >
                {/* Identity Header */}
                <div className="p-3 bg-[#F4F6F8] border-b border-[#D5DCE3]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xs bg-[#12355B] text-white flex items-center justify-center font-bold text-xs">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1F2933] text-xs truncate leading-tight">
                        {currentSession?.name || roleTitle}
                      </p>
                      <p className="text-[10px] text-[#5B6573] font-mono truncate mt-0.5">
                        {roleUserId} • {isSocietyRole ? 'Society Member' : 'Federation Admin'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#5B6573]">
                    <span className="font-semibold uppercase tracking-wider text-[#12355B]">
                      {isSocietyRole ? 'Society Level' : 'Admin & Security'}
                    </span>
                    <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 border border-[#BAC7D5] rounded-xs font-bold text-[#2E7D32]">
                      {currentSession?.securityLevel || 'SEC-LEVEL 4'}
                    </span>
                  </div>
                </div>

                {/* Navigation Links to all 5 sections */}
                <div className="py-1 divide-y divide-[#F1F5F9]">
                  {SECURITY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = activeTab === 'security' && activeSecurityTab === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectSecuritySection(option.id)}
                        className={`w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center justify-between transition-colors cursor-pointer group ${
                          isActive
                            ? 'bg-[#EAF2F8] text-[#12355B] font-bold border-l-3 border-[#12355B]'
                            : 'text-[#1F2933] hover:bg-[#F4F6F8] hover:text-[#12355B] border-l-3 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-xs flex-shrink-0 transition-colors ${
                              isActive
                                ? 'bg-[#12355B] text-white'
                                : 'bg-[#F4F6F8] text-[#5B6573] group-hover:bg-[#EAF2F8] group-hover:text-[#12355B]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-xs truncate ${
                                isActive ? 'font-bold text-[#12355B]' : 'font-medium text-[#1F2933] group-hover:text-[#12355B]'
                              }`}
                            >
                              {option.label}
                            </p>
                            <p className="text-[10px] text-[#5B6573] truncate leading-tight">
                              {option.subtitle}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                            isActive
                              ? 'text-[#12355B] translate-x-0.5'
                              : 'text-[#BAC7D5] group-hover:text-[#12355B] group-hover:translate-x-0.5'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Logout Action */}
                {onLogout && (
                  <div className="p-1.5 border-t border-[#D5DCE3] bg-[#F8FAFC]">
                    <button
                      type="button"
                      onClick={handleLogoutClick}
                      className="w-full px-3 py-2 text-xs font-bold text-[#B42318] hover:bg-[#FFEBEE] rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout / Switch Role</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Government Accent Line */}
      <div className="h-[2.5px] w-full flex">
        <div className="w-1/3 bg-[#E67E22]" />
        <div className="w-1/3 bg-[#12355B]" />
        <div className="w-1/3 bg-[#2E7D32]" />
      </div>
    </header>
  );
};

export default AdminHeader;
