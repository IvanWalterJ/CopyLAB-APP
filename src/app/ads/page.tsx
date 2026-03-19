'use client';

import { useState } from 'react';
import { Wand2, Megaphone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { useApp } from '@/lib/context';

const AD_TYPES = [
  { id: 'meta', name: 'Meta Ads (FB/IG)' },
  { id: 'tiktok', name: 'TikTok Ads' },
  { id: 'google', name: 'Google Search Ads' },
];

function buildAdPrompt(type: string, topic: string): string {
  if (type === 'meta') {
    return `Genera 3 variantes de anuncio (A/B/C) para Meta Ads (Facebook/Instagram) sobre: "${topic}".

Meta Ads tiene 3 comportamientos clave: el thumb-stop en el feed, la lectura del primary text, y el clic en el headline. Cada variante debe dominar un ángulo psicológico distinto.

**VARIANTE A — ÁNGULO: DOLOR VISCERAL**
Técnica Dan Kennedy "agitate the wound": El primer texto toca el dolor exacto antes de hablar de cualquier solución.
- Primary Text (hasta 125 chars antes del "ver más"): Empieza con la situación dolorosa específica. Sin nombre de marca, sin beneficio todavía. Que el avatar diga "esto soy yo".
- Headline (máx 40 chars): La promesa directa como salida al dolor.
- Descripción del enlace (máx 30 chars): Refuerza el beneficio o añade urgencia.
- Brief Visual: Descripción específica para el diseñador/editor. Qué mostrar, qué texto en pantalla si aplica, tono visual (colores, estilo).

**VARIANTE B — ÁNGULO: CURIOSIDAD + CONTRAINTUITIVO**
Técnica David Deutsch "Big Idea Lead": Una premisa que choca con lo que el avatar cree que es cierto.
- Primary Text: Empieza con una afirmación contraintuitiva o un dato que desmiente una creencia común. El avatar frena porque no entiende cómo es posible.
- Headline: La promesa implícita de la big idea.
- Descripción del enlace: La razón de por qué funciona (el mecanismo en 5 palabras).
- Brief Visual: Formato carrusel, imagen de antes/después, o texto directo en pantalla que refuerce la contraintuitiva.

**VARIANTE C — ÁNGULO: PRUEBA SOCIAL + IDENTIDAD**
Técnica Cialdini "Social Proof + Tribal Identity": El avatar se ve reflejado en alguien que ya lo logró.
- Primary Text: Empieza con el resultado de un cliente/caso real (específico con números) o con una afirmación de identidad tribal ("Los [avatar] que X están haciendo Y...").
- Headline: La promesa del resultado, no del producto.
- Descripción del enlace: Acción directa + reductor de fricción ("Sin contrato", "Gratis", "En 5 minutos").
- Brief Visual: Testimonio en video UGC, captura de resultado real, o imagen que muestre el resultado final.

FORMATO: Usa **negrita** para cada campo. Separa claramente las 3 variantes.`;
  }

  if (type === 'tiktok') {
    return `Genera 3 variantes de anuncio (A/B/C) para TikTok Ads sobre: "${topic}".

En TikTok el anuncio ES el contenido. Los primeros 2 segundos deciden si se queda o se va. No hay "anuncio" — hay un video que engancha o no existe.

**VARIANTE A — FORMATO: HOOK DE PATRÓN ROTO**
Los primeros 3 segundos dicen o muestran algo que no tiene sentido hasta que sí lo tiene.
- Hook de Apertura (primeras 2-3 palabras en pantalla o narración): La frase o imagen que detiene el scroll. Contraintuitiva, polémica o que genera una pregunta.
- Guión de Video (15-30 seg): Estructura Problem → Agitate → Solution rápida. Tono nativo TikTok: coloquial, sin producción corporativa.
- CTA Hablado + Visual: La llamada a la acción dicha en voz alta Y mostrada en texto en pantalla.
- Brief para Editor: Ritmo de cortes (cada 2-3 seg), textos en pantalla, música sugerida (energía, género), efectos.

**VARIANTE B — FORMATO: HISTORIA EN 20 SEGUNDOS**
Técnica "Before/After/Bridge" comprimida al formato TikTok.
- Hook de Apertura: Empieza en el "después" — muestra el resultado primero, luego explica cómo.
- Guión de Video: Before (situación dolorosa, 5 seg) → Bridge (el momento de cambio, 5 seg) → After (el resultado específico, 5 seg) → CTA (5 seg).
- CTA Hablado + Visual.
- Brief para Editor: Style nativo (texto overlay tipo TikTok, sin gráficas corporativas).

**VARIANTE C — FORMATO: EDUCATIVO "¿SABÍAS QUE?"**
Para awareness y productos que requieren explicación. Educa mientras vende.
- Hook de Apertura: Un dato sorprendente o afirmación que el avatar no esperaba.
- Guión de Video: Dato/revelación → Por qué importa → La solución simple → CTA.
- CTA Hablado + Visual.
- Brief para Editor: Texto en pantalla que refuerza cada punto clave, ritmo rápido, música de fondo motivacional suave.

FORMATO: Usa **negrita** para cada campo. Separa claramente las 3 variantes.`;
  }

  // type === 'google'
  return `Genera 3 variantes de grupo de anuncios (A/B/C) para Google Search Ads sobre: "${topic}".

En Google Search el usuario YA está buscando. Tu trabajo no es crear deseo — es capturar intención y ganar el clic con la promesa más relevante y creíble.

**VARIANTE A — ÁNGULO: MÁXIMA RELEVANCIA A LA BÚSQUEDA**
Técnica de mirroring: El anuncio repite el lenguaje exacto que usa el buscador.
- Headline 1 (máx 30 chars): Keyword principal + promesa inmediata.
- Headline 2 (máx 30 chars): Beneficio diferenciador o USP en pocas palabras.
- Headline 3 (máx 30 chars): CTA + reductor de fricción ("Sin costo", "Consulta gratis", "Ver ahora").
- Descripción 1 (máx 90 chars): Expande el beneficio. Específico, no genérico.
- Descripción 2 (máx 90 chars): Prueba social comprimida o garantía + urgencia.

**VARIANTE B — ÁNGULO: PROPUESTA ÚNICA + DIFERENCIACIÓN**
Para usuarios que ya compararon opciones. Debes ganar en el "por qué tú y no el otro".
- Headline 1: Lo que te hace fundamentalmente diferente (el mecanismo único).
- Headline 2: Resultado específico con número o tiempo.
- Headline 3: CTA directo.
- Descripción 1: Por qué tu solución funciona cuando otras no. El "unfair advantage" en 90 chars.
- Descripción 2: Eliminación de riesgo + siguiente paso claro.

**VARIANTE C — ÁNGULO: URGENCIA + ESCASEZ LEGÍTIMA**
Para capturar a los que están listos pero postergando.
- Headline 1: El costo de esperar o la oportunidad que vence.
- Headline 2: Lo que obtienen hoy vs. lo que pierden si esperan.
- Headline 3: CTA urgente y específico.
- Descripción 1: Razón real de la urgencia (plazas limitadas, fecha, precio que sube).
- Descripción 2: Garantía + un dato de prueba social que baje la percepción de riesgo.

**EXTENSIONES SUGERIDAS PARA LAS 3 VARIANTES:**
- Sitelinks (4): 4 páginas adicionales relevantes con texto corto.
- Callouts (4): 4 puntos de diferenciación en 25 chars cada uno.
- Snippet estructurado: Categoría relevante + 4 items.

FORMATO: Usa **negrita** para cada campo. Respeta los límites de caracteres indicados.`;
}

export default function AdSpecOpsPage() {
  const { activeBrand } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(2);
  const [type, setType] = useState('meta');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: buildAdPrompt(type, topic),
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'ads',
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
      setOutput("Error generando los Ad Specs.");
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
            <Megaphone size={24} className="text-brand-primary" />
            Ad-Spec Ops
          </h1>
          <p className="text-text-secondary text-sm">Scripts de anuncios con briefs generados para el equipo creativo.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Plataforma</label>
          <div className="grid grid-cols-1 gap-2">
            {AD_TYPES.map(t => {
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`px-4 py-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${isSelected ? 'border-brand-primary bg-brand-primary' : 'border-text-muted bg-transparent'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <label className="text-sm font-semibold text-text-primary block">Ángulo de Tráfico Frío / Tibio</label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Promo de Black Friday para software SaaS contable, apuntado a freelancers que no saben facturar."
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
          {isGenerating ? 'Escribiendo Ads...' : 'Generar Batería de Ads'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Megaphone size={18} className="text-brand-primary" />
            Creative Specs
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
                 <Megaphone size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Todo anuncio ganador necesita un gran texto y una fuerte dirección visual para ser ROAS positivo.</p>
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
