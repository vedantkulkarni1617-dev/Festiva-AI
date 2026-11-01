import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Heart,
  Palette,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sliders,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EventCategory,
  VenuePreference,
  PlanningStyle,
  CurrencyCode,
  EventRecord,
} from '../../types';
import { ApiService, GeneratePlanParams } from '../../services/apiService';
import { SAMPLE_PRESETS } from '../../data/demoEvents';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../../services/currencyService';
import { AiOrb } from '../ui/AiOrb';

interface EventCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventRecord) => void;
  currentCurrency: CurrencyCode;
}

export const EventCreateModal: React.FC<EventCreateModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  currentCurrency,
}) => {
  // Stepper state (1: Essentials, 2: Budget & Scale, 3: Style & Experience, 4: Review & Synthesize)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EventCategory>('Wedding');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [currency, setCurrency] = useState<CurrencyCode>(currentCurrency);
  const [themeOrStyle, setThemeOrStyle] = useState('');
  const [venuePreference, setVenuePreference] = useState<VenuePreference>('Outdoor');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [planningStyle, setPlanningStyle] = useState<PlanningStyle>('Balanced & Structured');

  // UI Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<{ message: string; isApiKeyMissing?: boolean } | null>(null);

  if (!isOpen) return null;

  // Validate step 1
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Please enter an event title.';
    if (!date) errors.date = 'Scheduled date is required.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!guestCount || guestCount <= 0) errors.guestCount = 'Guest count must be at least 1.';
    if (!totalBudget || totalBudget <= 0) errors.totalBudget = 'Target budget must be greater than 0.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Next Step
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  // Populate from preset
  const applyPreset = (preset: Partial<EventRecord>) => {
    if (preset.name) setName(preset.name);
    if (preset.category) setCategory(preset.category);
    if (preset.date) setDate(preset.date);
    if (preset.location) setLocation(preset.location);
    if (preset.guestCount) setGuestCount(preset.guestCount);
    if (preset.totalBudget) setTotalBudget(preset.totalBudget);
    if (preset.currency) setCurrency(preset.currency);
    if (preset.themeOrStyle) setThemeOrStyle(preset.themeOrStyle);
    if (preset.venuePreference) setVenuePreference(preset.venuePreference);
    if (preset.dietaryRequirements) setDietaryRequirements(preset.dietaryRequirements);
    if (preset.specialRequests) setSpecialRequests(preset.specialRequests);
    if (preset.planningStyle) setPlanningStyle(preset.planningStyle);
    setValidationErrors({});
    setApiError(null);
  };

  // Submit Handler for AI Synthesis
  const handleGeneratePlan = async () => {
    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setLoadingStep('Initializing Gemini Neural Celebration Engine...');

    const planParams: GeneratePlanParams = {
      name: name.trim(),
      category,
      date,
      location: location.trim() || 'Venue TBD',
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      currency,
      themeOrStyle: themeOrStyle.trim() || `${category} Signature Celebration`,
      venuePreference,
      dietaryRequirements: dietaryRequirements.trim(),
      specialRequests: specialRequests.trim(),
      planningStyle,
    };

    try {
      setLoadingStep('Consulting Gemini AI model for personalized plan...');
      const generated = await ApiService.generateEventPlan(planParams);

      setLoadingStep('Synthesizing dynamic budget & timeline...');
      const newEvent: EventRecord = {
        id: `event-${Date.now()}`,
        name: planParams.name,
        category: planParams.category,
        date: planParams.date,
        location: planParams.location,
        guestCount: planParams.guestCount,
        totalBudget: planParams.totalBudget,
        currency: planParams.currency,
        themeOrStyle: planParams.themeOrStyle,
        venuePreference: planParams.venuePreference as VenuePreference,
        dietaryRequirements: planParams.dietaryRequirements,
        specialRequests: planParams.specialRequests,
        planningStyle: planParams.planningStyle as PlanningStyle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        overviewPlan: generated.overviewPlan,
        budget: generated.budget,
        timeline: generated.timeline,
        vendors: generated.vendors,
        themeIdeas: generated.themeIdeas,
      };

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {}

      onEventCreated(newEvent);
      onClose();
    } catch (err: any) {
      console.warn('AI Plan Generation encountered issue:', err);
      setApiError({
        message: err?.message || 'Failed to generate event plan from Gemini API.',
        isApiKeyMissing: err?.isApiKeyMissing,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Curated Blueprint Fallback
  const handleUseCuratedFallback = () => {
    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1);
      return;
    }

    const planParams: GeneratePlanParams = {
      name: name.trim(),
      category,
      date,
      location: location.trim() || 'Venue TBD',
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      currency,
      themeOrStyle: themeOrStyle.trim() || `${category} Signature Celebration`,
      venuePreference,
      dietaryRequirements: dietaryRequirements.trim(),
      specialRequests: specialRequests.trim(),
      planningStyle,
    };

    const curated = ApiService.generateCuratedBlueprint(planParams);

    const newEvent: EventRecord = {
      id: `event-${Date.now()}`,
      name: planParams.name,
      category: planParams.category,
      date: planParams.date,
      location: planParams.location,
      guestCount: planParams.guestCount,
      totalBudget: planParams.totalBudget,
      currency: planParams.currency,
      themeOrStyle: planParams.themeOrStyle,
      venuePreference: planParams.venuePreference as VenuePreference,
      dietaryRequirements: planParams.dietaryRequirements,
      specialRequests: planParams.specialRequests,
      planningStyle: planParams.planningStyle as PlanningStyle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      overviewPlan: curated.overviewPlan,
      budget: curated.budget,
      timeline: curated.timeline,
      vendors: curated.vendors,
      themeIdeas: curated.themeIdeas,
    };

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    onEventCreated(newEvent);
    onClose();
  };

  const categories: EventCategory[] = [
    'Wedding',
    'Birthday',
    'Anniversary',
    'College Festival',
    'Corporate Event',
    'Community Gathering',
    'Custom',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070913]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#0d1326] rounded-2xl max-w-3xl w-full shadow-[0_0_50px_-10px_rgba(34,211,238,0.25)] border border-white/15 overflow-hidden my-6 text-slate-100">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-500/10 via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AiOrb state={isLoading ? 'processing' : 'idle'} size="sm" />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Architect New Celebration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  AI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Stage {currentStep} of 4: {['Event Essentials', 'Budget & Scale', 'Style & Experience', 'Review & Synthesis'][currentStep - 1]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation Indicator */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-white/10 flex items-center justify-between text-xs">
          {[
            { step: 1, label: 'Essentials' },
            { step: 2, label: 'Budget & Scale' },
            { step: 3, label: 'Aesthetic' },
            { step: 4, label: 'Review & AI' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (s.step === 1 || (s.step === 2 && validateStep1()) || (s.step >= 3 && validateStep1() && validateStep2())) {
                    setCurrentStep(s.step);
                  }
                }}
                className={`flex items-center gap-2 transition-colors ${
                  isCurrent
                    ? 'text-cyan-300 font-bold'
                    : isCompleted
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#22d3ee]'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : s.step}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preset Quick Fill Bar */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-0.5 bg-slate-900 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 rounded-md font-medium transition-colors"
            >
              {p.category}: {p.name?.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-12 text-center space-y-5">
            <div className="mx-auto flex justify-center">
              <AiOrb state="processing" size="lg" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white tracking-wide">
                Festiva AI Neural Engine at Work
              </h3>
              <p className="text-xs font-mono text-cyan-400 animate-pulse">{loadingStep}</p>
              <p className="text-xs text-slate-400 pt-2">
                Simulating budget allocation distributions, calculating backward preparation schedule, and compiling custom theme palettes.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        {!isLoading && (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Error Notification if AI Call Failed */}
            {apiError && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-amber-200">AI Service Status Notice</p>
                    <p className="text-amber-300/90">{apiError.message}</p>
                    {apiError.isApiKeyMissing && (
                      <p className="text-amber-400">
                        A Gemini API Key was not detected in environment secrets. You can still generate full-fidelity plans instantly using our offline blueprint engine.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleUseCuratedFallback}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors"
                  >
                    Generate via Curated Blueprint Engine
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Event Essentials */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Event Essentials</h3>
                  <p className="text-xs text-slate-400">Define the core parameters and date of your celebration</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Event Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya & Arjun's Sangeet & Reception"
                      className={`w-full text-sm px-3.5 py-2.5 bg-slate-900/80 border rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 transition-all ${
                        validationErrors.name ? 'border-rose-500' : 'border-white/15'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-rose-400 mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as EventCategory)}
                        className="w-full text-sm px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c} value={c} className="bg-slate-900">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Scheduled Date <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className={`w-full text-sm px-3.5 py-2 bg-slate-900 border rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white ${
                          validationErrors.date ? 'border-rose-500' : 'border-white/15'
                        }`}
                      />
                      {validationErrors.date && (
                        <p className="text-xs text-rose-400 mt-1">{validationErrors.date}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Location / Target City</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco Bay Area, CA"
                        className="w-full text-sm pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Scale */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Scale & Financial Allocations</h3>
                  <p className="text-xs text-slate-400">Specify capacity, budget ceiling, and venue atmosphere</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Expected Guest Count <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        min={1}
                        value={guestCount}
                        onChange={e => setGuestCount(Number(e.target.value))}
                        className="w-full text-sm pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono"
                      />
                    </div>
                    {validationErrors.guestCount && (
                      <p className="text-xs text-rose-400 mt-1">{validationErrors.guestCount}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Target Budget & Currency <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as CurrencyCode)}
                        className="text-xs font-mono font-medium px-2.5 py-2 bg-slate-900 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        {Object.values(SUPPORTED_CURRENCIES).map(c => (
                          <option key={c.code} value={c.code} className="bg-slate-900">
                            {c.code} ({c.symbol})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={totalBudget}
                        onChange={e => setTotalBudget(Number(e.target.value))}
                        className="flex-1 text-sm px-3.5 py-2.5 bg-slate-900/80 border border-white/15 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    {validationErrors.totalBudget && (
                      <p className="text-xs text-rose-400 mt-1">{validationErrors.totalBudget}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Venue Preference</label>
                    <select
                      value={venuePreference}
                      onChange={e => setVenuePreference(e.target.value as VenuePreference)}
                      className="w-full text-sm px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-white cursor-pointer"
                    >
                      <option value="Indoor" className="bg-slate-900">Indoor (Ballroom / Loft / Hall)</option>
                      <option value="Outdoor" className="bg-slate-900">Outdoor (Vineyard / Garden / Pavilion)</option>
                      <option value="Hybrid / Either" className="bg-slate-900">Hybrid / Flexible Setting</option>
                      <option value="Destination" className="bg-slate-900">Destination Resort</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Style & Experience */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Creative Style & Experience Details</h3>
                  <p className="text-xs text-slate-400">Guide the aesthetic theme, music vibes, and culinary requirements</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Theme or Aesthetic</label>
                    <input
                      type="text"
                      value={themeOrStyle}
                      onChange={e => setThemeOrStyle(e.target.value)}
                      placeholder="e.g. Modern Sunset Minimalist with Blush & Terracotta Accents"
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-900/80 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Dietary Requirements</label>
                      <input
                        type="text"
                        value={dietaryRequirements}
                        onChange={e => setDietaryRequirements(e.target.value)}
                        placeholder="e.g. 5 Vegan, 4 Gluten-Free, Nut-free options"
                        className="w-full text-sm px-3.5 py-2.5 bg-slate-900/80 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Planning Pace</label>
                      <select
                        value={planningStyle}
                        onChange={e => setPlanningStyle(e.target.value as PlanningStyle)}
                        className="w-full text-sm px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-white cursor-pointer"
                      >
                        <option value="Balanced & Structured" className="bg-slate-900">Balanced & Structured</option>
                        <option value="Relaxed & Delegated" className="bg-slate-900">Relaxed & Delegated</option>
                        <option value="Hands-On & Detailed" className="bg-slate-900">Hands-On & Detailed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Special Requests & Features</label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                      placeholder="e.g. String quartet for cocktails, champagne tower, sparkler exit, photo booth"
                      className="w-full text-sm px-3.5 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Synthesis */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Neural Review & Plan Synthesis</span>
                  </h3>
                  <p className="text-xs text-slate-400">Confirm parameters before generating your tailored celebration blueprint</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Title</span>
                      <div className="font-bold text-white truncate">{name}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Category</span>
                      <div className="font-semibold text-cyan-300">{category}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Scheduled Date</span>
                      <div className="font-mono text-slate-200">{date}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Budget</span>
                      <div className="font-mono font-bold text-emerald-400">
                        {formatCurrency(totalBudget, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Guest Count:</span> {guestCount} Guests
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">Venue:</span> {venuePreference}
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase">Theme / Style:</span>{' '}
                      {themeOrStyle || 'Signature Elegance'}
                    </div>
                    {dietaryRequirements && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 uppercase">Dietary:</span> {dietaryRequirements}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Gemini will generate a structured blueprint: category budget allocations, date-aware timeline phases, vendor checklist, and creative themes.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        {!isLoading && (
          <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-[0_0_15px_-3px_rgba(34,211,238,0.5)] transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleUseCuratedFallback}
                    className="text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors mr-2 hidden sm:inline"
                    title="Generate without external API call"
                  >
                    Use Offline Engine
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 rounded-xl shadow-[0_0_25px_-3px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all font-sans"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Synthesize AI Plan</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
