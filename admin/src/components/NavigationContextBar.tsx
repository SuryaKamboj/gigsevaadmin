import React from 'react';
import { NavigationSourceContext } from '../types';
import { ArrowLeft, ChevronRight, Filter, RotateCcw, X, Info } from 'lucide-react';

interface NavigationContextBarProps {
  navContext: NavigationSourceContext;
  navStack?: NavigationSourceContext[];
  onReturnToSource: () => void;
  onNavigateToStackIndex?: (index: number) => void;
  // Contextual filter props (optional)
  filterActive?: boolean;
  filterLabel?: string;
  onClearFilter?: () => void;
  filteredCount?: number;
  totalCount?: number;
  itemLabel?: string;
  currentDestinationName?: string;
}

export const NavigationContextBar: React.FC<NavigationContextBarProps> = ({
  navContext,
  navStack = [],
  onReturnToSource,
  onNavigateToStackIndex,
  filterActive = false,
  filterLabel,
  onClearFilter,
  filteredCount,
  totalCount,
  itemLabel = 'records',
  currentDestinationName,
}) => {
  // Determine user-friendly return label
  const getReturnButtonLabel = () => {
    if (navContext.sourceRecordType === 'worker') {
      return `Back to ${navContext.sourceRecordName || navContext.sourceRecordId}'s Profile`;
    }
    if (navContext.sourceRecordType === 'user') {
      return `Back to ${navContext.sourceRecordName || navContext.sourceRecordId}'s Profile`;
    }
    if (navContext.sourceRecordType === 'complaint') {
      return `Back to Complaint ${navContext.sourceRecordId || ''}`;
    }
    if (navContext.sourceRecordType === 'transaction') {
      return `Back to Transaction ${navContext.sourceRecordId || ''}`;
    }
    if (navContext.sourceRecordType === 'refund') {
      return `Back to Refund ${navContext.sourceRecordId || ''}`;
    }
    if (navContext.sourceRecordType === 'payout') {
      return `Back to Payout ${navContext.sourceRecordId || ''}`;
    }
    if (navContext.sourceRecordType === 'commission') {
      return `Back to Commission ${navContext.sourceRecordId || ''}`;
    }
    if (navContext.sourceRecordType === 'job') {
      return `Back to Job ${navContext.sourceRecordId || ''}`;
    }
    return `Back to ${navContext.sourceModuleName}`;
  };

  const destinationText = currentDestinationName || 'Details';

  // Build the full breadcrumb sequence from navStack + current destination
  // If navStack has entries: navStack[0] -> navStack[1] -> ... -> destination
  // Otherwise: navContext -> destination
  const breadcrumbItems = navStack.length > 0 ? navStack : [navContext];

  return (
    <div className="bg-white border border-[#BAC7D5] rounded-sm shadow-xs mb-4 overflow-hidden animate-in fade-in duration-150">
      {/* Top Header: Breadcrumbs & Back Button */}
      <div className="p-3 bg-[#F4F6F8] border-b border-[#D5DCE3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Prominent Back Navigation Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReturnToSource}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#12355B] bg-white hover:bg-[#EAF2F8] active:bg-[#D5E6F5] border border-[#BAC7D5] rounded-xs shadow-xs transition-colors cursor-pointer group min-h-[36px]"
            title={`Return to previous context (${getReturnButtonLabel()})`}
          >
            <ArrowLeft className="w-4 h-4 text-[#12355B] group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
            <span>{getReturnButtonLabel()}</span>
          </button>
        </div>

        {/* Right: Multi-Step Administrative Breadcrumbs with collapsible tail on mobile */}
        <nav
          aria-label="Cross-module breadcrumb navigation"
          className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5B6573]"
        >
          {breadcrumbItems.map((item, idx) => {
            const isFirst = idx === 0;
            const isLastInStack = idx === breadcrumbItems.length - 1;
            const label =
              item.sourceRecordName && item.sourceRecordName !== item.sourceRecordId
                ? `${item.sourceRecordName} · ${item.sourceRecordId}`
                : item.sourceRecordId || item.sourceRecordName || item.sourceModuleName;

            // If chain is longer than 3 items, show ellipsis on middle items on very small screens
            const isMiddleHiddenOnMobile = breadcrumbItems.length > 3 && !isFirst && !isLastInStack;

            return (
              <React.Fragment key={idx}>
                {isFirst ? (
                  <span
                    onClick={() => onNavigateToStackIndex && onNavigateToStackIndex(idx)}
                    className={`font-semibold text-[#1F2933] ${
                      onNavigateToStackIndex ? 'hover:underline cursor-pointer' : ''
                    }`}
                  >
                    {item.sourceModuleName}
                  </span>
                ) : null}

                <ChevronRight className={`w-3.5 h-3.5 text-[#8795A5] flex-shrink-0 ${isMiddleHiddenOnMobile ? 'hidden sm:inline' : ''}`} />

                <button
                  type="button"
                  onClick={() => onNavigateToStackIndex && onNavigateToStackIndex(idx)}
                  className={`font-mono font-bold text-[#12355B] bg-white px-1.5 py-0.5 rounded-xs border border-[#BAC7D5] text-[11px] transition-colors ${
                    onNavigateToStackIndex ? 'hover:bg-[#EAF2F8] hover:border-[#12355B] cursor-pointer' : ''
                  } ${isMiddleHiddenOnMobile ? 'hidden sm:inline' : ''}`}
                  title={`Jump directly back to ${item.sourceModuleName} (${label})`}
                >
                  {label}
                </button>
              </React.Fragment>
            );
          })}

          <ChevronRight className="w-3.5 h-3.5 text-[#8795A5] flex-shrink-0" />
          <span className="font-semibold text-[#1C4E80] bg-[#EAF2F8] px-1.5 py-0.5 rounded-xs border border-[#BAC7D5]">
            {destinationText}
          </span>
        </nav>
      </div>

      {/* Contextual Filter Banner (Visible when active filter or filter details are present) */}
      {(filterActive || filterLabel) && (
        <div className="p-3 bg-[#EAF2F8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#12355B] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1C4E80]" />
              Contextual Filter:
            </span>

            {filterActive ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#1C4E80] rounded-xs text-[#12355B] font-semibold text-xs shadow-xs">
                <span>{filterLabel || 'Active Context Filter'}</span>
                {onClearFilter && (
                  <button
                    type="button"
                    onClick={onClearFilter}
                    className="p-0.5 ml-1 text-[#5B6573] hover:text-[#B42318] hover:bg-[#FFEBEE] rounded-xs transition-colors cursor-pointer"
                    title="Clear contextual filter (Show all records)"
                    aria-label="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#5B6573] italic">
                <Info className="w-3.5 h-3.5 text-[#8795A5]" />
                Filter cleared · Viewing all {itemLabel}
              </span>
            )}
          </div>

          {/* Counts & Clear Action */}
          <div className="flex items-center gap-2.5 text-xs text-[#5B6573]">
            {filteredCount !== undefined && (
              <span className="font-mono">
                <strong className="text-[#12355B] font-bold">{filteredCount}</strong>{' '}
                {itemLabel} found
                {totalCount !== undefined && ` (of ${totalCount})`}
              </span>
            )}

            {filterActive && onClearFilter && (
              <button
                type="button"
                onClick={onClearFilter}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1C4E80] hover:text-[#12355B] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All {itemLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
