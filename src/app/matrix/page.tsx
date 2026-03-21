'use client';

import { useState, useEffect } from 'react';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { IconWand, IconType, IconAlert, IconCarousel, IconReel, IconImage, IconTextPost, IconStory, IconRefresh, IconGrid } from '@/components/icons';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/lib/context';

const ANGLES = [
  { id: 'identidad', name: 'Identidad Tribal', description: 'Por qué "los nuestros" hacen esto y los demás no.' },
  { id: 'miedo', name: 'Miedo al Statu Quo', description: 'El peligro de quedarse igual que ahora.' },
  { id: 'future', name: 'Future Pacing', description: 'Visualizar la vida después de conseguir la transformación.' },
  { id: 'identidad_negativa', name: 'Enemigo Común', description: 'Contra quién estamos luchando y por qué es su culpa.' },
  { id: 'urgencia', name: 'Urgencia y Escasez', description: 'La razón por la que actuar HOY vale más que esperar mañana.' },
  { id: 'prueba_social', name: 'Prueba Social', description: 'Lo que dicen los que ya cruzaron al otro lado y lograron el resultado.' },
  { id: 'comparacion', name: 'Comparación Directa', description: 'Por qué somos la mejor opción frente a las alternativas del mercado.' },
];

const FORMATS = [
  { id: 'carrusel', name: 'Carrusel', description: 'Slides para Instagram/LinkedIn', icon: IconCarousel },
  { id: 'reel', name: 'Reel / Video Corto', description: 'TikTok, Reels, Shorts', icon: IconReel },
  { id: 'creativo_imagen', name: 'Creativo 1 Imagen', description: 'Copy + brief visual', icon: IconImage },
  { id: 'post_texto', name: 'Post de Texto', description: 'Caption o hilo largo', icon: IconTextPost },
  { id: 'story', name: 'Story', description: 'Secuencia de stories', icon: IconStory },
];

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  carrusel: `FORMATO: CARRUSEL (5-8 slides)
Escribe cada ángulo como un carrusel de 5-8 slides.
- Slide 1: Hook visual — la frase más potente que detiene el scroll. Máximo 12 palabras.
- Slides 2-6: Desarrollo del argumento, una idea por slide. Texto corto (2-3 líneas max por slide).
- Penúltimo slide: Remate emocional o dato demoledor.
- Último slide: CTA claro con instrucción específica.
Numera cada slide: [Slide 1], [Slide 2], etc.
Incluye al final un "Brief visual" con dirección de diseño para cada slide (colores, tipografía, imágenes sugeridas).`,

  reel: `FORMATO: REEL / VIDEO CORTO (30-60 segundos)
Escribe cada ángulo como un guión de video corto.
- Hook de apertura (0-3 seg): Frase o acción que detiene el scroll instantáneamente.
- Desarrollo (3-40 seg): El argumento central, en lenguaje hablado natural. Frases cortas.
- CTA hablado (últimos 5-10 seg): Qué hacer ahora.
Incluye al final:
- [TEXTO EN PANTALLA]: Frases clave para overlay
- [BRIEF DE EDICIÓN]: Timing, transiciones, música sugerida, tipo de plano
- [DURACIÓN ESTIMADA]: Total en segundos`,

  creativo_imagen: `FORMATO: CREATIVO DE 1 IMAGEN
Escribe cada ángulo como un creativo de imagen única con:
- **Headline**: Máximo 8 palabras. La frase que domina el creativo.
- **Subhead**: 1 línea de soporte (15-20 palabras max).
- **Body text** (opcional): 2-3 líneas cortas si el formato lo permite.
- **CTA**: Texto del botón o acción (3-5 palabras).
- **Brief visual**: Descripción detallada para el diseñador — composición, paleta de color, tipografía, estilo fotográfico, elementos gráficos sugeridos.`,

  post_texto: `FORMATO: POST DE TEXTO (200-300 palabras)
Escribe cada ángulo como un post largo para redes sociales.
- Primera línea: Hook irresistible que genera curiosidad o disonancia.
- Desarrollo narrativo: Párrafos cortos (1-3 líneas), lenguaje conversacional.
- Usa saltos de línea generosos para facilitar lectura en mobile.
- Incluye al menos una "frase tweeteable" (en negrita) que invite a compartir.
- CTA final: Pregunta, instrucción, o invitación a la acción.
- Sugiere 3-5 hashtags relevantes al final.`,

  story: `FORMATO: SECUENCIA DE STORIES (4-6 stories)
Escribe cada ángulo como una secuencia de 4-6 stories.
- Story 1: Hook — la pantalla que decide si siguen mirando o deslizan.
- Stories 2-4: Desarrollo — una idea por story, texto corto (3-5 líneas max), visualmente limpio.
- Story 5 (o penúltima): Punto de tensión o revelación.
- Última Story: CTA con sticker de acción (link, encuesta, deslizar, DM).
Numera cada story: [Story 1], [Story 2], etc.
Para cada story indica:
- Texto exacto a mostrar
- [FONDO]: Color, foto, video sugerido
- [STICKER/ELEMENTO]: Encuesta, slider, contador, link, etc.`,
};

