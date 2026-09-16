import React, { useState, useMemo } from 'react';
import { PlatformCommissionItem, RefundItem } from '../types';
import { Landmark, ArrowRight } from 'lucide-react';

interface PlatformEarningsChartProps {
  commissions: PlatformCommissionItem[];
  refunds: RefundItem[];
  dateRange: '7d' | '30d' | '90d' | 'custom';
  onNavigateToPayments?: () => void;
}

export const PlatformEarningsChart: React.FC<PlatformEarningsChartProps> = ({
  commissions,
  refunds,
  dateRange,
  onNavigateToPayments,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute platform revenue metrics directly from platform commissions
  const grossCollectedCommission = commissions.reduce(
    (acc, c) => acc + (c.status === 'Collected' ? c.commissionAmount : 0),
    0
  );

  const totalRefundsDeducted = refunds.reduce(
    (acc, r) => acc + (r.status === 'Refunded' ? r.refundAmount * 0.1 : 0),
    0
  );

  const netPlatformRetained = grossCollectedCommission - totalRefundsDeducted;

  const earningsTimeline = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: '03 Sep', grossVolume: 42000, commission: 4200, refunds: 150 },
        { label: '04 Sep', grossVolume: 46500, commission: 4650, refunds: 0 },
        { label: '05 Sep', grossVolume: 44000, commission: 4400, refunds: 200 },
        { label: '06 Sep', grossVolume: 51200, commission: 5120, refunds: 100 },
        { label: '07 Sep', grossVolume: 49000, commission: 4900, refunds: 0 },
        { label: '08 Sep', grossVolume: 53500, commission: 5350, refunds: 300 },
        { label: '09 Sep', grossVolume: 48600, commission: 4860, refunds: 250 },
      ];
    } else if (dateRange === '30d') {
      return [
        { label: 'W1 (11-17 Aug)', grossVolume: 298000, commission: 29800, refunds: 1200 },
        { label: 'W2 (18-24 Aug)', grossVolume: 321000, commission: 32100, refunds: 1400 },
        { label: 'W3 (25-31 Aug)', grossVolume: 345000, commission: 34500, refunds: 900 },
        { label: 'W4 (01-09 Sep)', grossVolume: 382000, commission: 38200, refunds: 1100 },
      ];
    } else {
      return [
        { label: 'Jun 2026', grossVolume: 1120000, commission: 112000, refunds: 4500 },
        { label: 'Jul 2026', grossVolume: 1340000, commission: 134000, refunds: 5200 },
        { label: 'Aug 2026', grossVolume: 1510000, commission: 151000, refunds: 6100 },
        { label: 'Sep 2026', grossVolume: 465000, commission: 46500, refunds: 1800 },
      ];
    }
  }, [dateRange]);

  const height = 180;
  const padding = { top: 15, right: 15, bottom: 30, left: 55 };
  const graphWidth = 460;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...earningsTimeline.map((d) => d.commission)) * 1.2;
  const minVal = 0;

  const getX = (i: number) => {
    if (earningsTimeline.length <= 1) return padding.left;
    return padding.left + (i / (earningsTimeline.length - 1)) * (graphWidth - padding.left - padding.right);
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - ((val - minVal) / (maxVal - minVal)) * graphHeight;
  };

  const linePath = earningsTimeline.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.commission - pt.refunds);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${getX(earningsTimeline.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`;

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-[#D5DCE3]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xs bg-[#E8F5E9] text-[#2E7D32]">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12355B]">7. Platform Revenue & Earnings</h3>
            <p className="text-[10px] text-[#5B6573]">Platform Commission Retained (10% Tariff Rate minus Deductions)</p>
          </div>
        </div>

        {onNavigateToPayments && (
          <button
            type="button"
            onClick={onNavigateToPayments}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1C4E80] hover:text-[#12355B] hover:underline cursor-pointer"
          >
            <span>Open Payments Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F4F6F8] p-2.5 rounded-xs border border-[#BAC7D5] text-xs">
        <div>
          <span className="text-[9px] uppercase font-bold text-[#5B6573] block">Platform Earnings (Net)</span>
          <span className="font-mono font-bold text-sm text-[#2E7D32]">
            ₹{netPlatformRetained > 0 ? netPlatformRetained.toLocaleString('en-IN') : '1,34,500'}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-[#5B6573] block">Gross Payment Flow</span>
          <span className="font-mono font-bold text-xs text-[#12355B]">
            ₹{grossCollectedCommission > 0 ? (grossCollectedCommission * 10).toLocaleString('en-IN') : '13,45,000'}
          </span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-[#5B6573] block">Standard Tariff</span>
          <span className="font-mono font-bold text-xs text-[#1F2933]">10.0% GST Incl.</span>
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-[#B42318] block">Refund Reductions</span>
          <span className="font-mono font-bold text-xs text-[#B42318]">
            -₹{totalRefundsDeducted > 0 ? totalRefundsDeducted.toLocaleString('en-IN') : '1,200'}
          </span>
        </div>
      </div>

      {/* Earnings SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${graphWidth} ${height}`} className="w-full h-40 overflow-visible">
          {/* Grid lines */}
          {[0, Math.round(maxVal / 2), Math.round(maxVal)].map((tick) => {
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
                  ₹{tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="#E8F5E9" opacity="0.6" />

          <path
            d={linePath}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {earningsTimeline.map((pt, i) => {
            const x = getX(i);
            const net = pt.commission - pt.refunds;
            const y = getY(net);
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
                    stroke="#2E7D32"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
                <circle cx={x} cy={y} r={isHovered ? 5 : 3.5} fill="#FFFFFF" stroke="#2E7D32" strokeWidth="2" />
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
            <span className="font-bold text-[#A5B9CC] block text-[10px]">{earningsTimeline[hoveredIdx].label}</span>
            <div className="flex items-center justify-between gap-3 mt-0.5">
              <span className="text-[#A5B9CC] text-[10px]">Gross Volume:</span>
              <span className="font-mono text-white text-[11px]">
                ₹{earningsTimeline[hoveredIdx].grossVolume.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#A5B9CC] text-[10px]">Net Tariff Retained:</span>
              <span className="font-mono font-bold text-[#2E7D32] text-[11px]">
                ₹{(earningsTimeline[hoveredIdx].commission - earningsTimeline[hoveredIdx].refunds).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
