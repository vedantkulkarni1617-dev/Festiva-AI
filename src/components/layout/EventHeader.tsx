import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
  AlertTriangle,
  Heart,
  PartyPopper,
  Briefcase,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';
import { EventRecord, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services/currencyService';

interface EventHeaderProps {
  event: EventRecord;
  currency: CurrencyCode;
  onOpenExportModal: () => void;
  onDeleteEvent: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  currency,
  onOpenExportModal,
  onDeleteEvent,
}) => {
  // Category icon mapping with glowing accents
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Wedding':
      case 'Anniversary':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Birthday':
        return <PartyPopper className="w-4 h-4 text-amber-400" />;
      case 'Corporate Event':
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      case 'College Festival':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  // Date countdown math
  const getCountdownText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        label: 'Celebration Today! 🎉',
        style: 'text-rose-300 bg-rose-950/60 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      };
    }
    if (diffDays > 0) {
      return {
        label: `T-minus ${diffDays} Days`,
        style: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]',
      };
    }
    return {
      label: `Celebrated ${Math.abs(diffDays)}d ago`,
      style: 'text-slate-400 bg-slate-900 border-white/10',
    };
  };

  const countdown = getCountdownText(event.date);

  // Budget calculations
  const plannedSpend = (event.budget?.items || []).reduce(
    (sum, item) => sum + (item.actualCost || item.estimatedCost || 0),
    0
  );
  const totalBudget = event.totalBudget || 0;
  const budgetRatio = totalBudget > 0 ? (plannedSpend / totalBudget) * 100 : 0;
  const isOverBudget = plannedSpend > totalBudget;

  // Task stats
  const totalTasks = event.timeline?.length || 0;
  const completedTasks = event.timeline?.filter(t => t.completed).length || 0;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Vendor stats
  const totalVendors = event.vendors?.length || 0;
  const bookedVendors = event.vendors?.filter(v => v.status === 'Booked').length || 0;

  return (
    <div className="relative border-b border-white/10 bg-[#070913]/90 py-6 overflow-hidden">
      {/* Background ambient glow lines */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-32 bg-violet-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Title & Metadata */}
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-900/80 border border-white/10 px-2.5 py-1 rounded-lg">
                {getCategoryIcon(event.category)}
                <span>{event.category}</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border ${countdown.style}`}>
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{countdown.label}</span>
              </span>

              {event.isDemo && (
                <span className="text-xs font-mono font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                  Showcase Preset
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {event.name}
            </h1>

            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{event.location || 'Location TBD'}</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span>{event.guestCount} Guests</span>
              </span>
              {event.themeOrStyle && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 truncate max-w-sm">{event.themeOrStyle}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Metrics Strip & Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Budget Metric Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-xl p-3 min-w-[180px] transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-medium text-[11px] uppercase tracking-wider">Planned / Budget</span>
                {isOverBudget && (
                  <span className="text-rose-400 font-semibold font-mono text-[10px] inline-flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Over
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                <span className={`text-base font-bold ${isOverBudget ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {formatCurrency(plannedSpend, currency, true)}
                </span>
                <span className="text-xs text-slate-500">/ {formatCurrency(totalBudget, currency, true)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      : 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_#22d3ee]'
                  }`}
                  style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                />
              </div>
            </div>

            {/* Readiness Metric Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-violet-500/30 rounded-xl p-3 min-w-[160px] transition-colors">
              <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-medium">
                <span>Milestone Readiness</span>
                <span className="font-mono text-violet-400 text-[10px]">{taskPercent}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-[10px] text-slate-500">Tasks Done</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-200">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <div className="text-[10px] text-slate-500">Vendors Locked</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-cyan-400">
                    {bookedVendors}/{totalVendors}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900/70 hover:bg-slate-800 border border-white/10 hover:border-white/20 rounded-xl shadow-sm transition-all whitespace-nowrap"
                title="Print or export event plan"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export / Print</span>
              </button>

              <button
                onClick={onDeleteEvent}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-500/30 transition-all"
                title="Delete this event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
