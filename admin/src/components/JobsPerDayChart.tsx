import React, { useState, useMemo } from 'react';
import { JobItem } from '../types';
import { Briefcase } from 'lucide-react';

interface JobsPerDayChartProps {
  jobs?: JobItem[];
  dateRange: '7d' | '30d' | '90d' | 'custom';
}

export const JobsPerDayChart: React.FC<JobsPerDayChartProps> = ({ dateRange }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dailyData = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { date: '03 Sep', dispatched: 420, completed: 370 },
        { date: '04 Sep', dispatched: 465, completed: 410 },
        { date: '05 Sep', dispatched: 440, completed: 395 },
        { date: '06 Sep', dispatched: 512, completed: 458 },
        { date: '07 Sep', dispatched: 490, completed: 435 },
        { date: '08 Sep', dispatched: 535, completed: 480 },
        { date: '09 Sep', dispatched: 486, completed: 425 },
      ];
    } else if (dateRange === '30d') {
      return [
        { date: '11-17 Aug', dispatched: 2980, completed: 2650 },
        { date: '18-24 Aug', dispatched: 3210, completed: 2890 },
        { date: '25-31 Aug', dispatched: 3450, completed: 3100 },
        { date: '01-09 Sep', dispatched: 3820, completed: 3410 },
      ];
    } else {
      return [
        { date: 'Jun', dispatched: 11200, completed: 9850 },
        { date: 'Jul', dispatched: 13400, completed: 11900 },
        { date: 'Aug', dispatched: 15100, completed: 13500 },
        { date: 'Sep', dispatched: 4650, completed: 4120 },
      ];
    }
  }, [dateRange]);

  const maxVal = Math.max(...dailyData.map((d) => Math.max(d.dispatched, d.completed))) * 1.15;
  const avgJobs = Math.round(dailyData.reduce((acc, d) => acc + d.dispatched, 0) / dailyData.length);

  return (
    <div className="bg-white rounded-sm p-3.5 sm:p-4 border border-[#D5DCE3] shadow-xs">
      {/* Header with Title and Daily Average */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#1C4E80] flex-shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-[#12355B] tracking-tight truncate">
              Service Orders per Day
            </h3>
            <p className="text-[11px] text-[#5B6573] truncate">Daily job activity across the platform</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 pl-2">
          <span className="text-[9px] uppercase font-bold text-[#5B6573] block tracking-wider leading-none">
            Daily Average
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-[#12355B] mt-0.5 block leading-tight">
            {avgJobs.toLocaleString()} Orders/day
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative pt-3 pb-1">
        {/* Floating Tooltip positioned near hovered bar */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-30 bg-[#12355B] text-white text-[10px] rounded-xs px-2.5 py-1.5 shadow-md border border-[#1C4E80] pointer-events-none transition-all duration-100"
            style={{
              top: '6px',
              left: `${Math.min(Math.max((hoveredIdx / (dailyData.length - 1)) * 85 + 5, 10), 75)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-[#A5B9CC] border-b border-[#1C4E80] pb-0.5 text-[10px]">
              {dailyData[hoveredIdx].date}
            </div>
            <div className="flex items-center justify-between gap-3 mt-1 text-[#EAF2F8]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C4E80]" />
                Dispatched:
              </span>
              <span className="font-mono font-bold text-white">
                {dailyData[hoveredIdx].dispatched.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#E8F5E9]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                Completed:
              </span>
              <span className="font-mono font-bold text-[#2E7D32]">
                {dailyData[hoveredIdx].completed.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Paired Bar Columns */}
        <div className="h-28 sm:h-32 flex items-end justify-between gap-1.5 sm:gap-4 px-1 sm:px-3 border-b border-[#D5DCE3]">
          {dailyData.map((item, idx) => {
            const dispHeight = Math.round((item.dispatched / maxVal) * 100);
            const compHeight = Math.round((item.completed / maxVal) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex-1 flex flex-col items-center h-full justify-end cursor-pointer transition-all duration-100 ${
                  isHovered ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Bar Pair (Dispatched & Completed) */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1.5 max-w-[42px] h-full">
                  {/* Dispatched Bar */}
                  <div
                    className={`w-1/2 rounded-t-xs transition-colors duration-100 ${
                      isHovered ? 'bg-[#12355B]' : 'bg-[#1C4E80]'
                    }`}
                    style={{ height: `${dispHeight}%` }}
                    title={`Dispatched: ${item.dispatched}`}
                  />
                  {/* Completed Bar */}
                  <div
                    className={`w-1/2 rounded-t-xs transition-colors duration-100 ${
                      isHovered ? 'bg-[#236327]' : 'bg-[#2E7D32]'
                    }`}
                    style={{ height: `${compHeight}%` }}
                    title={`Completed: ${item.completed}`}
                  />
                </div>

                {/* Date Label */}
                <span
                  className={`text-[10px] font-semibold mt-1.5 truncate max-w-full text-center transition-colors ${
                    isHovered ? 'text-[#12355B] font-bold' : 'text-[#5B6573]'
                  }`}
                >
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Bottom Legend */}
      <div className="flex items-center justify-between text-[10px] text-[#5B6573] pt-2 px-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1C4E80]" />
            <span className="font-medium text-[#1F2933]">Dispatched Orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2E7D32]" />
            <span className="font-medium text-[#1F2933]">Completed Orders</span>
          </div>
        </div>

        <span className="font-mono text-[9px] text-[#5B6573] hidden sm:inline">
          Aggregated Daily Lifecycle
        </span>
      </div>
    </div>
  );
};
