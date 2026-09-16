import React from 'react';
import { PopularServiceItem } from '../types';
import { FolderKanban } from 'lucide-react';

interface PopularServicesProps {
  services: PopularServiceItem[];
}

export const PopularServices: React.FC<PopularServicesProps> = ({ services }) => {
  return (
    <div className="bg-white rounded-sm border border-[#D5DCE3] p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#D5DCE3] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-sm bg-[#EAF2F8] text-[#12355B]">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#12355B] text-sm uppercase tracking-wide">
              High-Volume Service Sectors
            </h3>
            <p className="text-[11px] text-[#5B6573]">Citizen demand distribution and revenue audit</p>
          </div>
        </div>
        <span className="text-[11px] text-[#12355B] font-mono font-semibold px-2 py-0.5 rounded-xs bg-[#EAF2F8] border border-[#BAC7D5]">
          Top 8 Categories
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4F6F8] text-[#5B6573] border-b border-[#D5DCE3] text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2 px-2.5">#</th>
              <th className="py-2 px-2.5">Category Title</th>
              <th className="py-2 px-2.5 text-right">Work Orders</th>
              <th className="py-2 px-2.5 text-right">Share</th>
              <th className="py-2 px-2.5 text-right">Disbursement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {services.map((service, index) => (
              <tr key={service.id} className="hover:bg-[#F4F6F8]/60 transition-colors">
                <td className="py-2 px-2.5 font-mono text-[11px] text-[#5B6573] font-semibold">
                  {index + 1}
                </td>
                <td className="py-2 px-2.5">
                  <span className="font-semibold text-[#1F2933] text-[11px]">{service.serviceName}</span>
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-medium text-[#1F2933]">
                  {service.bookingsCount.toLocaleString()}
                </td>
                <td className="py-2 px-2.5 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    <span className="font-mono text-[11px] font-semibold text-[#5B6573]">{service.percentage}%</span>
                    <div className="w-12 h-1.5 bg-[#E2E8F0] rounded-xs overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-[#1C4E80]"
                        style={{ width: `${service.percentage * 3.5}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-bold text-[#12355B]">
                  {service.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