const ANGLE_INSTRUCTIONS: Record<string, string> = {
  identidad: `**ÁNGULO: IDENTIDAD TRIBAL**
Técnica: El copy no vende un producto, vende pertenencia a un grupo que ya tiene la identidad deseada.
Estructura:
- Abre definiendo al "nosotros" con precisión tribal ("Los que hacemos X no somos los que...")
- Dibuja la línea entre los que están dentro y los que están fuera — sin atacar a nadie, simplemente separando.
- Conecta la oferta como el ritual o herramienta que los miembros del grupo usan / usarían.
- Cierra con una afirmación de identidad que el lector quiera hacer propia.
Tono: Seguro, íntimo, como hablando con los que "sí entienden".`,

  miedo: `**ÁNGULO: MIEDO AL STATU QUO**
Técnica: Dan Kennedy "future consequences" — mostrar el camino al que se dirige la persona si no actúa hoy.
Estructura:
- Abre con la situación actual del avatar descrita con exactitud (que reconozca su vida).
- Proyecta esa situación hacia adelante: ¿cómo es su vida en 12 meses si nada cambia? Específico, no genérico.
- El momento de quiebre: "La única diferencia entre los que cambian y los que no es..."
- La oferta como la bifurcación en el camino, no como una solución mágica.
Tono: Serio, empático, sin miedo de incomodar.`,

  future: `**ÁNGULO: FUTURE PACING**
Técnica: Russell Brunson / Frank Kern — llevar al lector cinematográficamente a la versión de su vida después de conseguir el resultado.
Estructura:
- Abre en futuro: "Imagina que son las [hora] del [día] y tú..."  — escena específica y sensorial del resultado deseado.
- Detalla el "después" con detalles concretos que activan los sentidos (lo que ven, sienten, escuchan en esa vida).
- Ancla ese futuro a la acción de hoy: "Esa versión de ti tomó una decisión en [mes/año]. Fue cuando decidió..."
- Cierra con el puente: la oferta como el primer paso hacia esa escena.
Tono: Cálido, aspiracional, cinematográfico. Sin urgencia artificial.`,

  identidad_negativa: `**ÁNGULO: ENEMIGO COMÚN**
Técnica: "Us vs. Them" de Gary Halbert — identificar el villano externo que explica por qué el avatar no ha logrado el resultado todavía.
Estructura:
- Nombra al enemigo con claridad (sistema, industria, creencia falsa, persona tipo) — no es culpa del avatar.
- Explica cómo ese enemigo ha estado frenando al avatar sin que lo sepa.
- El momento de revelación: "Una vez que ves esto, no puedes no verlo..."
- La oferta como el arma contra ese enemigo, no como un producto.
Tono: Combativo pero constructivo. Genera indignación productiva, no desesperanza.`,

  urgencia: `**ÁNGULO: URGENCIA Y ESCASEZ**
Técnica: Cialdini + Kennedy — la urgencia funciona SOLO si la razón es legítima y específica.
Estructura:
- Abre con el costo de esperar: lo que pierde por cada semana/mes que no actúa (en términos concretos y medibles).
- La razón real y específica por la que actuar ahora importa (plazas limitadas, precio que sube, ventana de oportunidad de mercado).
- Reencuadre: No es presión de venta, es información que el lector merece tener.
- Cierra con la acción clara y la consecuencia directa de hacerla o no hacerla hoy.
Tono: Directo, honesto, sin manipulación. La urgencia se explica, no se impone.`,

  prueba_social: `**ÁNGULO: PRUEBA SOCIAL**
Técnica: Cialdini "Social Proof" + Halbert "specificity sells" — los resultados vagos no convencen, los resultados específicos sí.
Estructura:
- Abre con un resultado concreto y medible de alguien que se parece al avatar (mismo punto de partida, misma objeción inicial).
- Desarrolla brevemente el "antes" de ese cliente/caso — que el lector se identifique con el punto de partida.
- El "después" con números específicos, tiempo exacto, y detalles reales.
- Generalización: "Y [nombre] no es el único / la única. En los últimos X meses, [dato agregado]..."
- Cierra con la implicación: si ellos pudieron desde ese punto, ¿qué impide que el lector lo haga?
Tono: Objetivo, con evidencia. Deja que los resultados hablen.`,

  comparacion: `**ÁNGULO: COMPARACIÓN DIRECTA**
Técnica: David Deutsch "competitive reframing" — no atacas a la competencia, demuestras que juegas en una categoría diferente.
Estructura:
- Abre reconociendo las alternativas que el avatar ha considerado o probado (muestra que las conoces).
- Analiza por qué cada alternativa falla para este avatar específico (no "son malas", sino "no están diseñadas para tu situación").
- Introduce tu mecanismo único como la solución diseñada específicamente para lo que las otras no resuelven.
- Stack de diferenciadores concretos: no "mejor atención" sino "[X] específico que ninguna otra opción tiene".
- Cierra con la pregunta implícita: ¿Seguir con lo que no funciona o probar lo que sí?
Tono: Confiado sin ser arrogante. Objetivo. Que el lector llegue solo a la conclusión.`,
};

