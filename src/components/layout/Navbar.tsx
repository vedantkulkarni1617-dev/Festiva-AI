import React from 'react';
import { Sparkles, Plus, Compass, Layers, Zap } from 'lucide-react';
import { ActiveTab, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../services/currencyService';
import { AiOrb } from '../ui/AiOrb';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onOpenNewEventModal: () => void;
  onOpenEventSelector: () => void;
  onResetDemo: () => void;
  isDemoActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currency,
  onCurrencyChange,
  onOpenNewEventModal,
  onOpenEventSelector,
  onResetDemo,
  isDemoActive,
}) => {
  const navTabs: { id: ActiveTab; label: string }[] = [
    { id: 'overview', label: 'Master Plan' },
    { id: 'budget', label: 'Budget Matrix' },
    { id: 'timeline', label: 'Timeline Milestones' },
    { id: 'vendors', label: 'Vendor Grid' },
    { id: 'themes', label: 'Creative Studio' },
    { id: 'assistant', label: 'Neural Assistant' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070913]/85 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Wordmark & AI Engine Indicator */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onTabChange('overview')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1px] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all">
                <div className="w-full h-full bg-[#070913] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                    Festiva<span className="text-cyan-400 font-mono text-sm ml-0.5">.AI</span>
                  </span>
                  <span className="hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    v2.0
                  </span>
                </div>
              </div>
            </button>

            {/* Neural Engine Status Indicator */}
            <div className="hidden lg:flex items-center pl-3 border-l border-white/10">
              <AiOrb state="idle" size="sm" showStatusLabel={true} />
            </div>
          </div>

          {/* Zone 2: Navigation Links with futuristic glow states */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-xl">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Currency */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center">
              <select
                value={currency}
                onChange={e => onCurrencyChange(e.target.value as CurrencyCode)}
                className="text-xs font-mono font-medium bg-slate-900/80 border border-white/15 hover:border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
                aria-label="Select Currency"
              >
                {Object.values(SUPPORTED_CURRENCIES).map(c => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Demo Reset / Load Demo */}
            <button
              onClick={onResetDemo}
              title="Reload the pre-configured Grand Wedding Showcase Demo"
              className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap hidden md:inline-flex items-center gap-1.5 ${
                isDemoActive
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              <span>{isDemoActive ? 'Wedding Demo' : 'Load Demo'}</span>
            </button>

            {/* Switch / View All Events */}
            <button
              onClick={onOpenEventSelector}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              title="Switch or manage events"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Events</span>
            </button>

            {/* Primary Action: New Event */}
            <button
              onClick={onOpenNewEventModal}
              className="relative group overflow-hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 rounded-lg shadow-[0_0_20px_-3px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all whitespace-nowrap"
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-4 h-4 text-white relative z-10" />
              <span className="relative z-10">Plan Event</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-white/10 no-scrollbar">
          {navTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)] font-semibold'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
