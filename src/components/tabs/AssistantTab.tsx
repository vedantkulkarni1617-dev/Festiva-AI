import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { EventRecord, AssistantMessage, CurrencyCode } from '../../types';
import { ApiService } from '../../services/apiService';
import { AiOrb, AiOrbState } from '../ui/AiOrb';

interface AssistantTabProps {
  event: EventRecord;
  currency: CurrencyCode;
  onNavigateTab?: (tab: string) => void;
}

export const AssistantTab: React.FC<AssistantTabProps> = ({
  event,
  currency,
}) => {
  // Orb state driven strictly by request lifecycle
  const [orbState, setOrbState] = useState<AiOrbState>('idle');

  // Chat History
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Greetings! I am the **Festiva AI Neural Engine**, grounded in your real-time celebration dataset for **${event.name}** (${event.category} on ${event.date} with ${event.guestCount} guests).\n\nAsk me anything regarding financial allocation trimming, vendor contracts, weather contingencies, or custom guest experience flows.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How can I optimize our catering allocation by 15%?',
        'What high-priority tasks are scheduled for this phase?',
        'Recommend weather contingency safeguards for our venue',
        'Suggest 4 interactive icebreaker games for our guest count',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setOrbState('processing');
    setErrorMessage(null);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const reply = await ApiService.askAssistant(query, event, history);

      setOrbState('responding');

      const assistantMsg: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'What vendor contracts still need to be finalized?',
          'How can we make our guest arrival experience more memorable?',
        ],
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Return to idle after a brief transition
      setTimeout(() => setOrbState('idle'), 1200);
    } catch (err: any) {
      console.warn('Assistant error:', err);
      setOrbState('error');
      setErrorMessage(
        err?.message ||
          'Failed to reach Gemini assistant. Please verify your API key or check server connectivity.'
      );
      setTimeout(() => setOrbState('idle'), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Context Grounding Bar with Live AI Orb */}
      <div className="glass-panel rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <AiOrb state={orbState} size="md" showStatusLabel={true} />
          <div className="hidden sm:block border-l border-white/10 pl-3">
            <span className="font-mono text-cyan-400 font-semibold">Active Context:</span>{' '}
            <span className="text-slate-300">
              {event.name} ({event.category}) · {event.guestCount} guests · ${event.totalBudget.toLocaleString()} budget
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `reset-${Date.now()}`,
                role: 'assistant',
                content: `Chat session refreshed for **${event.name}**. How can I assist your planning today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestedActions: [
                  'How can I optimize our catering allocation by 15%?',
                  'What high-priority tasks are scheduled for this phase?',
                  'Recommend weather contingency safeguards for our venue',
                ],
              },
            ]);
            setErrorMessage(null);
            setOrbState('idle');
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 self-end sm:self-auto transition-colors font-mono"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="glass-panel rounded-2xl shadow-[0_0_50px_-15px_rgba(34,211,238,0.15)] flex flex-col h-[650px] overflow-hidden border border-white/10">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map(msg => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-[1px] shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                    <div className="w-full h-full bg-[#070913] rounded-[11px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-2 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-tr-none shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Message body with Markdown linebreaks */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] font-mono ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Suggested followup prompt chips */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2.5 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-400" /> Neural Prompts
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(action)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-cyan-950/70 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-left"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / Neural Synthesis Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 p-1 flex items-center justify-center shrink-0 animate-pulse shadow-[0_0_12px_#22d3ee]">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="bg-slate-900/90 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="font-mono text-cyan-300">Synthesizing personalized event advice...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask Festiva AI about budget optimization, vendor timelines, or contingency plans..."
              className="flex-1 text-xs sm:text-sm px-4 py-3 bg-slate-900 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 transition-all disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-3 text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 text-center font-mono">
            Responses are grounded in your saved event metrics and budget data.
          </div>
        </div>
      </div>
    </div>
  );
};
