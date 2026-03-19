'use client';

import { useState } from 'react';
import { Wand2, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { useApp } from '@/lib/context';

const VSL_MODES = [
  { id: 'micro', name: 'Micro VSL (2-3 min)', desc: 'Directo al punto. Tráfico tibio.' },
  { id: 'standard', name: 'Estándar (8-10 min)', desc: 'Venta de infoproductos / SaaS.' },
  { id: 'webinar', name: 'Webinar Pitch (20+ min)', desc: 'Venta high-ticket.' }
];

export default function CinemaVSLPage() {
  const { activeBrand } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(4);
  const [mode, setMode] = useState('standard');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const buildVSLPrompt = (mode: string, topic: string): string => {
    if (mode === 'micro') {
      return `Escribe un guión de MICRO VSL (2-3 minutos) para: "${topic}".

Estructura Gary Halbert / Dan Kennedy comprimida:
1. HOOK DE APERTURA (10 seg): Una declaración que choca. No una pregunta. Una afirmación que rompe el patrón.
2. PROBLEMA VISCERAL (30 seg): El dolor en sus propias palabras. Específico, no genérico.
3. AGITACIÓN (20 seg): La consecuencia de no resolver esto hoy.
4. PROMESA + MECANISMO (30 seg): Qué hace diferente esto y por qué funciona cuando otras cosas fallaron.
5. PRUEBA SOCIAL FLASH (20 seg): Un resultado específico con nombre o perfil real.
6. CTA DIRECTO (15 seg): Una sola acción. Sin opciones. Sin ambigüedad.

FORMATO DE GUIÓN:
- Dos columnas: **AUDIO** | **VIDEO**
- Notas de dirección musical entre corchetes: [música tensa, ritmo lento]
- Indicaciones de corte y ritmo visual: [corte rápido], [plano cerrado], [texto en pantalla: "X"]
- Cada línea de audio máximo 12 palabras (para que quepa en un subtítulo).
- El guión debe sonar como lo diría un humano real, no como un locutor de radio de los 90.`;
    }

    if (mode === 'standard') {
      return `Escribe un guión de VSL ESTÁNDAR (8-10 minutos) para: "${topic}".

Estructura Frank Kern + Russell Brunson "Perfect VSL":
1. HOOK + OPEN LOOP (45 seg): Empieza en el medio de la acción. Promete revelar algo que no van a escuchar en otro lugar. Deja el loop abierto.
2. HISTORIA DE ORIGEN (90 seg): El momento en que todo cambió. Específico, sensorial, con el "enemigo" identificado. Técnica Brunson: héroe roto que encuentra el mapa.
3. PROBLEMA PROFUNDO + AGITACIÓN (60 seg): No el problema obvio, el problema debajo del problema. El que no se atreven a decir en voz alta.
4. CIERRE DEL OPEN LOOP + MECANISMO ÚNICO (90 seg): Aquí revelan lo que prometiste al inicio. Por qué tu enfoque funciona cuando otros fallaron — el "secreto" específico.
5. PRUEBA SOCIAL DETALLADA (60 seg): 2-3 historias de transformación con resultados concretos y medibles.
6. LA OFERTA EN CAPAS — STACK (90 seg): Presenta el producto principal, luego agrega valor capa por capa. Cada capa tiene su precio por separado antes de revelar el precio real.
7. GARANTÍA BALLSY (30 seg): Una garantía tan fuerte que parece locura. Eso genera confianza.
8. URGENCIA REAL + CTA (45 seg): Una razón legítima para actuar ahora. Una sola acción a tomar.

FORMATO DE GUIÓN:
- Dos columnas: **AUDIO** | **VIDEO**
- Notas musicales y de ritmo entre corchetes
- Indicaciones de texto en pantalla y gráficas de refuerzo
- Variaciones de ritmo: lento en emocional, rápido en benefits, pausas dramáticas antes de reveals.`;
    }

    // mode === 'webinar' — HIGH TICKET
    return `Escribe un guión de WEBINAR PITCH DE ALTO TICKET (20+ minutos) para: "${topic}".

⚠️ REGLA CRÍTICA DE ALTO TICKET: Este guión NO menciona precio en ningún momento. El objetivo es vender la LLAMADA DE ESTRATEGIA o APLICACIÓN, no el programa. El precio se revela únicamente en la llamada privada de ventas.

Estructura Alex Hormozi / Russell Brunson "Perfect Webinar" para High Ticket:

1. APERTURA Y PROMESA (2-3 min):
   - Hook con estadística o afirmación contraintuitiva.
   - La gran promesa: qué van a poder hacer al terminar este webinar.
   - Razones para quedarse: "Si te quedas hasta el final, vas a ver [X] que nadie más enseña."
   - Credibilidad anti-guru: no es quién eres, es qué has hecho/visto.

2. HISTORIA DE TRANSFORMACIÓN (3-4 min):
   - Técnica Brunson: "Hace X tiempo yo estaba en tu misma situación..."
   - El VILLANO del sistema (por qué el mercado fallaba antes de tu método).
   - El momento de quiebre. La epifanía. El mapa que cambió todo.

3. CONTENIDO DE VALOR REAL — 3 SECRETOS (8-10 min):
   - Cada "secreto" destruye una creencia limitante específica.
   - Secreto 1: Reencuadra el problema (la gente cree X, la realidad es Y).
   - Secreto 2: Destruye la alternativa más común (por qué lo que están haciendo no funciona).
   - Secreto 3: Introduce el mecanismo único de tu método como la única salida lógica.
   - Valor real: que sientan que ya aprendieron algo que vale dinero.

4. TRANSICIÓN A LA OFERTA (2 min):
   - "Lo que acaban de aprender funciona. Pero hay una razón por la que la mayoría no lo implementa..."
   - El problema de la implementación: tiempo, contexto, guía experta.
   - La oferta como el puente natural hacia el resultado prometido.

5. PRESENTACIÓN DEL PROGRAMA (3-4 min):
   - Nombre del programa/servicio.
   - Qué incluye (stack de valor detallado, SIN precio por elemento).
   - La transformación específica que entrega (antes/después concreto).
   - Quién es el candidato ideal (calificación).

6. PRUEBA SOCIAL (2 min):
   - 3 historias de clientes con resultados medibles y específicos.
   - Diferentes perfiles para que cada segmento se identifique.

7. CTA PARA LA LLAMADA / APLICACIÓN (2-3 min):
   - NO es "compra ahora". Es "el siguiente paso es una conversación de 45 minutos".
   - Explica qué pasa en la llamada (sin presión, diagnóstico real).
   - Escasez basada en disponibilidad de agenda, no en precio.
   - El costo de NO actuar: qué pierde si espera otro mes/año.
   - Instrucción clara y única: [URL o proceso de aplicación].

FORMATO DE GUIÓN:
- Dos columnas: **AUDIO** | **VIDEO**
- Slides sugeridos entre corchetes: [SLIDE: "El 87% de los X hacen esto..."]
- Notas de energía y ritmo: [tono más íntimo aquí], [pausa de 3 segundos], [sonríe]
- Indicaciones de interacción: [pedirles que escriban en chat], [encuesta en pantalla]`;
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
          modulePrompt: buildVSLPrompt(mode, topic),
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'vsl',
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
    } catch (e) {
      console.error(e);
      setOutput("Error generando el guión VSL.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1 flex items-center gap-2">
            <Video size={24} className="text-brand-primary" />
            Cinema VSL
          </h1>
          <p className="text-text-secondary text-sm">Scripts audiovisuales directos para la venta.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Modo y Duración</label>
          <div className="flex flex-col gap-3">
            {VSL_MODES.map(m => {
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-3 rounded-lg border text-left transition-colors flex justify-between items-center ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <div>
                    <h5 className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{m.name}</h5>
                  </div>
                  <span className="text-[10px] text-text-muted text-right max-w-[140px] leading-tight flex-shrink-0">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <label className="text-sm font-semibold text-text-primary block">Trama Principal / Oferta Mímesis</label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Lanzamiento del curso 'Productividad 10x'. El enfoque es que gestionar el tiempo es mentira, hay que gestionar la energía mental..."
              className="w-full flex-1 bg-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-4 bg-brand-primary hover:bg-brand-secondary disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-auto"
        >
          <Wand2 size={20} className={isGenerating ? "animate-pulse" : ""} />
          {isGenerating ? 'Escribiendo Guión...' : 'Producir Guión VSL'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Video size={18} className="text-brand-primary" />
            Scripts Timeline
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll relative z-10 text-sm leading-relaxed text-text-primary">
          {output ? (
            <div className="markdown-content">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-elevated border border-border-subtle flex items-center justify-center shadow-lg">
                 <Video size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Un Video Sales Letter requiere atención perfecta. Construye la columna vertebral de tu oferta en formato guión separando Audio y Video.</p>
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
