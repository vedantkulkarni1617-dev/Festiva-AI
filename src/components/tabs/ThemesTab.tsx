import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Music,
  Gamepad2,
  Utensils,
  Share2,
  Mail,
  Shirt,
  Loader2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { EventRecord, ThemeCreativeIdea, CurrencyCode } from '../../types';
import { ApiService } from '../../services/apiService';

interface ThemesTabProps {
  event: EventRecord;
  currency: CurrencyCode;
  onUpdateEvent: (updated: EventRecord) => void;
}

export const ThemesTab: React.FC<ThemesTabProps> = ({
  event,
  currency,
  onUpdateEvent,
}) => {
  const themes = event.themeIdeas || [];
  const [activeThemeIdx, setActiveThemeIdx] = useState<number>(0);
  const [activeInvitationStyle, setActiveInvitationStyle] = useState<'formal' | 'modern' | 'playful'>('modern');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const currentTheme: ThemeCreativeIdea | undefined = themes[activeThemeIdx] || themes[0];

  // Clipboard helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate more themes with Gemini
  const handleGenerateMoreThemes = async () => {
    setIsGenerating(true);
    setGenError(null);

    try {
      const generated = await ApiService.generateThemes({
        category: event.category,
        themeOrStyle: event.themeOrStyle,
        guestCount: event.guestCount,
        budget: event.totalBudget,
        currency: event.currency,
        specialRequests: event.specialRequests,
      });

      if (generated && generated.length > 0) {
        const updatedThemes = [...themes, ...generated];
        onUpdateEvent({
          ...event,
          themeIdeas: updatedThemes,
        });
        setActiveThemeIdx(themes.length); // focus on newly generated
      }
    } catch (err: any) {
      setGenError(err?.message || 'Failed to generate additional themes from Gemini API.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentTheme) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <Palette className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">No Creative Themes Found</h3>
        <p className="text-xs text-slate-500">
          Click below to generate tailored theme concepts, palettes, and copy ideas.
        </p>
        <button
          onClick={handleGenerateMoreThemes}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg shadow"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Themes with Gemini</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Theme Selection Strip & Generator Button */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>Theme & Creative Inspiration Studio</span>
            </h3>
            <p className="text-xs text-slate-500">
              Curated visual palettes, invitation copy, activity concepts, and styling advice
            </p>
          </div>

          <button
            onClick={handleGenerateMoreThemes}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 rounded-lg shadow-sm transition-all shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Crafting Concepts...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate New Variations</span>
              </>
            )}
          </button>
        </div>

        {/* Error notice if Gemini call fails */}
        {genError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{genError}</span>
            </span>
            <button onClick={() => setGenError(null)} className="text-amber-600 font-semibold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Theme Tabs */}
        {themes.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
            {themes.map((th, idx) => (
              <button
                key={th.id || idx}
                onClick={() => setActiveThemeIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeThemeIdx === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Theme 0{idx + 1}: {th.themeTitle.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Theme Spotlight Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">
            {currentTheme.tagline || 'Signature Celebration Aesthetic'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {currentTheme.themeTitle}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed pt-1">
            {currentTheme.description}
          </p>
        </div>

        {/* Color Palette Swatches */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Curated Color Palette</span>
            </h4>
            <span className="text-[11px] text-slate-400">Click any swatch to copy HEX code</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {currentTheme.palette.map((color, idx) => {
              const isCopied = copiedText === color.hex;

              return (
                <button
                  key={idx}
                  onClick={() => handleCopy(color.hex, color.hex)}
                  className="group p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col justify-between h-28 relative overflow-hidden"
                >
                  <div
                    className="w-full h-12 rounded-lg shadow-inner mb-2"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 truncate">{color.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase flex items-center justify-between">
                      <span>{color.hex}</span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Decor & Dress Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Decor Concepts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Decoration & Styling Concepts</span>
            </h4>
            <div className="space-y-2">
              {currentTheme.decorConcepts.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dress Code Advice */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-rose-600" />
              <span>Dress Code & Guest Attire Guidance</span>
            </h4>
            <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {currentTheme.dressCodeAdvice ||
                'Celebration cocktail attire — guests are invited to dress with effortless elegance embracing the palette.'}
            </div>
          </div>
        </div>

        {/* Invitation Wording Generator */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>Invitation Copy Generator</span>
            </h4>

            {/* Tone Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['formal', 'modern', 'playful'] as const).map(style => (
                <button
                  key={style}
                  onClick={() => setActiveInvitationStyle(style)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                    activeInvitationStyle === style
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Active Invitation Text Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative group">
            <p className="text-sm font-serif italic text-slate-800 leading-relaxed max-w-2xl">
              "{currentTheme.invitationWording[activeInvitationStyle] ||
                `Join us to celebrate ${event.name} on ${event.date}.`}"
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="capitalize font-mono">{activeInvitationStyle} tone</span>
              <button
                onClick={() =>
                  handleCopy(
                    currentTheme.invitationWording[activeInvitationStyle] || '',
                    'invitation'
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors"
              >
                {copiedText === 'invitation' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column: Entertainment, Games & Activities, Food Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          {/* Entertainment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-purple-600" />
              <span>Music & Vibe</span>
            </h4>
            <div className="space-y-2">
              {currentTheme.entertainmentAndMusic.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Games & Activities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              <span>Games & Guest Moments</span>
            </h4>
            <div className="space-y-2">
              {currentTheme.gamesAndActivities.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Food Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-rose-600" />
              <span>Culinary Highlights</span>
            </h4>
            <div className="space-y-2">
              {currentTheme.foodAndDrinkHighlights.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Captions */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Social Media Caption Ideas</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentTheme.socialMediaCaptions.map((cap, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2">
                <p className="text-xs text-slate-700 italic">{cap}</p>
                <button
                  onClick={() => handleCopy(cap, `caption-${idx}`)}
                  className="self-end text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  {copiedText === `caption-${idx}` ? (
                    <span className="text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Copy className="w-3 h-3" /> Copy
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
