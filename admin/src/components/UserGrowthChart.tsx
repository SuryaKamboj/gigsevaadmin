import React, { useState, useMemo } from 'react';
import { UserItem } from '../types';
import { Users, TrendingUp } from 'lucide-react';

interface UserGrowthChartProps {
  users: UserItem[];
  dateRange: '7d' | '30d' | '90d' | 'custom';
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ users, dateRange }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate data points based on date range and users
  const chartData = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: '03 Sep', count: 12150, newUsers: 38 },
        { label: '04 Sep', count: 12195, newUsers: 45 },
        { label: '05 Sep', count: 12248, newUsers: 53 },
        { label: '06 Sep', count: 12310, newUsers: 62 },
        { label: '07 Sep', count: 12380, newUsers: 70 },
        { label: '08 Sep', count: 12435, newUsers: 55 },
        { label: '09 Sep', count: 12480, newUsers: 45 },
      ];
    } else if (dateRange === '30d') {
      return [
        { label: '11 Aug', count: 11200, newUsers: 210 },
        { label: '18 Aug', count: 11520, newUsers: 320 },
        { label: '25 Aug', count: 11890, newUsers: 370 },
        { label: '01 Sep', count: 12150, newUsers: 260 },
        { label: '09 Sep', count: 12480, newUsers: 330 },
      ];
    } else {
      // 90d or custom
      return [
        { label: 'Jun 2026', count: 8200, newUsers: 1400 },
        { label: 'Jul 2026', count: 9500, newUsers: 1300 },
        { label: 'Aug 2026', count: 11200, newUsers: 1700 },
        { label: 'Sep 2026', count: 12480, newUsers: 1280 },
      ];
    }
  }, [dateRange]);

  const height = 180;
  const padding = { top: 15, right: 15, bottom: 30, left: 45 };
  const graphWidth = 460;
  const graphHeight = height - padding.top - padding.bottom;

  const minVal = Math.floor(Math.min(...chartData.map((d) => d.count)) * 0.95);
  const maxVal = Math.ceil(Math.max(...chartData.map((d) => d.count)) * 1.05);

  const getX = (i: number) => {
    if (chartData.length <= 1) return padding.left;
    return padding.left + (i / (chartData.length - 1)) * (graphWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    if (maxVal === minVal) return padding.top + graphHeight / 2;
    return padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
  };

  const linePath = chartData.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.count);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${getX(chartData.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`;

  const totalRegistered = users.length > 0 ? 12480 + (users.length - 10) : 12480;
  const growthRate = '+8.2%';

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xs bg-[#EAF2F8] text-[#12355B]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">1. Citizen / User Growth</h3>
            <p className="text-[10px] text-[#5B6573]">Verified Citizen Registrations over Time</p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono font-bold text-sm text-[#12355B]">{totalRegistered.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-[#2E7D32] ml-1.5 flex items-center justify-end gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {growthRate}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${graphWidth} ${height}`} className="w-full h-40 overflow-visible">
          {/* Subtle Grid Lines */}
          {[minVal, Math.round((minVal + maxVal) / 2), maxVal].map((tick) => {
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

          {/* Area under curve */}
          <path d={areaPath} fill="#EAF2F8" opacity="0.6" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#12355B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive Tooltip Triggers */}
          {chartData.map((pt, i) => {
            const x = getX(i);
            const y = getY(pt.count);
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
                    stroke="#12355B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 4.5 : 3}
                  fill="#FFFFFF"
                  stroke="#12355B"
                  strokeWidth="2"
                />
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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[#A5B9CC] text-[10px]">Total Users:</span>
              <span className="font-mono font-bold text-white text-[11px]">
                {chartData[hoveredIdx].count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A5B9CC] text-[10px]">New Additions:</span>
              <span className="font-mono font-bold text-[#2E7D32] text-[11px]">
                +{chartData[hoveredIdx].newUsers}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
