'use client';

import { useState, useEffect } from 'react';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { IconPlayCircle, IconInstagram, IconTwitter, IconLinkedin, IconWand, IconType, IconAlert, IconBolt, IconRefresh } from '@/components/icons';
import { useApp } from '@/lib/context';
import ReactMarkdown from 'react-markdown';

const platforms = [
  { id: 'instagram', icon: IconInstagram, name: 'Instagram', description: 'Reels / Carruseles' },
  { id: 'tiktok', icon: IconPlayCircle, name: 'TikTok', description: 'Video Corto' },
  { id: 'twitter', icon: IconTwitter, name: 'Twitter / X', description: 'Hilos Cortos' },
  { id: 'linkedin', icon: IconLinkedin, name: 'LinkedIn', description: 'Posts Profesionales' },
];

export default function HooksPage() {
  const { activeBrand, refreshCredits } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(2);
  const [platform, setPlatform] = useState('instagram');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setOutput('');
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: `Genera 5 hooks de alto impacto para ${platform} sobre el tema: "${topic}".

REGLA FUNDAMENTAL: Cada hook debe usar un TIPO DIFERENTE. No repitas el mismo mecanismo psicológico. La variedad es la clave para encontrar el ganador.

**HOOK 1 — AFIRMACIÓN CONTRAINTUITIVA**
Una declaración que contradice lo que el avatar cree que es verdad. No una pregunta. Una afirmación directa que genera fricción cognitiva inmediata.
*Por qué funciona (Schwartz):* [Explica el mecanismo psicológico en 1-2 líneas]

**HOOK 2 — DATO ESPECÍFICO QUE INCOMODA**
Un número, porcentaje, o estadística que hace que la situación actual del avatar se sienta urgente o injusta. Específico, no vago.
*Por qué funciona:* [Mecanismo]

**HOOK 3 — HISTORIA EN UNA LÍNEA**
Un micro-relato que coloca al avatar en el medio de una situación familiar y dolorosa antes de que pueda pensar en scrollear. Técnica Halbert: empieza en la acción.
*Por qué funciona:* [Mecanismo]

**HOOK 4 — LA PREGUNTA QUE NO PUEDEN IGNORAR**
No cualquier pregunta. Una que toca una inseguridad o deseo que el avatar tiene pero no ha verbalizado. Si se la hacen a sí mismos, se quedan a escuchar la respuesta.
*Por qué funciona:* [Mecanismo]

**HOOK 5 — EL PATRÓN ROTO**
Algo que no tiene sentido hasta que sí lo tiene. Puede ser una comparación inesperada, una paradoja aparente, o un formato visual/textual que interrumpe el patrón normal del feed.
*Por qué funciona:* [Mecanismo]

PARA CADA HOOK: Adapta el formato nativo de ${platform} (longitud, tono, si va en texto, subtítulo de video, caption, o thread). Sé específico con la plataforma — un hook de LinkedIn no funciona en TikTok y viceversa.`,
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'hooks'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al conectar con la IA.");
      }

      if (!response.body) throw new Error("No response string.");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value, { stream: true }));
      }
      
      await refreshCredits();
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error generando contenido.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, isGenerating]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar: Configurador / Brief */}
      <div className="w-[400px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand-subtle flex items-center justify-center">
              <IconBolt size={18} className="text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary font-inter leading-tight">Hooks Engine</h1>
          </div>
          <p className="text-text-secondary text-sm">Frena el scroll de tu audiencia en los primeros 3 segundos.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Plataforma</label>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(p => {
              const Icon = p.icon;
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-brand-primary' : 'text-text-secondary'} />
                  <div>
                    <h5 className={`text-xs font-bold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{p.name}</h5>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-tight">{p.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary flex justify-between">
            <span>¿De qué trata este contenido?</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 text-text-muted">
              <IconType size={18} />
            </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Por qué tu copy actual espanta a los clientes..."
              rows={4}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-10 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-all resize-none shadow-inner"
            />
          </div>
        </div>

        {!activeBrand && (
          <div className="flex items-center gap-2 p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-xl text-xs text-accent-amber">
            <IconAlert size={14} className="flex-shrink-0" />
            <span>Sin marca activa — el copy se generará sin contexto de marca.</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:bg-surface disabled:text-text-muted disabled:border-border-subtle text-white rounded-xl font-bold transition-all shadow-glow-indigo flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
        >
          <IconWand size={20} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? 'Redactando...' : 'Generar Hooks Irresistibles'}
        </button>
      </div>

      {/* Renderizado de AI */}
      <div className="flex-1 glass border border-border-glass rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-elevated">
        {/* Decorativo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-5 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
               <IconWand size={18} className="text-brand-primary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Resultados del Engine</h2>
          </div>
          {output && !isGenerating && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-surface px-4 py-2 rounded-lg hover:bg-elevated transition-all border border-border-subtle active:scale-95 flex items-center gap-1.5"
              >
                <IconRefresh size={12} />
                Regenerar
              </button>
              <button
                onClick={copyToClipboard}
                className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-lg hover:bg-brand-primary/20 transition-all border border-brand-primary/20 active:scale-95"
              >
                {copied ? '¡Copiado!' : 'Copiar Todo'}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-4 custom-scroll relative z-10 font-inter text-sm leading-relaxed text-text-primary">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-accent-red/10 border border-accent-red/20 rounded-2xl text-accent-red mb-6 animate-in fade-in slide-in-from-top-2">
              <IconAlert size={20} className="flex-shrink-0" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}
          
          {output ? (
            <div className="markdown-content prose prose-invert max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : !error && !isGenerating && (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-5">
               <div className="w-20 h-20 rounded-3xl bg-elevated border border-border-subtle flex items-center justify-center shadow-2xl rotate-3 animate-glow-pulse">
                 <IconWand size={32} className="text-text-secondary opacity-30" />
               </div>
               <div className="space-y-2">
                 <p className="text-text-primary font-bold text-base">Ingeniería de Atención</p>
                 <p className="text-xs leading-relaxed">Rellena el brief a la izquierda y CopyLab generará hooks basados en la psicología de los niveles de consciencia.</p>
               </div>
             </div>
          )}

          {isGenerating && (
            <div className="space-y-6">
              <div className="markdown-content opacity-50">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
              <div className="flex items-center gap-2 justify-center py-8">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest ml-2">Pensando como Eugene Schwartz...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
