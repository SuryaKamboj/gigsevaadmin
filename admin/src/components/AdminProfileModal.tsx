import React from 'react';
import { AdminAccountItem } from '../types';
import { X, Shield, Mail, Phone, Building2, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  admin: AdminAccountItem | null;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, admin, onClose }) => {
  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-white rounded-sm max-w-lg w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-[#1C4E80] text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                  Officer Administrative Profile
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#E67E22] font-bold rounded-xs text-white">
                  {admin.id}
                </span>
              </div>
              <p className="text-[10px] text-[#A5B9CC]">Government Operations Portal Access Dossier</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-[#F4F6F8]">
          {/* Main Card */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs flex items-center gap-4">
            <div className="w-16 h-16 rounded-xs bg-[#12355B] text-white flex items-center justify-center overflow-hidden border border-[#BAC7D5] flex-shrink-0">
              {admin.avatar ? (
                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-8 h-8 text-[#87A2C0]" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#1F2933] truncate">{admin.name}</h4>
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                    admin.status === 'Active'
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                      : 'bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]'
                  }`}
                >
                  {admin.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#1C4E80] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#5B6573]" />
                <span>{admin.role}</span>
              </div>
              <p className="text-[11px] text-[#5B6573]">{admin.department}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white p-4 rounded-sm border border-[#D5DCE3] shadow-xs space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] block pb-1 border-b border-[#D5DCE3]">
              Administrative Credentials & Access
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Official Email</span>
                <div className="flex items-center gap-1 mt-0.5 text-[#1F2933] font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#1C4E80]" />
                  <span>{admin.email}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Contact Mobile</span>
                <div className="flex items-center gap-1 mt-0.5 text-[#1F2933] font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#1C4E80]" />
                  <span>{admin.mobile}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Provisioned Date</span>
                <div className="flex items-center gap-1 mt-0.5 text-[#1F2933]">
                  <Calendar className="w-3.5 h-3.5 text-[#5B6573]" />
                  <span>{admin.createdDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6573] block">Last Login Recorded</span>
                <div className="flex items-center gap-1 mt-0.5 text-[#1F2933] font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#5B6573]" />
                  <span>
                    {admin.lastLoginDate} • {admin.lastLoginTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D5DCE3] flex items-center justify-between">
              <span className="text-[11px] text-[#5B6573]">Two-Factor Authentication (2FA):</span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-xs ${
                  admin.twoFactorEnabled
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                    : 'bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]'
                }`}
              >
                {admin.twoFactorEnabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {admin.twoFactorEnabled ? '2FA Active (TOTP)' : '2FA Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D5DCE3] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] hover:bg-[#EAF2F8] rounded-xs cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
