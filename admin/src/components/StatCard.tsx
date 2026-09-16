import React from 'react';
import {
  Users,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { StatMetric } from '../types';

interface StatCardProps {
  stat: StatMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Users':
        return <Users className="w-4 h-4 text-[#12355B]" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-[#1C4E80]" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-4 h-4 text-[#B26A00]" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-[#12355B]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-[#1C4E80]" />;
      default:
        return <Activity className="w-4 h-4 text-[#12355B]" />;
    }
  };

  return (
    <div className="bg-white rounded-sm p-4 border border-[#D5DCE3] shadow-xs hover:border-[#1C4E80]/40 transition-colors flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6573]">
          {stat.title}
        </span>
        <div className="w-7 h-7 rounded-sm bg-[#EAF2F8] border border-[#D5DCE3] flex items-center justify-center flex-shrink-0">
          {getIcon(stat.iconName)}
        </div>
      </div>

      <div className="mt-2.5">
        <div className="text-xl sm:text-2xl font-bold text-[#1F2933] tracking-tight">
          {stat.value}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 text-xs">
          <span
            className={`inline-flex items-center font-semibold px-1.5 py-0.2 rounded-xs text-[10px] ${
              stat.isPositive
                ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                : 'bg-[#FFEBEE] text-[#B42318] border border-[#FFCDD2]'
            }`}
          >
            {stat.isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />
            )}
            {stat.change}
          </span>
          <span className="text-[#5B6573] text-[11px] font-medium truncate">{stat.timeframe}</span>
        </div>
      </div>
    </div>
  );
};

