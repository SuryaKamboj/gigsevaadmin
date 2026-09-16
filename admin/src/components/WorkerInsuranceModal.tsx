import React, { useState } from 'react';
import { WorkerItem, InsuranceStatus } from '../types';
import { X, ShieldCheck, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

interface WorkerInsuranceModalProps {
  isOpen: boolean;
  worker: WorkerItem | null;
  onClose: () => void;
  onSubmitApplication: (
    workerId: string,
    planName: string,
    coverage: string,
    status: InsuranceStatus,
    rejectionReason?: string
  ) => void;
}

const INSURANCE_PLANS = [
  'Basic Worker Protection Plan',
  'Comprehensive Gig Worker Accidental & Health Cover',
  'High-Risk Electrical & Occupational Hazard Safety Plan',
];

export const WorkerInsuranceModal: React.FC<WorkerInsuranceModalProps> = ({
  isOpen,
  worker,
  onClose,
  onSubmitApplication,
}) => {
  if (!isOpen || !worker) return null;

  const currentInsurance = worker.insurance || {
    status: 'Not Applied',
    planName: 'Basic Worker Protection Plan',
    coverage: '₹5,00,000',
  };

  const isApplyingNew = currentInsurance.status === 'Not Applied' || currentInsurance.status === 'Rejected';

  const [planName, setPlanName] = useState(currentInsurance.planName || 'Basic Worker Protection Plan');
  const [coverage, setCoverage] = useState(currentInsurance.coverage || '₹5,00,000');
  const [status, setStatus] = useState<InsuranceStatus>(
    isApplyingNew ? 'Application Submitted' : currentInsurance.status
  );
  const [rejectionReason, setRejectionReason] = useState(currentInsurance.rejectionReason || '');
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitApplication(worker.id, planName, coverage, status, rejectionReason);
    setSubmittedFeedback(true);
    setTimeout(() => {
      setSubmittedFeedback(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/65 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-sm max-w-lg w-full shadow-2xl border border-[#D5DCE3] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xs bg-[#1C4E80] text-white flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                {isApplyingNew ? 'Apply for Worker Social Security Insurance' : 'Manage Worker Insurance Policy'}
              </h3>
              <p className="text-[10px] text-[#A5B9CC] font-mono">Worker ID: {worker.id} • Scheme: SEC-INS-GIG</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xs bg-[#0E2C4D] hover:bg-[#1C4E80] text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1C4E80]"
            aria-label="Close insurance modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedFeedback ? (
          <div className="p-8 text-center space-y-3 bg-[#F4F6F8]">
            <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-[#1F2933]">Insurance Application Submitted</h4>
            <p className="text-xs text-[#5B6573]">
              Application record logged under State Gig Security Scheme. Administrative status updated to <span className="font-semibold text-[#12355B]">{status}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col text-xs">
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Worker Information Summary (Read-Only) */}
              <div className="bg-[#F4F6F8] p-3 rounded-sm border border-[#D5DCE3] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] block border-b border-[#D5DCE3] pb-1">
                  Insured Worker Details (Read-Only)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5B6573]">Worker Name:</span>
                    <p className="font-bold text-[#1F2933]">{worker.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6573]">Worker ID:</span>
                    <p className="font-mono font-bold text-[#12355B]">{worker.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6573]">Mobile Number:</span>
                    <p className="font-mono text-[#1F2933]">{worker.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5B6573]">Service Category:</span>
                    <p className="font-semibold text-[#1F2933]">{worker.category}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#5B6573]">Service Area:</span>
                    <p className="text-[#1F2933]">{worker.serviceArea}</p>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Insurance Plan *
                  </label>
                  <select
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] font-semibold focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                  >
                    {INSURANCE_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                      Coverage Amount *
                    </label>
                    <select
                      value={coverage}
                      onChange={(e) => setCoverage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] font-mono font-semibold focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                    >
                      <option value="₹2,50,000">₹2,50,000</option>
                      <option value="₹5,00,000">₹5,00,000 (Standard)</option>
                      <option value="₹10,00,000">₹10,00,000 (High-Hazard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                      Administrative Application Status *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InsuranceStatus)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] font-semibold focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                    >
                      <option value="Application Submitted">Application Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Active">Approved / Active</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
                      <option value="Not Applied">Not Applied (Cancel Application)</option>
                    </select>
                  </div>
                </div>

                {status === 'Rejected' && (
                  <div className="p-3 bg-[#FFEBEE] rounded-xs border border-[#FFCDD2] space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-[#B42318]">
                      Reason for Rejection *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify the reason why this insurance application was rejected..."
                      className="w-full p-2 text-xs bg-white border border-[#FFCDD2] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#B42318]"
                    />
                  </div>
                )}

                <div className="p-2.5 rounded-xs bg-[#FFF8E1] border border-[#FFE082] text-[11px] text-[#B26A00] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    * Frontend simulated state: Backend/insurer gateway integration will be connected in subsequent phase.
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3.5 sm:p-4 border-t border-[#D5DCE3] bg-[#F4F6F8] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0B223B] rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Submit Insurance Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
