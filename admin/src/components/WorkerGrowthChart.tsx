import React, { useState, useMemo } from 'react';
import { WorkerItem } from '../types';
import { HardHat, TrendingUp } from 'lucide-react';

interface WorkerGrowthChartProps {
  workers: WorkerItem[];
  dateRange: '7d' | '30d' | '90d' | 'custom';
}

export const WorkerGrowthChart: React.FC<WorkerGrowthChartProps> = ({ workers, dateRange }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: '03 Sep', registered: 3180, approved: 2840 },
        { label: '04 Sep', registered: 3195, approved: 2855 },
        { label: '05 Sep', registered: 3210, approved: 2870 },
        { label: '06 Sep', registered: 3228, approved: 2885 },
        { label: '07 Sep', registered: 3242, approved: 2900 },
        { label: '08 Sep', registered: 3251, approved: 2910 },
        { label: '09 Sep', registered: 3260, approved: 2925 },
      ];
    } else if (dateRange === '30d') {
      return [
        { label: '11 Aug', registered: 2900, approved: 2580 },
        { label: '18 Aug', registered: 3010, approved: 2690 },
        { label: '25 Aug', registered: 3110, approved: 2780 },
        { label: '01 Sep', registered: 3180, approved: 2840 },
        { label: '09 Sep', registered: 3260, approved: 2925 },
      ];
    } else {
      // 90d or custom
      return [
        { label: 'Jun 2026', registered: 2100, approved: 1850 },
        { label: 'Jul 2026', registered: 2450, approved: 2180 },
        { label: 'Aug 2026', registered: 2900, approved: 2580 },
        { label: 'Sep 2026', registered: 3260, approved: 2925 },
      ];
    }
  }, [dateRange]);

  const height = 180;
  const padding = { top: 15, right: 15, bottom: 30, left: 45 };
  const graphWidth = 460;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = 3600;
  const minVal = 1600;

  const getX = (i: number) => {
    if (chartData.length <= 1) return padding.left;
    return padding.left + (i / (chartData.length - 1)) * (graphWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
  };

  const regPath = chartData.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.registered);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const appPath = chartData.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.approved);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const totalRegistered = workers.length > 0 ? 3260 + (workers.length - 16) : 3260;
  const approvedCount = workers.filter((w) => w.approvalStatus === 'Approved').length;
  const activeRate = '+12.4%';

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xs bg-[#FFF8E1] text-[#E67E22]">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">2. Workforce Growth</h3>
            <p className="text-[10px] text-[#5B6573]">Registered Applicants vs. Approved Partners</p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono font-bold text-sm text-[#12355B]">{totalRegistered.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-[#2E7D32] ml-1.5 flex items-center justify-end gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {activeRate}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-semibold pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#E67E22]" />
          <span className="text-[#1F2933]">Total Registered ({totalRegistered})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#2E7D32]" />
          <span className="text-[#1F2933]">
            Approved & Active ({approvedCount > 0 ? 2925 : 2925})
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${graphWidth} ${height}`} className="w-full h-40 overflow-visible">
          {/* Grid lines */}
          {[1600, 2600, 3600].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={graphWidth - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fill="#5B6573"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Registered line */}
          <path
            d={regPath}
            fill="none"
            stroke="#E67E22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Approved line */}
          <path
            d={appPath}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            strokeDasharray="3 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {chartData.map((pt, i) => {
            const x = getX(i);
            const yReg = getY(pt.registered);
            const yApp = getY(pt.approved);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={pt.label}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="#5B6573"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                <circle cx={x} cy={yReg} r={isHovered ? 4.5 : 3} fill="#FFFFFF" stroke="#E67E22" strokeWidth="2" />
                <circle cx={x} cy={yApp} r={isHovered ? 4.5 : 3} fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
                <text
                  x={x}
                  y={padding.top + graphHeight + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#5B6573"
                  fontWeight="600"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div className="absolute top-1 right-2 bg-[#12355B] text-white rounded-xs p-2 shadow-md text-xs border border-[#1C4E80]">
            <span className="font-bold text-[#A5B9CC] block text-[10px]">{chartData[hoveredIdx].label}</span>
            <div className="flex items-center justify-between gap-3 mt-0.5">
              <span className="text-[#A5B9CC] text-[10px]">Total Registered:</span>
              <span className="font-mono font-bold text-[#E67E22] text-[11px]">
                {chartData[hoveredIdx].registered.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#A5B9CC] text-[10px]">Verified & Active:</span>
              <span className="font-mono font-bold text-[#2E7D32] text-[11px]">
                {chartData[hoveredIdx].approved.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
