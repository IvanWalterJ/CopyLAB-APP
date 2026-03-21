'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  IconBot, IconArrowRight, IconSparkles, IconCheckCircle, IconLoader,
  IconBuilding, IconUsers, IconTarget, IconMegaphone, IconSkipForward,
  IconChevronRight, IconBolt
} from '@/components/icons';

// ─── Questions ───────────────────────────────────────────────────────────────

const PHASES = [
  { label: 'Negocio', icon: IconBuilding, color: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/30' },
  { label: 'Tu Cliente', icon: IconUsers, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { label: 'Diferenciación', icon: IconTarget, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { label: 'Voz de Marca', icon: IconMegaphone, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
];

const QUESTIONS = [
  // Fase 0: Negocio (0-2)
  "¿Cuál es el nombre de tu marca o negocio, y en qué industria o nicho opera?",
  "¿Qué hace exactamente tu producto o servicio? En tus propias palabras: ¿qué problema resuelve y para quién?",
  "¿Cuánto cuesta tu oferta principal y cuál es la transformación que prometes? Cuéntame el 'antes' y el 'después' de tus clientes.",
  // Fase 1: Avatar (3-6)
  "Descríbeme a tu cliente ideal: ¿qué edad tiene aproximadamente, cuál es su situación de vida y qué está experimentando en este momento?",
  "¿Cuáles son los 3 dolores o frustraciones más profundas de ese cliente? Intenta usar las mismas palabras que él usaría para describirlos.",
  "¿Qué es lo que más desea lograr? ¿Cuál es el resultado o transformación que sueña con conseguir?",
  "¿Qué le impide comprar? ¿Cuáles son sus principales objeciones, miedos o excusas para no dar el paso?",
  // Fase 2: Diferenciación (7-9)
  "¿Quiénes son tus principales competidores o alternativas en el mercado? ¿Por qué te eligen a ti sobre ellos?",
  "¿Cuál es tu ventaja o mecanismo único? ¿Qué tiene tu método o producto que ningún otro tiene igual?",
  "¿Tienes garantía o casos de éxito concretos que puedas compartir? Cuéntame resultados reales, números, testimonios.",
  // Fase 3: Voz de Marca (10-11)
  "¿Cómo describirías la personalidad de tu marca? ¿Seria o divertida? ¿Técnica o cercana? ¿Formal o informal?",
  "¿Hay palabras, frases o estilos de comunicación que JAMÁS usarías en tu marca? ¿Algo que simplemente no te represente?",
];

const PHASE_RANGES = [[0, 2], [3, 6], [7, 9], [10, 11]];
const TOTAL = QUESTIONS.length;

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // No redirect — users with existing brands can also create new ones via onboarding

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping]);

  // Focus input when agent done typing
  useEffect(() => {
    if (!isAgentTyping && appPhase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isAgentTyping, appPhase]);

  const addAgentMessage = useCallback((text: string, delay = 600) => {
    setIsAgentTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsAgentTyping(false);
      setMessages(prev => [...prev, { role: 'agent', content: text }]);
    }, delay);
  }, []);

  const startChat = useCallback(() => {
    setAppPhase('chat');
    addAgentMessage(QUESTIONS[0], 800);
  }, [addAgentMessage]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isAgentTyping) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const newAnswers = [...answers, trimmed];
    setAnswers(newAnswers);

    const nextQ = currentQ + 1;

    if (nextQ < TOTAL) {
      setCurrentQ(nextQ);
      // Small pause before agent responds
      setTimeout(() => {
        addAgentMessage(QUESTIONS[nextQ], 700);
      }, 300);
    } else {
      // All questions answered — synthesize
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
  }, [input, isAgentTyping, answers, currentQ, addAgentMessage]);

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

  // Cleanup
  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  const phaseIndex = getPhaseIndex(currentQ);
  const phase = PHASES[phaseIndex];
  const progress = Math.round(((currentQ) / TOTAL) * 100);

  // ─── RENDER: Welcome ──────────────────────────────────────────────────────

  if (appPhase === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-brand-primary/15 border border-brand-primary/30 rounded-2xl flex items-center justify-center">
              <IconSparkles size={28} className="text-brand-primary" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-primary uppercase tracking-widest">Agente de Descubrimiento de Marca</p>
            <h1 className="text-3xl font-black text-text-primary leading-tight">
              Vamos a construir tu<br />
              <span className="text-brand-primary">perfil estratégico</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
              Nuestro agente te hará 12 preguntas clave sobre tu negocio, cliente y diferenciadores. Al final, genera automáticamente tu perfil de marca completo.
            </p>
          </div>

          {/* Steps preview */}
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

          {/* CTA */}
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

  // ─── RENDER: Chat ─────────────────────────────────────────────────────────

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
              <p className="text-[10px] text-text-muted">Descubrimiento estratégico de marca</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${phase.border} ${phase.bg} ${phase.color}`}>
              <PhaseIcon size={11} />
              {phase.label}
            </div>
            {/* Progress */}
            <div className="text-[11px] text-text-muted font-mono">
              {currentQ}/{TOTAL}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-surface flex-shrink-0">
          <div
            className="h-full bg-brand-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
          {messages.map((msg, i) =>
            msg.role === 'agent'
              ? <AgentBubble key={i} text={msg.content} isLast={i === messages.length - 1} />
              : <UserBubble key={i} text={msg.content} />
          )}
          {isAgentTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAgentTyping}
              placeholder={isAgentTyping ? 'El agente está escribiendo...' : 'Escribe tu respuesta...'}
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
              disabled={!input.trim() || isAgentTyping}
              className="w-11 h-11 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            >
              <IconChevronRight size={18} className="text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-muted mt-2">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: Analyzing ────────────────────────────────────────────────────

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

  // ─── RENDER: Preview ──────────────────────────────────────────────────────

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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-emerald-400/15 border border-emerald-400/30 rounded-xl flex items-center justify-center">
                <IconCheckCircle size={22} className="text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-text-primary">Tu perfil estratégico está listo</h1>
            <p className="text-text-secondary text-sm">Revisa el análisis del agente y activa tu perfil.</p>
          </div>

          {/* Card: Marca */}
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

          {/* Card: Avatar */}
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

          {/* Card: Diferenciación */}
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
            {p.competitors && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-1">Competidores</p>
                <p className="text-text-muted text-sm">{p.competitors}</p>
              </div>
            )}
          </div>

          {/* Card: Voz de Marca */}
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
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${(p.formality_level / 10) * 100}%` }}
                />
              </div>
            </div>
            {p.forbidden_words?.length > 0 && (
              <div>
                <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-2">Palabras prohibidas</p>
                <ProfileChips items={p.forbidden_words} color="text-accent-red" />
              </div>
            )}
          </div>

          {/* Actions */}
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