function buildMatrixPrompt(selectedAngles: string[], topic: string, format: string): string {
  const formatInstructions = FORMAT_INSTRUCTIONS[format] || '';

  const angleBlocks = selectedAngles.map(id => {
    const angle = ANGLES.find(a => a.id === id);
    const instructions = ANGLE_INSTRUCTIONS[id] || '';
    return `---
## ${angle?.name?.toUpperCase()}
${instructions}

Ahora escribe el copy para este ángulo sobre: "${topic}".
Respeta estrictamente el formato de output indicado arriba.`;
  }).join('\n\n');

  return `Genera la Matriz Multi-Ángulo para la oferta/tema: "${topic}".

FORMATO DE OUTPUT OBLIGATORIO:
${formatInstructions}

IMPORTANTE: Todo el contenido generado DEBE respetar el formato indicado. No generes texto corrido genérico — adapta cada ángulo al formato especificado.

Por cada ángulo seleccionado, recibirás las instrucciones específicas de técnica y estructura. Sigue cada una al pie de la letra. La calidad de cada ángulo depende de qué tan bien apliques la técnica indicada — no generes variaciones genéricas del mismo mensaje, cada ángulo debe sentirse radicalmente diferente en tono, estructura y mecanismo psicológico.

${angleBlocks}`;
}

export default function MatrixPage() {
  const { activeBrand, refreshCredits } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(3);
  const [topic, setTopic] = useState('');
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['identidad', 'miedo']);
  const [selectedFormat, setSelectedFormat] = useState('carrusel');

  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAngle = (id: string) => {
    if (selectedAngles.includes(id)) {
      if (selectedAngles.length > 1) {
        setSelectedAngles(prev => prev.filter(a => a !== id));
      }
    } else {
      setSelectedAngles(prev => [...prev, id]);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setOutput('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: buildMatrixPrompt(selectedAngles, topic, selectedFormat),
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'matrix',
        }),
      });

      if (!response.body) throw new Error("No response string.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value, { stream: true }));
      }
      await refreshCredits();
    } catch (e) {
      console.error(e);
      setOutput("Error generando contenido.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd+Enter to generate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && topic.trim() && !isGenerating) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Left: Config Panel */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scroll pb-12 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand-subtle flex items-center justify-center">
              <IconGrid size={18} className="text-brand-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary font-inter">Matriz Multi-Ángulo</h1>
          </div>
          <p className="text-text-secondary text-sm">Explora múltiples enfoques psicológicos de venta para un mismo producto.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        {/* Angles Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Ángulos a Generar</label>
          <div className="grid grid-cols-2 gap-3">
            {ANGLES.map(a => {
              const isSelected = selectedAngles.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAngle(a.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/10 shadow-glow-indigo/20'
                      : 'border-border-subtle bg-surface hover:bg-elevated hover:border-border-glass'
                  }`}
                >
                  <h5 className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{a.name}</h5>
                  <p className="text-[10px] text-text-muted mt-0.5">{a.description}</p>
                </button>
              );
            })}
          </div>
        </div>

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
          <label className="text-sm font-semibold text-text-primary flex justify-between">
            <span>¿Qué estás vendiendo o promocionando?</span>
            <span className="text-text-muted text-xs font-normal">Sujeto / Ángulo Core</span>
          </label>
          <div className="relative">
             <div className="absolute top-3 left-3 text-text-muted">
               <IconType size={18} />
             </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Un curso de copywriting por IA avanzado para dueños de agencia que no tienen tiempo de entrenar juniors."
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
          className="w-full py-4 bg-gradient-brand hover:opacity-90 disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle disabled:bg-none text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
        >
          <IconWand size={20} className={isGenerating ? "animate-pulse" : ""} />
          {isGenerating ? 'Escribiendo Matriz...' : 'Generar Matriz Estratégica'}
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
            Resultados del Matrix Engine
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
          {output ? (
            <div className="markdown-content animate-fade-in">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-elevated border border-border-glass flex items-center justify-center shadow-lg animate-float">
                 <IconWand size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Descubre qué mensaje conecta profundo configurando tu base y seleccionando múltiples ángulos de respuesta directa.</p>
             </div>
          )}
          {isGenerating && (
            <span className="inline-block w-2 h-4 ml-1 bg-brand-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
