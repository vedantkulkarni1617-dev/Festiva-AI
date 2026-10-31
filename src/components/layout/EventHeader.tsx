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
  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Wedding':
      case 'Anniversary':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Birthday':
        return <PartyPopper className="w-4 h-4 text-amber-500" />;
      case 'Corporate Event':
        return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case 'College Festival':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
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

    if (diffDays === 0) return { label: 'Event Day Today! 🎉', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (diffDays > 0) return { label: `D-${diffDays} Days Away`, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    return { label: `Celebrated ${Math.abs(diffDays)}d ago`, color: 'text-slate-600 bg-slate-100 border-slate-200' };
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

  // Vendor stats
  const totalVendors = event.vendors?.length || 0;
  const bookedVendors = event.vendors?.filter(v => v.status === 'Booked').length || 0;

  return (
    <div className="bg-white border-b border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Title & Metadata */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                {getCategoryIcon(event.category)}
                <span>{event.category}</span>
              </span>

              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border ${countdown.color}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{countdown.label}</span>
              </span>

              {event.isDemo && (
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Competition Showcase Demo
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {event.name}
            </h1>

            {/* Quiet metadata with clean typographic separators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.location || 'Location TBD'}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.guestCount} Guests</span>
              </span>
              {event.themeOrStyle && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-600 truncate max-w-xs">{event.themeOrStyle}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Metrics Strip & Actions */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            {/* Budget Metric */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[170px]">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium">Planned / Budget</span>
                {isOverBudget && (
                  <span className="text-rose-600 font-semibold inline-flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Over
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 font-mono tabular-nums">
                <span className={`text-base font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatCurrency(plannedSpend, currency, true)}
                </span>
                <span className="text-xs text-slate-400">/ {formatCurrency(totalBudget, currency, true)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-rose-500' : budgetRatio > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                />
              </div>
            </div>

            {/* Readiness Metric */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[150px]">
              <div className="text-xs text-slate-500 mb-1 font-medium">Readiness</div>
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-xs text-slate-400">Tasks</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-800">
                    {completedTasks}/{totalTasks}
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-400">Booked</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-indigo-700">
                    {bookedVendors}/{totalVendors}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExportModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                title="Print or export event plan"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Export / Print</span>
              </button>

              <button
                onClick={onDeleteEvent}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-colors"
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
