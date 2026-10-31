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
  HelpCircle,
  Zap,
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
import { SUPPORTED_CURRENCIES } from '../../services/currencyService';

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

  // Validate form inputs
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Please provide an event name.';
    if (!date) errors.date = 'Event date is required.';
    if (!guestCount || guestCount <= 0) errors.guestCount = 'Guest count must be at least 1.';
    if (!totalBudget || totalBudget <= 0) errors.totalBudget = 'Total budget must be greater than 0.';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);
    setLoadingStep('Initializing Festiva celebration architect...');

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

      setLoadingStep('Structuring budget categories & timeline...');
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
          particleCount: 80,
          spread: 70,
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
    if (!validateForm()) return;

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
        particleCount: 70,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Create New Celebration</h2>
              <p className="text-xs text-indigo-100">AI-powered plan, budget allocation, schedule & checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Fill Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick-start presets:
          </span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-md font-medium transition-colors"
            >
              {p.category}: {p.name?.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-900">Festiva AI Architect is Crafting Your Plan</h3>
              <p className="text-xs text-indigo-600 font-medium animate-pulse">{loadingStep}</p>
              <p className="text-xs text-slate-400 mt-2">
                Calculating cost estimates, scheduling backward from {date || 'event date'}, and generating themes.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Error Notification if AI Call Failed */}
            {apiError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-amber-900">AI Service Notice</p>
                    <p className="text-amber-800">{apiError.message}</p>
                    {apiError.isApiKeyMissing && (
                      <p className="text-amber-700">
                        A Gemini API Key was not detected in server environment variables. You can explore immediately using our offline Curated Celebration Blueprint engine.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleUseCuratedFallback}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                  >
                    Generate with Curated Festiva Blueprint Engine
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Name */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maya & Arjun's Sangeet & Reception"
                  className={`w-full text-sm px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    validationErrors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-xs text-rose-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Event Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EventCategory)}
                  className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Scheduled Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full text-sm px-3.5 py-2 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    validationErrors.date
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {validationErrors.date && (
                  <p className="text-xs text-rose-600">{validationErrors.date}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Location / City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco Bay Area, CA"
                    className="w-full text-sm pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Expected Guests */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Guest Count <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={e => setGuestCount(Number(e.target.value))}
                    className="w-full text-sm pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Total Budget & Currency */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Total Budget & Currency <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="text-xs font-medium px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map(c => (
                      <option key={c.code} value={c.code}>
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
                    className="flex-1 text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Venue Setting Preference */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Venue Setting</label>
                <select
                  value={venuePreference}
                  onChange={e => setVenuePreference(e.target.value as VenuePreference)}
                  className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="Indoor">Indoor (Ballroom / Hall / Loft)</option>
                  <option value="Outdoor">Outdoor (Garden / Vineyard / Lawn)</option>
                  <option value="Hybrid / Either">Hybrid / Flexible</option>
                  <option value="Destination">Destination Resort</option>
                </select>
              </div>

              {/* Preferred Theme / Style */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">Preferred Theme or Aesthetic</label>
                <input
                  type="text"
                  value={themeOrStyle}
                  onChange={e => setThemeOrStyle(e.target.value)}
                  placeholder="e.g. Modern Romantic Minimalist with Blush & Terracotta Accents"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Dietary Requirements */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Dietary Requirements</label>
                <input
                  type="text"
                  value={dietaryRequirements}
                  onChange={e => setDietaryRequirements(e.target.value)}
                  placeholder="e.g. 5 Vegan, 4 Gluten-Free, Nut-free options"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Planning Style */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Planning Style</label>
                <select
                  value={planningStyle}
                  onChange={e => setPlanningStyle(e.target.value as PlanningStyle)}
                  className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="Balanced & Structured">Balanced & Structured</option>
                  <option value="Relaxed & Delegated">Relaxed & Delegated</option>
                  <option value="Hands-On & Detailed">Hands-On & Detailed</option>
                </select>
              </div>

              {/* Special Requests */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">Special Requests & Features</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Live jazz trio for cocktails, champagne tower, sparkler exit, photo booth with vintage props"
                  className="w-full text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleUseCuratedFallback}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Use Fast Blueprint Engine (Offline)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Event Plan</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
