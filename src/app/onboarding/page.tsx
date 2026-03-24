'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  IconBot, IconArrowRight, IconSparkles, IconCheckCircle, IconLoader,
  IconBuilding, IconUsers, IconTarget, IconMegaphone, IconSkipForward,
  IconChevronRight, IconBolt, IconCheck
} from '@/components/icons';

// ─── Config ──────────────────────────────────────────────────────────────────

const PHASES = [
  { label: 'Negocio', icon: IconBuilding, color: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/30' },
  { label: 'Tu Cliente', icon: IconUsers, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { label: 'Diferenciación', icon: IconTarget, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { label: 'Voz de Marca', icon: IconMegaphone, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
];

const QUESTIONS = [
  "¿Cuál es el nombre de tu marca o negocio, y en qué industria o nicho opera?",
  "¿Qué hace exactamente tu producto o servicio? En tus propias palabras: ¿qué problema resuelve y para quién?",
  "¿Cuánto cuesta tu oferta principal y cuál es la transformación que prometes? Cuéntame el 'antes' y el 'después' de tus clientes.",
  "Descríbeme a tu cliente ideal: ¿qué edad tiene aproximadamente, cuál es su situación de vida y qué está experimentando en este momento?",
  "¿Cuáles son los 3 dolores o frustraciones más profundas de ese cliente? Intenta usar las mismas palabras que él usaría para describirlos.",
  "¿Qué es lo que más desea lograr? ¿Cuál es el resultado o transformación que sueña con conseguir?",
  "¿Qué le impide comprar? ¿Cuáles son sus principales objeciones, miedos o excusas para no dar el paso?",
  "¿Quiénes son tus principales competidores o alternativas en el mercado? ¿Por qué te eligen a ti sobre ellos?",
  "¿Cuál es tu ventaja o mecanismo único? ¿Qué tiene tu método o producto que ningún otro tiene igual?",
  "¿Tienes garantía o casos de éxito concretos que puedas compartir? Cuéntame resultados reales, números, testimonios.",
  "¿Cómo describirías la personalidad de tu marca? ¿Seria o divertida? ¿Técnica o cercana? ¿Formal o informal?",
  "¿Hay palabras, frases o estilos de comunicación que JAMÁS usarías en tu marca? ¿Algo que simplemente no te represente?",
];

const PHASE_RANGES = [[0, 2], [3, 6], [7, 9], [10, 11]];
const TOTAL = QUESTIONS.length;

// Questions where we show chip selectors (intel-powered)
const CHIPS_QUESTIONS: Record<number, keyof OnboardingIntel> = {
  4: 'pains',
  5: 'desires',
  6: 'objections',
};

const PERSONALITY_ARCHETYPES = [
  { id: 'directo', label: 'Directo y sin filtros', emoji: '⚡', description: 'Llama las cosas por su nombre. Sin rodeos, sin eufemismos. La gente lo respeta o lo deja, y está bien.' },
  { id: 'experto', label: 'Experto técnico', emoji: '🎯', description: 'Autoridad en el tema. Datos, metodología, profundidad. La credibilidad es la moneda.' },
  { id: 'mentor', label: 'Mentor cercano', emoji: '🤝', description: 'Cálido, empático, camina junto al cliente. Hace que el proceso se sienta acompañado.' },
  { id: 'rebelde', label: 'Rebelde del nicho', emoji: '🔥', description: 'Cuestiona lo establecido. Dice lo que otros no se animan. Propone lo diferente.' },
  { id: 'aspiracional', label: 'Líder aspiracional', emoji: '🌟', description: 'Inspira y eleva. Muestra el camino posible. La audiencia quiere ser como la marca.' },
];

function getPhaseIndex(qIndex: number) {
  for (let i = 0; i < PHASE_RANGES.length; i++) {
    const [start, end] = PHASE_RANGES[i];
    if (qIndex >= start && qIndex <= end) return i;
  }
  return PHASE_RANGES.length - 1;
}

// ─── Types ───────────────────────────────────────────────────────────────────

type AppPhase = 'welcome' | 'chat' | 'analyzing' | 'preview' | 'saving';

interface Message {
  role: 'agent' | 'user';
  content: string;
}

interface OnboardingIntel {
  pains: string[];
  desires: string[];
  objections: string[];
  mechanisms: string[];
}

interface GeneratedProfile {
  name: string;
  industry?: string;
  uvp?: string;
  competitors?: string;
  avatar_name?: string;
  avatar_age?: number;
  avatar_location?: string;
  avatar_pains: string[];
  avatar_desires: string[];
  avatar_objections: string[];
  brand_adjectives: string[];
  forbidden_words: string[];
  formality_level: number;
  product_name?: string;
  product_price?: string;
  product_transformation?: string;
  product_mechanism?: string;
  product_results?: string;
  product_guarantee?: string;
  default_consciousness_level: number;
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 12, enabled = true) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplay(text); setDone(true); return; }
    setDisplay('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      if (i < text.length) {
        setDisplay(text.slice(0, ++i));
      } else {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, enabled]);

  return { display, done };
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function AgentBubble({ text, isLast }: { text: string; isLast: boolean }) {
  const { display } = useTypewriter(text, 10, isLast);
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <IconBot size={14} className="text-brand-primary" />
      </div>
      <div className="bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{isLast ? display : text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-brand-primary/15 border border-brand-primary/25 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
        <p className="text-text-primary text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center flex-shrink-0">
        <IconBot size={14} className="text-brand-primary" />
      </div>
      <div className="bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IntelLoadingIndicator() {
  return (
    <div className="flex items-start gap-3 opacity-60">
      <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center flex-shrink-0">
        <IconBot size={14} className="text-brand-primary" />
      </div>
      <div className="bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <IconLoader size={12} className="text-brand-primary animate-spin" />
          <span className="text-[11px] text-text-muted">Investigando tu mercado...</span>
        </div>
      </div>
    </div>
  );
}

function ProfileChips({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.filter(Boolean).map((item, i) => (
        <span key={i} className={`text-xs px-2.5 py-1 rounded-full bg-elevated border border-border-subtle ${color}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

// Chip suggestion selector for multi-select questions
function ChipSelector({
  suggestions,
  selected,
  onToggle,
  maxSelect = 3,
}: {
  suggestions: string[];
  selected: string[];
  onToggle: (chip: string) => void;
  maxSelect?: number;
}) {
  const isMaxed = selected.length >= maxSelect;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 inline-block" />
        Sugerencias de mercado — click para seleccionar (máx. {maxSelect})
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((chip, i) => {
          const isSelected = selected.includes(chip);
          const isDisabled = isMaxed && !isSelected;
          return (
            <button
              key={i}
              onClick={() => !isDisabled && onToggle(chip)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 text-left flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-primary/20 border-brand-primary/50 text-brand-primary font-medium'
                  : isDisabled
                  ? 'bg-surface border-border-subtle text-text-muted opacity-40 cursor-not-allowed'
                  : 'bg-elevated border-border-subtle text-text-secondary hover:border-brand-primary/30 hover:text-text-primary cursor-pointer'
              }`}
            >
              {isSelected && <IconCheck size={10} className="flex-shrink-0" />}
              {chip}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[10px] text-brand-primary/70">
          {selected.length}/{maxSelect} seleccionados · Podés escribir más o enviar tal como está
        </p>
      )}
    </div>
  );
}

// Personality archetype selector for Q10
function PersonalitySelector({
  onSelect,
}: {
  onSelect: (description: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 inline-block" />
        Arquetipos — elegí el que más te representa
      </p>
      <div className="grid grid-cols-1 gap-2">
        {PERSONALITY_ARCHETYPES.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setActive(p.id);
              onSelect(p.description);
            }}
            className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 ${
              active === p.id
                ? 'bg-purple-400/10 border-purple-400/40 shadow-sm'
                : 'bg-elevated border-border-subtle hover:border-purple-400/20 hover:bg-purple-400/5'
            }`}
          >
            <span className="text-lg leading-none mt-0.5">{p.emoji}</span>
            <div>
              <p className={`text-sm font-semibold ${active === p.id ? 'text-purple-400' : 'text-text-primary'}`}>{p.label}</p>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{p.description}</p>
            </div>
            {active === p.id && (
              <div className="ml-auto flex-shrink-0">
                <IconCheckCircle size={16} className="text-purple-400" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshBrands, setActiveBrand } = useApp();

  const [appPhase, setAppPhase] = useState<AppPhase>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedProfile | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // Intel state
  const [intel, setIntel] = useState<OnboardingIntel | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping, isLoadingIntel]);

  useEffect(() => {
    if (!isAgentTyping && appPhase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAgentTyping, appPhase]);

  // Clear selected chips when moving to a new question
  useEffect(() => {
    setSelectedChips([]);
  }, [currentQ]);

  const addAgentMessage = useCallback((text: string, delay = 600) => {
    setIsAgentTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsAgentTyping(false);
      setMessages(prev => [...prev, { role: 'agent', content: text }]);
    }, delay);
  }, []);

  const loadIntel = useCallback(async (q0Answer: string, q1Answer: string) => {
    setIsLoadingIntel(true);
    try {
      const res = await fetch('/api/onboarding-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q0Answer, q1Answer }),
      });
      if (res.ok) {
        const data = await res.json();
        setIntel(data);
      }
    } catch {
      // Silent fail — chips are enhancement, not requirement
    } finally {
      setIsLoadingIntel(false);
    }
  }, []);

  const startChat = useCallback(() => {
    setAppPhase('chat');
    addAgentMessage(QUESTIONS[0], 800);
  }, [addAgentMessage]);

  const toggleChip = useCallback((chip: string) => {
    setSelectedChips(prev => {
      if (prev.includes(chip)) return prev.filter(c => c !== chip);
      if (prev.length >= 3) return prev;
      return [...prev, chip];
    });
  }, []);

  const buildChipAnswer = useCallback((chips: string[], customText: string): string => {
    const parts: string[] = [...chips];
    if (customText.trim()) parts.push(customText.trim());
    return parts.join(' | ');
  }, []);

  const handleSubmit = useCallback(async () => {
    const hasChips = selectedChips.length > 0;
    const trimmed = input.trim();
    if (!hasChips && !trimmed) return;
    if (isAgentTyping) return;

    const finalAnswer = hasChips ? buildChipAnswer(selectedChips, trimmed) : trimmed;

    const userMessage: Message = { role: 'user', content: finalAnswer };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const newAnswers = [...answers, finalAnswer];
    setAnswers(newAnswers);

    // Trigger intel load after Q1 is answered
    if (currentQ === 1 && newAnswers.length >= 2) {
      loadIntel(newAnswers[0], newAnswers[1]);
    }

    const nextQ = currentQ + 1;
    if (nextQ < TOTAL) {
      setCurrentQ(nextQ);
      setTimeout(() => {
        addAgentMessage(QUESTIONS[nextQ], 700);
      }, 300);
    } else {
      setAppPhase('analyzing');
      const conversation: Message[] = [];
      QUESTIONS.forEach((q, i) => {
        conversation.push({ role: 'agent', content: q });
        if (newAnswers[i]) conversation.push({ role: 'user', content: newAnswers[i] });
      });

      try {
        const res = await fetch('/api/brand-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Error al sintetizar');
        setGeneratedProfile(data.profile);
        setAppPhase('preview');
      } catch (err: unknown) {
        setSynthesisError(err instanceof Error ? err.message : 'Error desconocido');
        setAppPhase('preview');
      }
    }
  }, [input, isAgentTyping, answers, currentQ, addAgentMessage, selectedChips, buildChipAnswer, loadIntel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleSaveProfile = useCallback(async () => {
    if (!generatedProfile) return;
    setAppPhase('saving');
    try {
      const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedProfile),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error);
      await refreshBrands();
      setActiveBrand(saved);
      router.push('/');
    } catch {
      setAppPhase('preview');
    }
  }, [generatedProfile, refreshBrands, setActiveBrand, router]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const phaseIndex = getPhaseIndex(currentQ);
  const phase = PHASES[phaseIndex];
  const progress = Math.round(((currentQ) / TOTAL) * 100);

  const currentChipKey = CHIPS_QUESTIONS[currentQ];
  const currentSuggestions = currentChipKey && intel ? intel[currentChipKey] as string[] : [];
  const isPersonalityQ = currentQ === 10;
  const showChips = currentSuggestions.length > 0 && !isAgentTyping;
  const showPersonality = isPersonalityQ && !isAgentTyping;
  const canSubmit = (selectedChips.length > 0 || input.trim().length > 0) && !isAgentTyping;

  // ─── RENDER: Welcome ────────────────────────────────────────────────────────

  if (appPhase === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-primary/15 border border-brand-primary/30 rounded-2xl flex items-center justify-center">
              <IconSparkles size={28} className="text-brand-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest">Agente Investigador de Marca</p>
            <h1 className="text-3xl font-black text-text-primary leading-tight">
              Vamos a construir tu<br />
              <span className="text-brand-primary">perfil estratégico</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
              El agente te guía con preguntas inteligentes y sugerencias basadas en investigación real de tu mercado. No hace falta que sepas de copy ni de marketing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {PHASES.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className={`p-3 rounded-xl border ${p.border} ${p.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className={p.color} />
                    <span className={`text-xs font-bold ${p.color}`}>{p.label}</span>
                  </div>
                  <p className="text-text-muted text-[11px]">
                    {i === 0 && 'Nombre, industria y oferta'}
                    {i === 1 && 'Pains, deseos y objeciones'}
                    {i === 2 && 'Competencia y mecanismo único'}
                    {i === 3 && 'Personalidad y voz de marca'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-3 text-left">
            <p className="text-[11px] text-brand-primary/80 leading-relaxed">
              <span className="font-bold">¿No sabés bien quién es tu cliente?</span> No hay problema. El agente investiga tu mercado en tiempo real y te da opciones concretas para elegir.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={startChat}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              Comenzar entrevista
              <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/avatar?new=true')}
              className="w-full py-2.5 text-text-muted hover:text-text-secondary text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <IconSkipForward size={13} />
              Configurar manualmente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Chat ───────────────────────────────────────────────────────────

  if (appPhase === 'chat') {
    const PhaseIcon = phase.icon;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="border-b border-border-subtle px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-brand-primary/15 border border-brand-primary/30 rounded-lg flex items-center justify-center">
              <IconBot size={14} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary">Agente CopyLab</p>
              <p className="text-[10px] text-text-muted">Investigador estratégico de marca</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${phase.border} ${phase.bg} ${phase.color}`}>
              <PhaseIcon size={11} />
              {phase.label}
            </div>
            <div className="text-[11px] text-text-muted font-mono">
              {currentQ}/{TOTAL}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-surface flex-shrink-0">
          <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
          {messages.map((msg, i) =>
            msg.role === 'agent'
              ? <AgentBubble key={i} text={msg.content} isLast={i === messages.length - 1} />
              : <UserBubble key={i} text={msg.content} />
          )}
          {isAgentTyping && <TypingIndicator />}
          {isLoadingIntel && !isAgentTyping && <IntelLoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Smart Input Area */}
        <div className="border-t border-border-subtle p-4 flex-shrink-0 space-y-3">
          <div className="max-w-2xl mx-auto space-y-3">

            {/* Chip suggestions for pains/desires/objections */}
            {showChips && (
              <div className="bg-elevated/50 border border-border-subtle rounded-xl p-3">
                <ChipSelector
                  suggestions={currentSuggestions}
                  selected={selectedChips}
                  onToggle={toggleChip}
                  maxSelect={3}
                />
              </div>
            )}

            {/* Personality archetypes for Q10 */}
            {showPersonality && (
              <div className="bg-elevated/50 border border-border-subtle rounded-xl p-3">
                <PersonalitySelector onSelect={desc => setInput(desc)} />
              </div>
            )}

            {/* Text input row */}
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAgentTyping}
                placeholder={
                  isAgentTyping
                    ? 'El agente está escribiendo...'
                    : showChips
                    ? 'Chips seleccionados o escribe algo propio...'
                    : isPersonalityQ
                    ? 'Elegí un arquetipo arriba o describí con tus palabras...'
                    : 'Escribe tu respuesta...'
                }
                rows={1}
                className="flex-1 bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-brand-primary/50 transition-colors disabled:opacity-50"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-11 h-11 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              >
                <IconChevronRight size={18} className="text-white" />
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-text-muted max-w-2xl mx-auto">
            {showChips
              ? 'Seleccioná chips del mercado · podés agregar los tuyos en el campo · Enter para enviar'
              : 'Enter para enviar · Shift+Enter para nueva línea'}
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: Analyzing ──────────────────────────────────────────────────────

  if (appPhase === 'analyzing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center">
            <IconLoader size={28} className="text-brand-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-text-primary">Construyendo tu perfil estratégico</h2>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              El agente está analizando tus respuestas y sintetizando tu perfil de marca...
            </p>
          </div>
          <div className="flex justify-center gap-1.5">
            {['Analizando mercado', 'Definiendo avatar', 'Construyendo PUV'].map((label, i) => (
              <span
                key={i}
                className="text-[10px] px-2.5 py-1 bg-elevated border border-border-subtle rounded-full text-text-muted animate-pulse"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Preview ────────────────────────────────────────────────────────

  if (appPhase === 'preview' || appPhase === 'saving') {
    if (synthesisError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-accent-red text-sm">Error: {synthesisError}</p>
            <button onClick={() => router.push('/avatar')} className="text-brand-primary text-sm underline">
              Configurar manualmente
            </button>
          </div>
        </div>
      );
    }

    const p = generatedProfile;
    if (!p) return null;

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-emerald-400/15 border border-emerald-400/30 rounded-xl flex items-center justify-center">
                <IconCheckCircle size={22} className="text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-text-primary">Tu perfil estratégico está listo</h1>
            <p className="text-text-secondary text-sm">Revisa el análisis del agente y activa tu perfil.</p>
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <IconBuilding size={14} className="text-brand-primary" />
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Marca</span>
            </div>
            <div>
              <p className="text-xl font-black text-text-primary">{p.name}</p>
              {p.industry && <p className="text-text-muted text-sm mt-0.5">{p.industry}</p>}
            </div>
            {p.uvp && (
              <div className="bg-brand-primary/8 border border-brand-primary/20 rounded-xl p-3">
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-1">Propuesta de Valor Única</p>
                <p className="text-text-primary text-sm leading-relaxed">{p.uvp}</p>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <IconUsers size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cliente Ideal</span>
            </div>
            {p.avatar_name && (
              <p className="font-bold text-text-primary">
                {p.avatar_name}
                {p.avatar_age ? <span className="text-text-muted font-normal"> · {p.avatar_age} años</span> : null}
                {p.avatar_location ? <span className="text-text-muted font-normal"> · {p.avatar_location}</span> : null}
              </p>
            )}
            {p.avatar_pains?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Dolores</p>
                <ProfileChips items={p.avatar_pains} color="text-accent-red" />
              </div>
            )}
            {p.avatar_desires?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Deseos</p>
                <ProfileChips items={p.avatar_desires} color="text-emerald-400" />
              </div>
            )}
            {p.avatar_objections?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Objeciones</p>
                <ProfileChips items={p.avatar_objections} color="text-amber-400" />
              </div>
            )}
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <IconTarget size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Diferenciación</span>
            </div>
            {p.product_name && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Producto</p>
                <p className="text-text-primary text-sm font-semibold">
                  {p.product_name}
                  {p.product_price ? <span className="text-text-muted font-normal"> · {p.product_price}</span> : null}
                </p>
              </div>
            )}
            {p.product_transformation && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Transformación</p>
                <p className="text-text-secondary text-sm">{p.product_transformation}</p>
              </div>
            )}
            {p.product_mechanism && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Mecanismo Único</p>
                <p className="text-text-secondary text-sm">{p.product_mechanism}</p>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <IconMegaphone size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Voz de Marca</span>
            </div>
            {p.brand_adjectives?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Personalidad</p>
                <ProfileChips items={p.brand_adjectives} color="text-purple-400" />
              </div>
            )}
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">
                Formalidad: {p.formality_level}/10
              </p>
              <div className="w-full h-1.5 bg-elevated rounded-full">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(p.formality_level / 10) * 100}%` }} />
              </div>
            </div>
            {p.forbidden_words?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Palabras prohibidas</p>
                <ProfileChips items={p.forbidden_words} color="text-accent-red" />
              </div>
            )}
          </div>

          <div className="space-y-3 pb-8">
            <button
              onClick={handleSaveProfile}
              disabled={appPhase === 'saving'}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {appPhase === 'saving' ? (
                <><IconLoader size={16} className="animate-spin" /> Guardando perfil...</>
              ) : (
                <><IconBolt size={16} /> Activar este perfil</>
              )}
            </button>
            <button
              onClick={() => router.push('/avatar')}
              className="w-full py-2.5 text-text-muted hover:text-text-secondary text-sm transition-colors"
            >
              Editar manualmente antes de guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
