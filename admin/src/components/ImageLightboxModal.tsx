import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  title = 'Administrative Image Inspection',
  subtitle,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-sm max-w-3xl w-full shadow-2xl border border-[#D5DCE3] flex flex-col overflow-hidden max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xs bg-[#1C4E80] text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {title}
              </h3>
              {subtitle && <p className="text-[10px] text-[#A5B9CC] font-mono">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A5B9CC] hover:text-white rounded-xs hover:bg-[#1C4E80] transition-colors cursor-pointer"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Content Container */}
        <div className="p-4 sm:p-6 bg-[#F4F6F8] flex items-center justify-center overflow-auto flex-1 min-h-[300px] max-h-[70vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full object-contain rounded-sm border border-[#BAC7D5] shadow-xs bg-white"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#D5DCE3] bg-white flex items-center justify-between text-xs text-[#5B6573]">
          <span className="text-[11px] font-mono">Government Administrative Portal • Record View Only</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 text-xs font-semibold text-[#1F2933] bg-[#F4F6F8] border border-[#BAC7D5] rounded-xs hover:bg-[#EAF2F8] transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
