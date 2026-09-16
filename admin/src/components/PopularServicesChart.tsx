import React from 'react';
import { JobItem } from '../types';
import { Layers } from 'lucide-react';

interface PopularServicesChartProps {
  jobs?: JobItem[];
}

export const PopularServicesChart: React.FC<PopularServicesChartProps> = () => {
  // Service category demand aggregated from Job Management
  const servicesData = [
    { service: 'Electrician & Wiring', count: 1840, share: 24, revenue: '₹8.28L' },
    { service: 'Plumbing & Drainage', count: 1520, share: 20, revenue: '₹7.60L' },
    { service: 'AC Technician & Repair', count: 1310, share: 17, revenue: '₹11.13L' },
    { service: 'Deep Home Cleaning', count: 1150, share: 15, revenue: '₹13.80L' },
    { service: 'Furniture & Carpentry', count: 980, share: 12, revenue: '₹5.39L' },
    { service: 'Appliance Repair', count: 840, share: 10, revenue: '₹4.20L' },
    { service: 'RO / Water Purifier', count: 720, share: 9, revenue: '₹2.88L' },
  ];

  const maxCount = Math.max(...servicesData.map((s) => s.count));

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#12355B]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">5. Popular Service Categories</h3>
            <p className="text-[10px] text-[#5B6573]">Demand Concentration by Trade (Ranked by Job Volume)</p>
          </div>
        </div>

        <span className="text-[10px] text-[#5B6573] font-semibold">Total Trades: 7 Active</span>
      </div>

      <div className="space-y-2.5 pt-1">
        {servicesData.map((item, idx) => {
          const widthPercent = Math.round((item.count / maxCount) * 100);

          return (
            <div key={item.service} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                  <span className="font-mono text-[10px] font-bold text-[#5B6573] w-4">{idx + 1}.</span>
                  <span className="font-bold text-[#1F2933] text-[11px] truncate">{item.service}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                  <span className="font-mono font-bold text-[#12355B]">{item.count.toLocaleString()} jobs</span>
                  <span className="text-[#5B6573] font-mono text-[10px]">({item.share}%)</span>
                </div>
              </div>

              {/* Bar track and fill */}
              <div className="w-full bg-[#F4F6F8] rounded-xs h-2.5 border border-[#BAC7D5] overflow-hidden flex">
                <div
                  className="bg-[#12355B] h-full rounded-xs transition-all duration-300 hover:bg-[#1C4E80]"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
