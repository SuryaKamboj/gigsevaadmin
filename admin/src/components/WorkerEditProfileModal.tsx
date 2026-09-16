import React, { useState } from 'react';
import { WorkerItem, WorkerAccountStatus } from '../types';
import { X, Save, UserCog, AlertCircle } from 'lucide-react';

interface WorkerEditProfileModalProps {
  isOpen: boolean;
  worker: WorkerItem | null;
  onClose: () => void;
  onSave: (updatedWorker: WorkerItem, changeSummary: string[]) => void;
}

const CATEGORY_OPTIONS = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'AC Technician',
  'Appliance Repair',
  'Cleaning',
  'RO Technician',
  'Handyman',
];

export const WorkerEditProfileModal: React.FC<WorkerEditProfileModalProps> = ({
  isOpen,
  worker,
  onClose,
  onSave,
}) => {
  if (!isOpen || !worker) return null;

  const [name, setName] = useState(worker.name);
  const [image, setImage] = useState(worker.image);
  const [phone, setPhone] = useState(worker.phone);
  const [category, setCategory] = useState(worker.category);
  const [skillsText, setSkillsText] = useState(worker.skills.join(', '));
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(worker.yearsOfExperience || 0);
  const [serviceArea, setServiceArea] = useState(worker.serviceArea || '');
  const [location, setLocation] = useState(worker.location || '');
  const [workingHours, setWorkingHours] = useState(worker.workingHours || '');
  const [status, setStatus] = useState<WorkerAccountStatus>(worker.status);
  const [adminRemarks, setAdminRemarks] = useState(worker.adminRemarks || '');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const changes: string[] = [];
    if (name !== worker.name) changes.push(`Name: '${worker.name}' → '${name}'`);
    if (phone !== worker.phone) changes.push(`Mobile: '${worker.phone}' → '${phone}'`);
    if (category !== worker.category) changes.push(`Primary Category: '${worker.category}' → '${category}'`);
    if (yearsOfExperience !== worker.yearsOfExperience) {
      changes.push(`Experience: ${worker.yearsOfExperience} yrs → ${yearsOfExperience} yrs`);
    }
    if (serviceArea !== worker.serviceArea) {
      changes.push(`Service Area: '${worker.serviceArea}' → '${serviceArea}'`);
    }
    if (location !== worker.location) {
      changes.push(`Location: '${worker.location}' → '${location}'`);
    }
    if (workingHours !== worker.workingHours) {
      changes.push(`Working Hours: '${worker.workingHours}' → '${workingHours}'`);
    }
    if (status !== worker.status) {
      changes.push(`Status: ${worker.status} → ${status}`);
    }
    if (adminRemarks !== worker.adminRemarks) {
      changes.push(`Admin Remarks updated`);
    }

    const updatedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: WorkerItem = {
      ...worker,
      name,
      image,
      phone,
      category,
      skills: updatedSkills,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      serviceArea,
      location,
      workingHours,
      status,
      adminRemarks,
    };

    onSave(updated, changes);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/65 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-sm max-w-2xl w-full shadow-2xl border border-[#D5DCE3] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#D5DCE3] flex items-center justify-between bg-[#12355B] text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-xs bg-[#1C4E80] text-white flex-shrink-0">
              <UserCog className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                Edit Official Worker Profile
              </h3>
              <p className="text-[10px] text-[#A5B9CC] font-mono">Worker ID: {worker.id} • Administrative Correction Mode</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xs bg-[#0E2C4D] hover:bg-[#1C4E80] text-white flex items-center justify-center transition-colors cursor-pointer border border-[#1C4E80]"
            aria-label="Close edit profile modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex flex-col overflow-hidden flex-1">
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Notification disclaimer */}
            <div className="p-2.5 rounded-xs bg-[#EAF2F8] border border-[#BAC7D5] text-[#12355B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#1C4E80] flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Administrative Protocol:</span> Updating official profile attributes will immediately update registry ledgers and generate a permanent timestamped audit trail entry in the Administrative Activity Log.
              </div>
            </div>

            {/* Basic Information Group */}
            <div className="bg-[#F4F6F8] p-3.5 rounded-sm border border-[#D5DCE3] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#12355B] block border-b border-[#D5DCE3] pb-1">
                1. Basic Worker Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Mobile Number (Admin Correction) *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Profile Photo URL
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-8 h-8 rounded-xs object-cover border border-[#BAC7D5] flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Permanent / Residential Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Model Town, Jalandhar"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Worker Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as WorkerAccountStatus)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] font-semibold focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                  >
                    <option value="Active">Active (Authorized)</option>
                    <option value="Inactive">Inactive (Dormant)</option>
                    <option value="Suspended">Suspended (Temporary Hold)</option>
                    <option value="Blocked">Blocked (Disciplinary Flag)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information Group */}
            <div className="bg-[#F4F6F8] p-3.5 rounded-sm border border-[#D5DCE3] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#12355B] block border-b border-[#D5DCE3] pb-1">
                2. Professional & Operational Configuration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Primary Service Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] font-semibold focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B] cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Additional Skills & Specializations (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="e.g. Switchboard Wiring, MCB Tripping, Inverter Setup"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Operating Service Area / District Belt *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Jalandhar Urban & Cantt Area"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#5B6573] mb-1">
                    Preferred Working Hours *
                  </label>
                  <input
                    type="text"
                    required
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="e.g. 9:00 AM – 7:00 PM"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
                  />
                </div>
              </div>
            </div>

            {/* Administrative Remarks Group */}
            <div className="bg-[#F4F6F8] p-3.5 rounded-sm border border-[#D5DCE3] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D5DCE3] pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#12355B]">
                  3. Internal Administrative Remarks
                </span>
                <span className="text-[10px] text-[#B42318] font-bold">INTERNAL USE ONLY</span>
              </div>

              <textarea
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add confidential administrative notes, verification history, or performance notes..."
                className="w-full p-2.5 text-xs bg-white border border-[#BAC7D5] rounded-xs text-[#1F2933] placeholder-[#8795A5] focus:outline-none focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]"
              />
              <p className="text-[10px] text-[#5B6573] italic">
                * Note: Internal remarks are strictly confidential to departmental officers and will not appear on worker or citizen apps.
              </p>
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
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
