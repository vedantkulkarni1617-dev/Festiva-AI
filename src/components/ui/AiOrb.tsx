import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export type AiOrbState = 'idle' | 'processing' | 'responding' | 'error';

interface AiOrbProps {
  state?: AiOrbState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showStatusLabel?: boolean;
}

export const AiOrb: React.FC<AiOrbProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  showStatusLabel = false,
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', core: 'w-4 h-4', ring: 'w-7 h-7' },
    md: { container: 'w-12 h-12', core: 'w-6 h-6', ring: 'w-11 h-11' },
    lg: { container: 'w-20 h-20', core: 'w-10 h-10', ring: 'w-18 h-18' },
  };

  const currentSize = sizeMap[size];

  // Visual state styling
  const getStateConfig = () => {
    switch (state) {
      case 'processing':
        return {
          glow: 'from-cyan-400 via-indigo-500 to-fuchsia-500',
          ringColor: 'border-cyan-400/60',
          outerRingColor: 'border-fuchsia-500/40',
          pulseSpeed: 'animate-pulse',
          spinSpeed: 'animate-spin-slow',
          reverseSpin: 'animate-spin-reverse-slow',
          label: 'Neural Synthesis Active',
          textColor: 'text-cyan-400',
          dotColor: 'bg-cyan-400',
        };
      case 'responding':
        return {
          glow: 'from-cyan-300 via-blue-500 to-purple-600',
          ringColor: 'border-cyan-300/50',
          outerRingColor: 'border-purple-500/30',
          pulseSpeed: 'animate-ping duration-1000',
          spinSpeed: 'animate-spin-slow',
          reverseSpin: 'animate-spin-reverse-slow',
          label: 'Streaming Response',
          textColor: 'text-cyan-300',
          dotColor: 'bg-cyan-300',
        };
      case 'error':
        return {
          glow: 'from-rose-500 via-amber-600 to-rose-700',
          ringColor: 'border-rose-500/60',
          outerRingColor: 'border-amber-500/40',
          pulseSpeed: '',
          spinSpeed: '',
          reverseSpin: '',
          label: 'Neural Offline / Error',
          textColor: 'text-rose-400',
          dotColor: 'bg-rose-400',
        };
      case 'idle':
      default:
        return {
          glow: 'from-cyan-400/80 via-violet-600/80 to-indigo-600/80',
          ringColor: 'border-cyan-500/30',
          outerRingColor: 'border-violet-500/20',
          pulseSpeed: 'animate-orb-pulse',
          spinSpeed: 'animate-spin-slow',
          reverseSpin: 'animate-spin-reverse-slow',
          label: 'Gemini Neural Engine Ready',
          textColor: 'text-slate-400',
          dotColor: 'bg-cyan-400',
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.container} shrink-0`}>
        {/* Ambient atmospheric aura blur */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${config.glow} blur-md opacity-70 transition-all duration-500`}
        />

        {/* Outer orbital wireframe ring */}
        <div
          className={`absolute ${currentSize.ring} rounded-full border border-dashed ${config.outerRingColor} ${config.spinSpeed} transition-all duration-700`}
        />

        {/* Inner elliptical counter-rotating orbital ring */}
        <div
          className={`absolute ${currentSize.container} rounded-full border border-dotted ${config.ringColor} ${config.reverseSpin} opacity-80`}
        />

        {/* Core luminous sphere */}
        <div
          className={`relative ${currentSize.core} rounded-full bg-gradient-to-br ${config.glow} shadow-inner flex items-center justify-center transition-all duration-300`}
        >
          {state === 'error' ? (
            <AlertCircle className="w-2.5 h-2.5 text-white" />
          ) : (
            <Sparkles className="w-2.5 h-2.5 text-white/90" />
          )}
        </div>
      </div>

      {showStatusLabel && (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
          <span className={`${config.textColor} tracking-wide font-medium`}>{config.label}</span>
        </div>
      )}
    </div>
  );
};
