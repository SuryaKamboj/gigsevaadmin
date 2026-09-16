import React from 'react';
import { JobItem } from '../types';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface GeographicDistributionChartProps {
  jobs?: JobItem[];
}

export const GeographicDistributionChart: React.FC<GeographicDistributionChartProps> = () => {

  // Realistic mock geographic concentration data derived from Job locations
  const regionalData = [
    { city: 'Jalandhar', state: 'Punjab', jobs: 3420, activeWorkers: 850, share: 31.5, status: 'High Density' },
    { city: 'Ludhiana', state: 'Punjab', jobs: 2890, activeWorkers: 720, share: 26.7, status: 'High Density' },
    { city: 'Amritsar', state: 'Punjab', jobs: 1980, activeWorkers: 510, share: 18.3, status: 'Moderate' },
    { city: 'Chandigarh / Mohali', state: 'Punjab & UT', jobs: 1450, activeWorkers: 430, share: 13.4, status: 'Moderate' },
    { city: 'Patiala & Bathinda', state: 'Punjab', jobs: 1102, activeWorkers: 415, share: 10.1, status: 'Emerging' },
  ];

  const totalRegionalJobs = regionalData.reduce((acc, r) => acc + r.jobs, 0);

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">
              6. Geographic Distribution of Work Orders
            </h3>
            <p className="text-[10px] text-[#5B6573]">District & Regional Service Demand Concentrations</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-[#12355B] bg-[#F4F6F8] px-2.5 py-1 rounded-xs border border-[#BAC7D5]">
          <Compass className="w-3.5 h-3.5 text-[#1C4E80]" />
          <span>Total Regional Load: {totalRegionalJobs.toLocaleString()} Jobs</span>
        </div>
      </div>

      {/* Grid of Geographic Metrics & Density Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 pt-1">
        {/* Visual Map Matrix Card */}
        <div className="lg:col-span-2 bg-[#F4F6F8] p-3.5 rounded-sm border border-[#BAC7D5] flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#12355B]" />
              Primary Regional Corridor
            </span>
            <h4 className="text-sm font-bold text-[#12355B]">Punjab Northern Operations Zone</h4>
            <p className="text-[11px] text-[#5B6573] leading-relaxed">
              Major urban cluster servicing domestic electrical, plumbing, carpentry, and sanitization requests.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded-xs border border-[#D5DCE3]">
              <span className="text-[9px] uppercase font-bold text-[#5B6573] block">Covered Districts</span>
              <span className="font-mono font-bold text-sm text-[#12355B]">5 Urban Hubs</span>
            </div>
            <div className="bg-white p-2 rounded-xs border border-[#D5DCE3]">
              <span className="text-[9px] uppercase font-bold text-[#5B6573] block">Active Workforce</span>
              <span className="font-mono font-bold text-sm text-[#2E7D32]">2,925 Verified</span>
            </div>
          </div>
        </div>

        {/* City Breakdown Table & Bars */}
        <div className="lg:col-span-3 space-y-2">
          {regionalData.map((item) => (
            <div
              key={item.city}
              className="p-2.5 bg-white rounded-xs border border-[#BAC7D5] hover:border-[#12355B] transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1F2933] text-[11px]">{item.city}</span>
                  <span className="text-[10px] text-[#5B6573] font-mono">({item.state})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#12355B]">{item.jobs.toLocaleString()} jobs</span>
                  <span className="text-[10px] font-mono text-[#5B6573]">({item.share}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#F4F6F8] rounded-xs h-2 border border-[#BAC7D5] overflow-hidden flex">
                <div
                  className="bg-[#1C4E80] h-full rounded-xs transition-all duration-300"
                  style={{ width: `${item.share}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#5B6573] pt-0.5">
                <span>Active Service Partners: <strong className="text-[#1F2933]">{item.activeWorkers}</strong></span>
                <span className={`font-semibold ${item.status === 'High Density' ? 'text-[#2E7D32]' : 'text-[#1C4E80]'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
