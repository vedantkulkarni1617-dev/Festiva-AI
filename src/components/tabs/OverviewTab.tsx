import React from 'react';
import {
  Sparkles,
  MapPin,
  Utensils,
  Music,
  Clock,
  ShieldAlert,
  ChevronRight,
  Palette,
  CheckCircle2,
  DollarSign,
  Users,
  Compass,
} from 'lucide-react';
import { EventRecord, ActiveTab, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services/currencyService';

interface OverviewTabProps {
  event: EventRecord;
  currency: CurrencyCode;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  currency,
  onNavigateTab,
}) => {
  const plan = event.overviewPlan;

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Cinematic Hero Atmosphere Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-[#0d1326] to-[#070913] border border-white/10 p-6 sm:p-8 shadow-[0_0_40px_-15px_rgba(34,211,238,0.2)]">
        {/* Decorative backdrop nebula glows */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono font-medium text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Master Celebration Blueprint</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug drop-shadow-sm">
            {plan?.recommendedTheme || event.themeOrStyle || `${event.category} Celebration`}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {plan?.summary ||
              `A customized celebration blueprint tailored for ${event.guestCount} guests, harmonizing budget efficiency, vendor logistics, and unforgettable guest experiences.`}
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-white/10">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{event.guestCount} Attending</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono tabular-nums bg-slate-900/60 px-2.5 py-1 rounded-md border border-white/10">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{formatCurrency(event.totalBudget, currency)} Target Budget</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-white/10">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{event.venuePreference} Setting</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Decor, Catering, Entertainment, Timeline Flow */}
        <div className="lg:col-span-2 space-y-6">
          {/* Decor & Atmosphere */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Atmosphere & Decoration Concepts</span>
              </h3>
              <button
                onClick={() => onNavigateTab('themes')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Theme Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              {(plan?.decorAtmosphere || [
                'Cohesive warm ambient lighting with dimmable fixtures',
                'Refined botanical runners and seasonal floral centerpieces',
                'Custom signage welcoming guests with hand-lettered milestone details',
                'Comfortable lounge seating cluster for conversation and mingling',
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-lg border border-white/5 hover:border-cyan-500/20 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_#22d3ee]" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Food & Catering Concepts */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-rose-400" />
              <span>Culinary & Catering Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {(plan?.foodAndCateringConcepts || [
                'Signature celebration cocktail / mocktail greeting upon arrival',
                'Passed hors d’oeuvres highlighting seasonal local ingredients',
                'Multi-course seated dinner or elevated grazing banquet station',
                'Artisanal dessert spread with custom celebration confection',
              ]).map((dish, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs sm:text-sm text-slate-200">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 w-5 h-5 rounded flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </span>
                  <span className="leading-relaxed">{dish}</span>
                </div>
              ))}
            </div>

            {event.dietaryRequirements && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                <span className="font-semibold text-amber-300">Dietary Accommodations:</span> {event.dietaryRequirements}
              </div>
            )}
          </div>

          {/* Guest Experience Flow */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Guest Experience Timeline Flow</span>
              </h3>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(plan?.guestExperienceFlow || [
                'Arrival & welcome beverages mingling',
                'Main ceremony or welcome toast address',
                'Dinner service and heartfelt speeches',
                'Musical entertainment and celebration dance floor',
                'Grand send-off or evening farewell',
              ]).map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                      {idx + 1}
                    </div>
                    {idx < (plan?.guestExperienceFlow?.length || 5) - 1 && (
                      <div className="w-px h-6 bg-slate-800 my-1" />
                    )}
                  </div>
                  <div className="pt-0.5 text-slate-300 leading-relaxed font-medium">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Venue Criteria, Entertainment, Risks */}
        <div className="space-y-6">
          {/* Venue Criteria */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Venue Selection Criteria</span>
            </h3>
            <div className="space-y-2">
              {(plan?.venueSelectionCriteria || [
                `Capacity to comfortably seat ${event.guestCount} guests plus stage/dance area`,
                'Adequate power supply and load-in access for AV/catering',
                'Sound curfew aligned with planned evening schedule',
                'Weather contingency protection for outdoor gatherings',
              ]).map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entertainment Options */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Music className="w-4 h-4 text-fuchsia-400" />
              <span>Entertainment & Music</span>
            </h3>
            <div className="space-y-2">
              {(plan?.entertainmentOptions || [
                'Live acoustic ensemble or strings for cocktail reception',
                'Professional sound engineer and DJ for speeches & dance set',
                'Interactive guest photo keepsakes or memory book station',
              ]).map((ent, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-200 font-medium">
                  {ent}
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Contingencies */}
          <div className="glass-panel glass-panel-hover rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Contingency & Risk Management</span>
            </h3>
            <div className="space-y-3">
              {(plan?.risksAndContingencies || [
                {
                  risk: 'Adverse weather or seasonal temperature drop',
                  mitigation: 'Pre-reserve covered marquee tent or indoor hall hold 48h prior.',
                },
                {
                  risk: 'Vendor arrival delay or transit bottleneck',
                  mitigation: 'Stagger load-in times 2 hours before official guest doors open.',
                },
              ]).map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{item.risk}</span>
                  </div>
                  <div className="text-slate-400 pl-3">
                    <span className="font-medium text-slate-300">Action:</span> {item.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
