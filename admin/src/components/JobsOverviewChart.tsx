import React from 'react';
import { JobsOverviewStatus } from '../types';
import { Briefcase, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface JobsOverviewChartProps {
  data: JobsOverviewStatus[];
}

export const JobsOverviewChart: React.FC<JobsOverviewChartProps> = ({ data }) => {
  const totalJobs = data.reduce((acc, curr) => acc + curr.count, 0);

  const getStatusDetails = (status: JobsOverviewStatus['status']) => {
    switch (status) {
      case 'Completed':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />,
          color: '#2E7D32',
          bgColor: '#E8F5E9',
          borderColor: '#C8E6C9',
          textColor: '#2E7D32',
        };
      case 'Active':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-[#1C4E80]" />,
          color: '#1C4E80',
          bgColor: '#EAF2F8',
          borderColor: '#BAC7D5',
          textColor: '#1C4E80',
        };
      case 'Pending':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#B26A00]" />,
          color: '#B26A00',
          bgColor: '#FFF8E1',
          borderColor: '#FFE082',
          textColor: '#B26A00',
        };
      case 'Cancelled':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-[#B42318]" />,
          color: '#B42318',
          bgColor: '#FFEBEE',
          borderColor: '#FFCDD2',
          textColor: '#B42318',
        };
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#D5DCE3] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-[#D5DCE3] mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#12355B] uppercase tracking-wide flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#1C4E80]" />
              <span>Service Orders Status</span>
            </h3>
            <p className="text-[11px] text-[#5B6573]">Daily application dispatch & processing</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#F4F6F8] text-[#12355B] border border-[#D5DCE3] rounded-xs">
            Total: {totalJobs}
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3 w-full bg-[#E2E8F0] rounded-xs overflow-hidden flex mb-4">
          {data.map((item) => {
            const details = getStatusDetails(item.status);
            return (
              <div
                key={item.status}
                style={{
                  width: `${(item.count / totalJobs) * 100}%`,
                  backgroundColor: details.color,
                }}
                title={`${item.status}: ${item.count} (${item.percentage}%)`}
                className="h-full transition-all duration-300 border-r border-white/40 last:border-r-0"
              />
            );
          })}
        </div>

        {/* Breakdown List */}
        <div className="grid grid-cols-2 gap-2.5">
          {data.map((item) => {
            const details = getStatusDetails(item.status);
            return (
              <div
                key={item.status}
                className="p-2.5 rounded-sm border bg-[#F4F6F8]/60 transition-colors"
                style={{ borderColor: '#D5DCE3' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {details.icon}
                    <span className="text-[11px] font-semibold text-[#1F2933]">{item.status}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#5B6573]">{item.percentage}%</span>
                </div>
                <div className="text-base font-bold text-[#1F2933] font-mono">{item.count.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2.5 border-t border-[#D5DCE3] flex items-center justify-between text-[11px] text-[#5B6573]">
        <span className="font-medium">Operational Resolution Efficiency:</span>
        <span className="font-bold text-[#2E7D32] font-mono">
          {((data.find((d) => d.status === 'Completed')?.count || 0) / (totalJobs || 1) * 100).toFixed(1)}% Satisfactory
        </span>
      </div>
    </div>
  );
};

