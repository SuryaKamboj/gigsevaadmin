import React from 'react';
import { ShieldCheck, X, ShieldAlert } from 'lucide-react';
import { WorkerItem } from '../types';

interface WorkerConfirmationModalProps {
  isOpen: boolean;
  worker: WorkerItem | null;
  action: 'activate' | 'deactivate' | 'suspend' | 'restore' | 'block' | 'unblock' | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const WorkerConfirmationModal: React.FC<WorkerConfirmationModalProps> = ({
  isOpen,
  worker,
  action,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !worker || !action) return null;

  const isDestructive = action === 'block' || action === 'suspend' || action === 'deactivate';

  const getActionTitle = () => {
    switch (action) {
      case 'activate':
        return 'Activate Worker Account';
      case 'deactivate':
        return 'Deactivate Worker Account';
      case 'block':
        return 'Block Worker Account';
      case 'suspend':
        return 'Suspend Worker Privileges';
      case 'restore':
        return 'Restore Worker Account';
      case 'unblock':
        return 'Unblock Worker Account';
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'activate':
        return `Are you sure you want to activate ${worker.name} (${worker.id})? The worker will be authorized for job assignments and registry discovery.`;
      case 'deactivate':
        return `Are you sure you want to mark ${worker.name} (${worker.id}) as Inactive? The worker account will be placed in dormant status.`;
      case 'block':
        return `Are you sure you want to block ${worker.name} (${worker.id})? This action will prevent the worker from accessing platform dispatches and payouts pending administrative review.`;
      case 'suspend':
        return `Are you sure you want to suspend ${worker.name} (${worker.id})? This will temporarily halt job dispatches.`;
      case 'restore':
        return `Are you sure you want to restore active status for ${worker.name} (${worker.id})?`;
      case 'unblock':
        return `Are you sure you want to unblock ${worker.name} (${worker.id})?`;
    }
  };

  const getConfirmButtonText = () => {
    switch (action) {
      case 'activate':
        return 'Yes, Activate Worker';
      case 'deactivate':
        return 'Yes, Mark Inactive';
      case 'block':
        return 'Yes, Block Worker';
      case 'suspend':
        return 'Yes, Suspend Worker';
      case 'restore':
        return 'Yes, Restore Worker';
      case 'unblock':
        return 'Yes, Unblock Worker';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-sm max-w-md w-full shadow-lg border border-[#D5DCE3] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between text-white ${isDestructive ? (action === 'block' ? 'bg-[#B42318]' : 'bg-[#12355B]') : 'bg-[#12355B]'}`}>
          <div className="flex items-center gap-2">
            {action === 'block' ? <ShieldAlert className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
            <div>
              <h3 className="text-sm font-bold tracking-tight uppercase">
                {getActionTitle()}
              </h3>
              <p className="text-[10px] text-white/80 font-mono">Action Ref: SEC-WRK-{action.toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-xs hover:bg-black/20 transition-colors cursor-pointer"
            aria-label="Close confirmation dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Worker Record Summary Box */}
          <div className="bg-[#F4F6F8] rounded-sm p-3 border border-[#D5DCE3]">
            <div className="flex items-center gap-3">
              <img
                src={worker.image}
                alt={worker.name}
                className="w-10 h-10 rounded-sm object-cover border border-[#BAC7D5]"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[#1F2933] text-xs">{worker.name}</div>
                <div className="text-[10px] text-[#5B6573] font-mono">ID: {worker.id} • {worker.category}</div>
              </div>
              <span
                className={`text-[11px] font-bold ${
                  worker.status === 'Active'
                    ? 'text-[#2E7D32]'
                    : worker.status === 'Suspended'
                    ? 'text-[#B26A00]'
                    : worker.status === 'Inactive'
                    ? 'text-[#5B6573]'
                    : 'text-[#B42318]'
                }`}
              >
                {worker.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#5B6573] leading-relaxed">
            {getActionDescription()}
          </p>

          <div className="p-2.5 rounded-xs bg-[#FFF8E1] border border-[#FFE082] text-[11px] text-[#B26A00]">
            <span className="font-bold">Administrative Protocol:</span> All worker status modifications are cryptographically audited with officer timestamp.
          </div>
        </div>

        <div className="p-3 bg-[#F4F6F8] border-t border-[#D5DCE3] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`px-4 py-1.5 text-xs font-semibold text-white rounded-xs transition-colors cursor-pointer shadow-xs ${
              action === 'block'
                ? 'bg-[#B42318] hover:bg-[#911810]'
                : action === 'suspend'
                ? 'bg-[#B26A00] hover:bg-[#915600]'
                : 'bg-[#12355B] hover:bg-[#0B223B]'
            }`}
          >
            {getConfirmButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
