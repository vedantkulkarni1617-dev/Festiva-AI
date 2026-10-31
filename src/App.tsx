import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Heart,
  Plus,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import {
  EventRecord,
  ActiveTab,
  CurrencyCode,
} from './types';
import { StorageService } from './services/storageService';
import { Navbar } from './components/layout/Navbar';
import { EventHeader } from './components/layout/EventHeader';
import { OverviewTab } from './components/tabs/OverviewTab';
import { BudgetTab } from './components/tabs/BudgetTab';
import { TimelineTab } from './components/tabs/TimelineTab';
import { VendorsTab } from './components/tabs/VendorsTab';
import { ThemesTab } from './components/tabs/ThemesTab';
import { AssistantTab } from './components/tabs/AssistantTab';
import { EventCreateModal } from './components/events/EventCreateModal';
import { EventSelectorModal } from './components/events/EventSelectorModal';
import { ExportModal } from './components/tabs/ExportModal';
import { formatCurrency } from './services/currencyService';

export default function App() {
  // Global Event State
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize from storage on mount
  useEffect(() => {
    const loadedEvents = StorageService.getAllEvents();
    const activeId = StorageService.getActiveEventId();
    setEvents(loadedEvents);
    setActiveEventId(activeId);
  }, []);

  // Current active event
  const activeEvent =
    events.find(e => e.id === activeEventId) || events[0];

  // Save event changes
  const handleUpdateActiveEvent = (updated: EventRecord) => {
    StorageService.saveEvent(updated);
    setEvents(StorageService.getAllEvents());
  };

  // Create new event
  const handleEventCreated = (newEvent: EventRecord) => {
    StorageService.saveEvent(newEvent);
    const refreshed = StorageService.getAllEvents();
    setEvents(refreshed);
    setActiveEventId(newEvent.id);
    setActiveTab('overview');
    showToast(`Created celebration plan for "${newEvent.name}"!`);
  };

  // Switch active event
  const handleSelectEvent = (id: string) => {
    StorageService.setActiveEventId(id);
    setActiveEventId(id);
    const target = events.find(e => e.id === id);
    if (target) {
      showToast(`Switched to "${target.name}"`);
    }
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    const toDelete = events.find(e => e.id === id);
    StorageService.deleteEvent(id);
    const refreshed = StorageService.getAllEvents();
    setEvents(refreshed);
    const newActiveId = StorageService.getActiveEventId();
    setActiveEventId(newActiveId);
    showToast(`Deleted "${toDelete?.name || 'event'}"`);
  };

  // Reset demo
  const handleResetDemo = () => {
    const demo = StorageService.resetToDemo();
    setEvents(StorageService.getAllEvents());
    setActiveEventId(demo.id);
    setActiveTab('overview');
    showToast('Loaded Grand Wedding Showcase Demo with full budget and timeline!');
  };

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Welcome to Festiva AI</h2>
          <p className="text-xs text-slate-500">
            No celebration plans currently loaded. Start by creating a plan or loading our showcase demo.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetDemo}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Load Wedding Showcase Demo
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Create New Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Bar Navigation (no-print) */}
      <div className="no-print">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currency={currency}
          onCurrencyChange={setCurrency}
          onOpenNewEventModal={() => setIsCreateModalOpen(true)}
          onOpenEventSelector={() => setIsSelectorModalOpen(true)}
          onResetDemo={handleResetDemo}
          isDemoActive={Boolean(activeEvent.isDemo)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Event Header Banner (no-print) */}
        <div className="no-print">
          <EventHeader
            event={activeEvent}
            currency={currency}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onDeleteEvent={() => {
              if (confirm(`Are you sure you want to delete "${activeEvent.name}"?`)) {
                handleDeleteEvent(activeEvent.id);
              }
            }}
          />
        </div>

        {/* Tab View Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 no-print">
          {activeTab === 'overview' && (
            <OverviewTab
              event={activeEvent}
              currency={currency}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab
              event={activeEvent}
              currency={currency}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab
              event={activeEvent}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab
              event={activeEvent}
              currency={currency}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}

          {activeTab === 'themes' && (
            <ThemesTab
              event={activeEvent}
              currency={currency}
              onUpdateEvent={handleUpdateActiveEvent}
            />
          )}

          {activeTab === 'assistant' && (
            <AssistantTab
              event={activeEvent}
              currency={currency}
            />
          )}
        </div>

        {/* Print-Only Layout (Visible solely when printing or saving as PDF) */}
        <div className="hidden print-only p-8 text-black bg-white space-y-6">
          <div className="border-b-2 border-slate-800 pb-4">
            <h1 className="text-3xl font-bold">{activeEvent.name}</h1>
            <p className="text-sm text-slate-600 mt-1">
              Festiva AI Celebration Blueprint · {activeEvent.category} · {new Date(activeEvent.date).toLocaleDateString()}
            </p>
            <div className="text-xs text-slate-700 mt-2 flex gap-4">
              <span>Location: {activeEvent.location}</span>
              <span>Guests: {activeEvent.guestCount}</span>
              <span>Target Budget: {formatCurrency(activeEvent.totalBudget, currency)}</span>
            </div>
          </div>

          {/* Print Summary */}
          {activeEvent.overviewPlan?.summary && (
            <div className="space-y-1">
              <h2 className="text-base font-bold uppercase text-slate-800">Celebration Concept</h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeEvent.overviewPlan.summary}
              </p>
            </div>
          )}

          {/* Print Budget */}
          <div className="space-y-2 print-break-inside-avoid">
            <h2 className="text-base font-bold uppercase text-slate-800">Budget Breakdown</h2>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1.5 text-left">Category</th>
                  <th className="border border-slate-300 p-1.5 text-right">Planned Cost</th>
                  <th className="border border-slate-300 p-1.5 text-right">%</th>
                  <th className="border border-slate-300 p-1.5 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {(activeEvent.budget?.items || []).map(i => (
                  <tr key={i.id}>
                    <td className="border border-slate-300 p-1.5 font-medium">{i.category}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">
                      {formatCurrency(i.actualCost || i.estimatedCost, currency)}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{i.percentage}%</td>
                    <td className="border border-slate-300 p-1.5">{i.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print Timeline */}
          <div className="space-y-2 print-break-inside-avoid">
            <h2 className="text-base font-bold uppercase text-slate-800">Preparation Timeline</h2>
            <div className="space-y-1.5 text-xs">
              {(activeEvent.timeline || []).map(t => (
                <div key={t.id} className="flex items-start gap-2 border-b border-slate-200 pb-1">
                  <span className="font-mono text-slate-500 w-24 shrink-0">{t.suggestedDeadline}</span>
                  <span className="font-semibold w-28 shrink-0">[{t.priority} Priority]</span>
                  <span className={t.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Print Vendors */}
          <div className="space-y-2 print-break-inside-avoid">
            <h2 className="text-base font-bold uppercase text-slate-800">Vendor Directory</h2>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-1.5 text-left">Category</th>
                  <th className="border border-slate-300 p-1.5 text-left">Vendor Name</th>
                  <th className="border border-slate-300 p-1.5 text-left">Status</th>
                  <th className="border border-slate-300 p-1.5 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {(activeEvent.vendors || []).map(v => (
                  <tr key={v.id}>
                    <td className="border border-slate-300 p-1.5 font-medium">{v.category}</td>
                    <td className="border border-slate-300 p-1.5">{v.name}</td>
                    <td className="border border-slate-300 p-1.5">{v.status}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">
                      {formatCurrency(v.confirmedCost || v.estimatedCost, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer (no-print) */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-800">Festiva AI</span>
            <span>·</span>
            <span>Smart Celebration & Event Planner</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Server-Side Gemini Generation</span>
            <span>·</span>
            <span>Local Storage Persistence</span>
            <span>·</span>
            <span>Developer Competition Edition</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EventCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        currentCurrency={currency}
      />

      <EventSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={() => setIsSelectorModalOpen(false)}
        events={events}
        activeEventId={activeEvent.id}
        onSelectEvent={handleSelectEvent}
        onDeleteEvent={handleDeleteEvent}
        onOpenCreateNew={() => setIsCreateModalOpen(true)}
        currency={currency}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        event={activeEvent}
        currency={currency}
      />
    </div>
  );
}
