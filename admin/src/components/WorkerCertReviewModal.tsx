import React, { useState } from 'react';
import { WorkerCertificationItem } from '../types';
import { X, Award, CheckCircle2, XCircle, FileText, AlertTriangle } from 'lucide-react';

interface WorkerCertReviewModalProps {
  isOpen: boolean;
  cert: WorkerCertificationItem | null;
  workerName: string;
  workerId: string;
  onClose: () => void;
  onVerify: (certId: string) => void;
  onReject: (certId: string, reason: string) => void;
}

export const WorkerCertReviewModal: React.FC<WorkerCertReviewModalProps> = ({
  isOpen,
  cert,
  workerName,
  workerId,
  onClose,
  onVerify,
  onReject,
}) => {
  if (!isOpen || !cert) return null;

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(cert.rejectionReason || '');

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(cert.id, rejectionReason.trim());
    setIsRejecting(false);
    onClose();
  };

  const handleConfirmVerify = () => {
    onVerify(cert.id);
    onClose();
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
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                Professional Skill Certificate Review
              </h3>
              <p className="text-[10px] text-[#A5B9CC] font-mono">Worker: {workerName} ({workerId})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xs bg-[#0E2C4D] hover:bg-[#1C4E80] text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1C4E80]"
            aria-label="Close certificate modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Certificate Mock Document Preview */}
          <div className="p-4 rounded-sm bg-[#F4F6F8] border-2 border-dashed border-[#BAC7D5] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D5DCE3] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1C4E80]" />
                <span className="font-bold text-[#12355B] uppercase text-[11px]">
                  Government & Sector Skills Registry Certificate
                </span>
              </div>
              <span className={`text-[11px] font-bold ${
                cert.status === 'Verified'
                  ? 'text-[#2E7D32]'
                  : cert.status === 'Rejected'
                  ? 'text-[#B42318]'
                  : 'text-[#1C4E80]'
              }`}>
                {cert.status}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <h4 className="font-bold text-[#1F2933] text-sm text-center">
                {cert.name}
              </h4>
              <p className="text-center text-[11px] text-[#5B6573]">
                Issued to: <span className="font-bold text-[#1F2933]">{workerName}</span> (ID: {workerId})
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0] text-[11px]">
                <div>
                  <span className="text-[#5B6573] block text-[10px] uppercase font-semibold">Issuing Authority:</span>
                  <span className="font-medium text-[#1F2933]">{cert.issuer || 'Skill Development Council'}</span>
                </div>
                <div>
                  <span className="text-[#5B6573] block text-[10px] uppercase font-semibold">Certificate Number:</span>
                  <span className="font-mono font-bold text-[#12355B]">{cert.certificateNumber || 'CERT-REG-2025'}</span>
                </div>
                <div>
                  <span className="text-[#5B6573] block text-[10px] uppercase font-semibold">Issue Date:</span>
                  <span className="text-[#1F2933]">{cert.issueDate || '10 Jan 2024'}</span>
                </div>
                <div>
                  <span className="text-[#5B6573] block text-[10px] uppercase font-semibold">Expiry Date:</span>
                  <span className="text-[#1F2933]">{cert.expiryDate || '09 Jan 2027'}</span>
                </div>
                {cert.verifiedDate && (
                  <div className="col-span-2 pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[#2E7D32] text-[10px] font-bold">
                      ✓ Verified on {cert.verifiedDate} by {cert.verifiedBy || 'Admin Officer'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection notice if existing */}
          {cert.rejectionReason && !isRejecting && (
            <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-xs text-[#B42318] space-y-1">
              <span className="font-bold text-[11px]">Rejection Reason on Record:</span>
              <p className="text-xs">{cert.rejectionReason}</p>
            </div>
          )}

          {/* Inline rejection form */}
          {isRejecting ? (
            <form onSubmit={handleConfirmReject} className="p-3 bg-[#FFF8E1] border border-[#FFE082] rounded-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#B26A00] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Reason for Certificate Rejection</span>
              </div>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this certificate is being rejected (e.g. Expired document, mismatched name, unverified institution)..."
                className="w-full p-2 text-xs bg-white border border-[#FFE082] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#B26A00]"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] rounded-xs hover:bg-[#F4F6F8] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs cursor-pointer shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          ) : (
            <div className="p-2.5 rounded-xs bg-[#EAF2F8] border border-[#BAC7D5] text-[#12355B] text-[11px]">
              <span className="font-bold">Administrative Note:</span> Professional certifications are optional skill accreditations. Verifying or rejecting a certificate will immediately update the worker dossier and record an audit log entry.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isRejecting && (
          <div className="p-3.5 sm:p-4 border-t border-[#D5DCE3] bg-[#F4F6F8] flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#1F2933] bg-white border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#B42318] hover:bg-[#911810] rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark as Rejected</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmVerify}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2E7D32] hover:bg-[#236327] rounded-xs shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Verified</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
