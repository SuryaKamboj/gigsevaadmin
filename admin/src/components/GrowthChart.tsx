import React, { useState } from 'react';
import { GrowthDataPoint } from '../types';
import { FileText, Users, Briefcase } from 'lucide-react';

interface GrowthChartProps {
  data: GrowthDataPoint[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Chart dimensions
  const height = 210;
  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const graphWidth = 500;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = 14000;
  const minVal = 0;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * (graphWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
  };

  // Generate SVG path strings for users and workers
  const usersPath = data.reduce((acc, point, i) => {
    const x = getX(i);
    const y = getY(point.users);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const workersPath = data.reduce((acc, point, i) => {
    const x = getX(i);
    const y = getY(point.workers);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="bg-white rounded-sm p-4 sm:p-5 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#D5DCE3]">
        <div>
          <h3 className="text-sm font-bold text-[#12355B] flex items-center gap-1.5 uppercase tracking-wide">
            <FileText className="w-4 h-4 text-[#1C4E80]" />
            <span>Monthly Registry Growth</span>
          </h3>
          <p className="text-[11px] text-[#5B6573]">Registered Citizens & Service Workers (Past 6 Months)</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-xs bg-[#12355B]" />
            <span className="text-[#1F2933] text-[11px]">Citizens ({data[data.length - 1].users.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-xs bg-[#1C4E80]" />
            <span className="text-[#1F2933] text-[11px]">Workers ({data[data.length - 1].workers.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${graphWidth} ${height}`}
          className="w-full h-44 sm:h-52 overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 3500, 7000, 10500, 14000].map((tickVal) => {
            const y = getY(tickVal);
            return (
              <g key={tickVal}>
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
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#5B6573"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {tickVal >= 1000 ? `${tickVal / 1000}k` : tickVal}
                </text>
              </g>
            );
          })}

          {/* User Line */}
          <path
            d={usersPath}
            fill="none"
            stroke="#12355B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Worker Line */}
          <path
            d={workersPath}
            fill="none"
            stroke="#1C4E80"
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels & Interactive Points */}
          {data.map((point, i) => {
            const x = getX(i);
            const yUsers = getY(point.users);
            const yWorkers = getY(point.workers);
            const isHovered = hoveredIdx === i;

            return (
              <g key={point.month} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {/* Vertical hover guide */}
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

                {/* User Dot */}
                <circle
                  cx={x}
                  cy={yUsers}
                  r={isHovered ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#12355B"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                />

                {/* Worker Dot */}
                <circle
                  cx={x}
                  cy={yWorkers}
                  r={isHovered ? 4.5 : 3}
                  fill="#FFFFFF"
                  stroke="#1C4E80"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                />

                {/* Month label */}
                <text
                  x={x}
                  y={padding.top + graphHeight + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#5B6573"
                  fontWeight="600"
                >
                  {point.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div className="absolute top-2 right-4 bg-[#12355B] text-white rounded-xs p-2.5 shadow-md text-xs space-y-1 border border-[#1C4E80]">
            <p className="font-bold text-[#EAF2F8] border-b border-[#1C4E80] pb-1 text-[11px]">
              {data[hoveredIdx].month} 2026 Registry Records
            </p>
            <div className="flex items-center justify-between gap-4 text-white text-[11px]">
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[#A5B9CC]" /> Registered Citizens:</span>
              <span className="font-bold font-mono">{data[hoveredIdx].users.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-white text-[11px]">
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-[#A5B9CC]" /> Verified Workers:</span>
              <span className="font-bold font-mono">{data[hoveredIdx].workers.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

