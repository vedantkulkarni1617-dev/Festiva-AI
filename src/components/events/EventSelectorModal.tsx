import React from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Check, Trash2, Plus, Clock, Sparkles } from 'lucide-react';
import { EventRecord, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services/currencyService';

interface EventSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventRecord[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenCreateNew: () => void;
  currency: CurrencyCode;
}

export const EventSelectorModal: React.FC<EventSelectorModalProps> = ({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onDeleteEvent,
  onOpenCreateNew,
  currency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070913]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#0d1326] rounded-2xl max-w-xl w-full shadow-[0_0_50px_-10px_rgba(34,211,238,0.2)] border border-white/15 overflow-hidden text-slate-100">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Celebration Grid</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {events.length} saved
              </span>
            </h3>
            <p className="text-xs text-slate-400">Select or manage active celebration workspaces</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.map(ev => {
            const isActive = ev.id === activeEventId;

            // Actual task completion
            const totalTasks = ev.timeline?.length || 0;
            const completedTasks = ev.timeline?.filter(t => t.completed).length || 0;
            const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Date math
            const target = new Date(ev.date);
            target.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={ev.id}
                onClick={() => {
                  onSelectEvent(ev.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_-3px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/50'
                    : 'border-white/10 bg-slate-900/60 hover:border-white/25 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      {ev.category}
                    </span>
                    {ev.isDemo && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        Showcase Demo
                      </span>
                    )}
                    {isActive && (
                      <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1 font-mono">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white truncate">{ev.name}</h4>

                  {/* Metadata & Countdown */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                    <span className="font-mono">{new Date(ev.date).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="text-cyan-400 font-mono">
                      {diffDays === 0 ? 'Today!' : diffDays > 0 ? `T-${diffDays}d` : `${Math.abs(diffDays)}d ago`}
                    </span>
                    <span>·</span>
                    <span>{ev.guestCount} guests</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {formatCurrency(ev.totalBudget, currency)}
                    </span>
                  </div>

                  {/* Progress bar derived from actual tasks */}
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1 max-w-xs">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${taskPct}%` }}
                    />
                  </div>
                </div>

                {/* Delete button (prevent deleting if only 1 event) */}
                {events.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${ev.name}"?`)) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">{events.length} celebrations active</span>
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Another Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
