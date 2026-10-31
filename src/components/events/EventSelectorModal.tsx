import React from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Check, Trash2, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Celebration Workspace</h3>
            <p className="text-xs text-slate-500">Manage and switch between your planned celebrations</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.map(ev => {
            const isActive = ev.id === activeEventId;
            return (
              <div
                key={ev.id}
                onClick={() => {
                  onSelectEvent(ev.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ev.category}
                    </span>
                    {ev.isDemo && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Demo
                      </span>
                    )}
                    {isActive && (
                      <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">{ev.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{ev.guestCount} guests</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{formatCurrency(ev.totalBudget, currency)}</span>
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
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">{events.length} saved celebrations</span>
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Another Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
