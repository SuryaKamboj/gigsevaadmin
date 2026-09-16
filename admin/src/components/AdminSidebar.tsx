import React from 'react';
import {
  LayoutDashboard,
  Users,
  HardHat,
  Briefcase,
  AlertOctagon,
  CreditCard,
  ShieldCheck,
  X,
  Landmark,
  LogOut,
} from 'lucide-react';
import { AdminNavTab, AuthUserSession } from '../types';


interface AdminSidebarProps {
  activeTab: AdminNavTab;
  currentSession?: AuthUserSession | null;
  onSelectTab: (tab: AdminNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}


export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  currentSession,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}) => {
  const primaryNavItems = [
    { id: 'dashboard' as AdminNavTab, label: 'Dashboard', icon: LayoutDashboard, isReady: true },
    { id: 'users' as AdminNavTab, label: 'User Management', icon: Users, isReady: true },
    { id: 'workers' as AdminNavTab, label: 'Worker Management', icon: HardHat, isReady: true },
    { id: 'jobs' as AdminNavTab, label: 'Job Management', icon: Briefcase, isReady: true },
  ];

  const administrativeNavItems = [
    { id: 'disputes' as AdminNavTab, label: 'Disputes & Complaints', icon: AlertOctagon, isReady: true },
    { id: 'payments' as AdminNavTab, label: 'Payments', icon: CreditCard, isReady: true },
    { id: 'security' as AdminNavTab, label: 'Admin & Security', icon: ShieldCheck, isReady: true },
  ];

  const handleNavClick = (tabId: AdminNavTab, isReady: boolean) => {
    if (isReady) {
      onSelectTab(tabId);
      onCloseMobile();
    }
  };

  const renderNavButton = (item: { id: AdminNavTab; label: string; icon: React.ElementType; isReady: boolean }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavClick(item.id, item.isReady)}
        disabled={!item.isReady}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-sm transition-all duration-100 relative ${
          isActive
            ? 'bg-[#1C4E80] text-white font-semibold'
            : item.isReady
            ? 'text-[#B0C4DE] hover:bg-[#163E66] hover:text-white cursor-pointer'
            : 'text-[#627D98] opacity-60 cursor-not-allowed'
        }`}
      >
        {/* Active Left Saffron Indicator */}
        {isActive && (
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#E67E22] rounded-r-sm" />
        )}

        <div className="flex items-center gap-2.5 pl-1 min-w-0">
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#87A2C0]'}`} />
          <span className="truncate">{item.label}</span>
        </div>

        {!item.isReady && (
          <span className="text-[9px] uppercase font-bold text-[#87A2C0] bg-[#0D2642] px-1.5 py-0.5 rounded-sm border border-[#1C4E80]/40">
            Phase 2
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#12355B] text-white w-64 select-none border-r border-[#0B223B]">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1C4E80]/60 bg-[#0E2C4D]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[#1C4E80] border border-[#2A65A0] flex items-center justify-center text-white flex-shrink-0">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-white">GigSevak</span>
              <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 bg-[#E67E22] text-white rounded-xs">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#A5B9CC] truncate font-medium">Departmental Portal</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden w-7 h-7 rounded-sm bg-[#1C4E80] hover:bg-[#2A65A0] flex items-center justify-center text-white cursor-pointer"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7E9BB8]">
            Core Operations & Registry
          </div>
          <div className="space-y-0.5">
            {primaryNavItems.map(renderNavButton)}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7E9BB8]">
            Administration & Finance
          </div>
          <div className="space-y-0.5">
            {administrativeNavItems.map(renderNavButton)}
          </div>
        </div>
      </nav>

      {/* Government Portal Officer Info & Department Footer */}
      <div className="p-3 border-t border-[#1C4E80]/60 bg-[#0E2C4D] space-y-2">
        <div className="bg-[#12355B] p-2.5 rounded-sm border border-[#1C4E80] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#87A2C0]">
              Officer Designation
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" title="Active Session" />
          </div>
          <p className="text-xs font-bold text-white truncate">
            {currentSession?.name || 'Administrative Officer'}
          </p>
          <p className="text-[10px] text-[#87A2C0] truncate font-mono">
            ID: {currentSession?.userId || 'GOV-ADM-9241'}
          </p>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-1.5 px-2 bg-[#12355B] hover:bg-[#8B0000]/80 border border-[#1C4E80] text-white hover:text-white rounded-sm text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#E67E22]" />
            <span>Logout Session</span>
          </button>
        )}

        <div className="text-center text-[9px] text-[#7E9BB8]">
          Operations Administration v2.4
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 z-40 w-64 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 flex">
          <div className="w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
};
