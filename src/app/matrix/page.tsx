'use client';

import { useState, useEffect, useCallback } from 'react';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { IconWand, IconType, IconAlert, IconCarousel, IconReel, IconImage, IconTextPost, IconStory, IconRefresh, IconGrid } from '@/components/icons';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/lib/context';

// ─── Formats ────────────────────────────────────────────────────────────────

const FORMATS = [
  { id: 'carrusel', name: 'Carrusel', description: 'Slides para Instagram/LinkedIn', icon: IconCarousel },
  { id: 'reel', name: 'Reel / Video Corto', description: 'TikTok, Reels, Shorts', icon: IconReel },
  { id: 'creativo_imagen', name: 'Creativo 1 Imagen', description: 'Copy + brief visual', icon: IconImage },
  { id: 'post_texto', name: 'Post de Texto', description: 'Caption o hilo largo', icon: IconTextPost },
  { id: 'story', name: 'Story', description: 'Secuencia de stories', icon: IconStory },
];

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  carrusel: `FORMATO: CARRUSEL (5-8 slides)
Para cada ángulo, escribe un carrusel completo de 5-8 slides.
- Slide 1: Hook visual — la frase más potente que detiene el scroll. Máximo 12 palabras.
- Slides 2-6: Desarrollo del argumento, una idea por slide. Texto corto (2-3 líneas max).
- Penúltimo slide: Remate emocional o dato demoledor.
- Último slide: CTA claro con instrucción específica.
Numera cada slide: [Slide 1], [Slide 2], etc.
Incluye al final un "Brief visual" con dirección de diseño (colores, tipografía, imágenes sugeridas).`,

  reel: `FORMATO: REEL / VIDEO CORTO (30-60 segundos)
Para cada ángulo, escribe un guión de video corto.
- Hook de apertura (0-3 seg): Frase que detiene el scroll instantáneamente.
- Desarrollo (3-40 seg): Argumento central, lenguaje hablado natural, frases cortas.
- CTA hablado (últimos 5-10 seg): Qué hacer ahora.
Incluye: [TEXTO EN PANTALLA] · [BRIEF DE EDICIÓN] · [DURACIÓN ESTIMADA]`,

  creativo_imagen: `FORMATO: CREATIVO DE 1 IMAGEN
Para cada ángulo:
- **Headline**: Máximo 8 palabras. La frase que domina el creativo.
- **Subhead**: 1 línea de soporte (15-20 palabras max).
- **Body text** (opcional): 2-3 líneas si el formato lo permite.
- **CTA**: Texto del botón (3-5 palabras).
- **Brief visual**: Descripción para el diseñador — composición, paleta, tipografía, estilo fotográfico.`,

  post_texto: `FORMATO: POST DE TEXTO (200-300 palabras)
Para cada ángulo, escribe un post largo para redes sociales.
- Primera línea: Hook irresistible — curiosidad o disonancia.
- Desarrollo: Párrafos cortos (1-3 líneas), lenguaje conversacional, saltos generosos.
- Una "frase tweeteable" en negrita que invite a compartir.
- CTA final: pregunta, instrucción o invitación a la acción.
- 3-5 hashtags al final.`,

  story: `FORMATO: SECUENCIA DE STORIES (4-6 stories)
Para cada ángulo, escribe una secuencia de 4-6 stories.
- Story 1: Hook — la pantalla que decide si siguen mirando o deslizan.
- Stories 2-4: Desarrollo — una idea por story, texto corto (3-5 líneas max).
- Penúltima story: Punto de tensión o revelación.
- Última story: CTA con sticker de acción (link, encuesta, deslizar, DM).
Para cada story indica: texto exacto · [FONDO] · [STICKER/ELEMENTO]`,
};

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildAnglesPrompt(topic: string, format: string): string {
  const formatInstructions = FORMAT_INSTRUCTIONS[format] || FORMAT_INSTRUCTIONS['post_texto'];

  return `Genera 5 ángulos de persuasión radicalmente diferentes para: "${topic}".

REGLA DE ORO: Entrega SOLO el copy. Cero explicaciones de por qué funciona cada ángulo, cero notas técnicas, cero etiquetas meta, cero frases como "este ángulo usa la técnica X". El output es copy puro en el formato especificado.

LIBERTAD TOTAL DE ÁNGULOS: Elegís vos qué 5 mecanismos psicológicos usar. Tenés acceso a todo el arsenal — identidad tribal, miedo al statu quo, future pacing, enemigo común, urgencia real, prueba social, comparación directa, contraintuitivo, confesión inesperada, autoridad sin pedir permiso, provocación al ego, reencuadre radical, promesa específica, paradoja, escasez, transformación, y cualquier otro que funcione mejor para ESTE tema específico.

MANDATO DE VARIEDAD: Cada ángulo debe sentirse radicalmente diferente al anterior — diferente tono, diferente mecanismo emocional, diferente punto de entrada. Alguien que lea los 5 no debe sentir que leyó lo mismo con palabras distintas. Variá también: longitud, estructura, recurso narrativo, temperatura emocional.

ANTI-REPETICIÓN: Esta generación debe explorar combinaciones de ángulos que quizás nunca se usaron juntas para este tema. Sorprendete a vos mismo.

FORMATO DE OUTPUT OBLIGATORIO — seguilo al pie de la letra para cada uno de los 5 ángulos:
${formatInstructions}

Genera los 5 ángulos ahora. Nada más que el copy.`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AnglesPage() {
  const { activeBrand, refreshCredits } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(3);
  const [topic, setTopic] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('carrusel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setOutput('');
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: buildAnglesPrompt(topic, selectedFormat),
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'matrix',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error al conectar con la IA.');
      }

      if (!response.body) throw new Error('No response body.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value, { stream: true }));
      }
      await refreshCredits();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando contenido.');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedFormat, level, activeBrand, refreshCredits]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && topic.trim() && !isGenerating) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGenerate, isGenerating, topic]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Left: Config Panel */}
      <div className="w-[380px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scroll pb-12 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand-subtle flex items-center justify-center">
              <IconGrid size={18} className="text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary font-inter">Ángulos de Persuasión</h1>
          </div>
          <p className="text-text-secondary text-sm">5 ángulos radicalmente distintos para el mismo mensaje. La IA elige los mecanismos.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        {/* Format Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Formato de Output</label>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map(f => {
              const isSelected = selectedFormat === f.id;
              const FormatIcon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-semibold shadow-glow-indigo/20'
                      : 'border-border-subtle bg-surface text-text-secondary hover:bg-elevated hover:text-text-primary hover:border-border-glass'
                  }`}
                >
                  <FormatIcon size={15} />
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-text-muted">
            {FORMATS.find(f => f.id === selectedFormat)?.description}
          </p>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary">
            ¿Qué estás vendiendo o promocionando?
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 text-text-muted">
              <IconType size={18} />
            </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Un curso de copywriting por IA para dueños de agencia que no tienen tiempo de entrenar juniors."
              rows={4}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-10 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
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
          className="w-full py-4 bg-gradient-brand hover:opacity-90 disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle disabled:bg-none text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
        >
          <IconWand size={20} className={isGenerating ? 'animate-pulse' : ''} />
          {isGenerating ? 'Generando ángulos...' : 'Generar 5 Ángulos'}
        </button>
        <p className="text-[10px] text-text-muted text-center -mt-3">Ctrl+Enter para generar</p>
      </div>

      {/* Right: AI Output */}
      <div className="flex-1 glass border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-elevated">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12" />

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <IconWand size={18} className="text-brand-primary" />
            Ángulos Generados
          </h2>
          {output && !isGenerating && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="text-[10px] font-black uppercase tracking-widest text-text-secondary bg-elevated px-3 py-2 rounded-lg hover:bg-overlay hover:text-text-primary transition-all border border-border-subtle active:scale-95 flex items-center gap-1.5"
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll relative z-10 text-sm leading-relaxed text-text-primary">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-accent-red/10 border border-accent-red/20 rounded-2xl text-accent-red mb-6">
              <IconAlert size={18} className="flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {output ? (
            <div className="markdown-content animate-fade-in">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : !error && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-elevated border border-border-glass flex items-center justify-center shadow-lg animate-float">
                <IconWand size={28} className="text-text-secondary opacity-50" />
              </div>
              <div className="space-y-1.5">
                <p className="text-text-primary font-bold text-base">5 ángulos, 1 mensaje</p>
                <p className="text-xs leading-relaxed">Describí lo que vendés, elegí el formato y la IA genera 5 enfoques psicológicos completamente distintos — ella elige los mecanismos más potentes para tu oferta.</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <div className="markdown-content opacity-50">
                <ReactMarkdown>{output}</ReactMarkdown>
              </div>
              <div className="flex items-center gap-2 justify-center py-8">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest ml-2">Explorando ángulos...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
