'use client';

import { useState, useEffect } from 'react';
import { IconWand, IconLayout, IconAlert, IconRefresh } from '@/components/icons';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/lib/context';

const LANDING_TYPES = [
  { id: 'vsl', name: 'VSL / Webinar', desc: 'Para productos high-ticket.' },
  { id: 'lead_magnet', name: 'Squeeze Page', desc: 'Opt-in de emails corto.' },
  { id: 'sales_letter', name: 'Carta de Ventas Larga', desc: 'Texto persuasivo largo.' }
];

export default function LandingArchitectPage() {
  const { activeBrand, refreshCredits } = useApp();
  const [type, setType] = useState('vsl');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanMarkdown = (text: string) =>
    text.replace(/^```(?:markdown)?\n?/i, '').replace(/```\s*$/, '').trim();

  const buildLandingPrompt = (type: string, topic: string): string => {
    if (type === 'vsl') {
      // HIGH TICKET: NO PRICE — sell the call/application
      return `Genera el copy completo de una Landing Page de VSL / Webinar de ALTO TICKET para: "${topic}".

⚠️ REGLA CRÍTICA DE ALTO TICKET: Esta landing page NO muestra precio, NO menciona condiciones económicas, NO tiene sección de "oferta". El único objetivo es calificar al prospecto y llevarlo a VER EL VSL / WEBINAR o SOLICITAR UNA LLAMADA. El precio se revela en la llamada o al final del webinar.

Estructura Russell Brunson "Perfect Webinar Landing" + Cialdini aplicado:

## PRE-HEADER
(Una línea de credencial de autoridad o dato de prueba social que establece contexto antes del headline. Ej: "Más de 340 [avatares] ya aplicaron este método en los últimos 6 meses.")

## HEADLINE PRINCIPAL
(La promesa específica y medible. Usa números reales. Evita adjetivos vacíos. Formato: "Cómo [resultado específico] en [tiempo específico] sin [objeción principal]" o una variante que no suene a plantilla.)

## SUBHEAD
(El mecanismo único en una frase. Por qué esto funciona diferente. No features, el por qué detrás.)

## PARA QUIÉN ES ESTE [WEBINAR/VSL]
(3-4 bullets de calificación positiva. "Esto es para ti si..." — cada bullet activa identidad tribal.)

## PARA QUIÉN NO ES
(2-3 bullets de descalificación. Esto genera deseo en quienes SÍ califican y elimina leads malos.)

## LO QUE VAS A DESCUBRIR
(5-7 bullets de promesas de contenido. No features, sino insights. Formato: "Por qué [creencia común] es la razón por la que la mayoría de [avatar] nunca logra [resultado]...")

## SOBRE [NOMBRE/MARCA]
(3-4 líneas de credibilidad específica. Resultados concretos. Sin títulos pomposos. Anti-guru pero autoridad real.)

## RESERVA TU LUGAR / SOLICITA TU LLAMADA
(Solo el formulario o botón. Sin precio. CTA claro y directo.)

## DEBAJO DEL BOTÓN
(Micro-commitment: "Esta sesión es gratuita / sin compromiso / [garantía de llamada]." + Refuerzo de escasez: "Solo [X] lugares disponibles esta semana.")

Formatea con ## para secciones, **negrita** para énfasis, listas con guiones. Responde en el mismo idioma del brief.`;
    }

    if (type === 'lead_magnet') {
      return `Genera el copy completo de una Squeeze Page de alta conversión para captura de emails sobre: "${topic}".

Técnica Gary Bencivenga + Joanna Wiebe para opt-in: La promesa debe ser tan específica y tan irresistible que el visitante sienta que sería un idiota si NO dejara su email.

## HEADLINE
(Una promesa ultra-específica + elemento de curiosidad. Puede incluir número, tiempo, o dato contraintuitivo. Máximo 10 palabras. No uses "Gratis" como gancho principal — eso atrae leads de baja calidad.)

## SUBHEAD
(Expande el headline. Quién lo creó, para quién es, y qué hace diferente. 1-2 líneas.)

## 3-4 BULLETS DE FASCINACIÓN
(Formato Halbert: Lo que van a descubrir, sin revelar el qué exactamente. Crea curiosidad insoportable. Ejemplos: "El error que comete el 94% de [avatar] justo antes de [dolor]..." / "Por qué [solución común] en realidad empeora [problema]...")

## FORMULARIO + CTA
(Texto del botón: no "Enviar" ni "Suscribirse". Una acción específica alineada a la promesa: "Quiero acceder ahora" / "[Nombre del lead magnet]".)

## MICRO-TEXTO BAJO EL FORMULARIO
(Política de privacidad en 1 línea coloquial. Ej: "Tu email es tuyo. Odiamos el spam tanto como tú.")

Formatea con ## para secciones, **negrita** para énfasis. Responde en el mismo idioma del brief.`;
    }

    // type === 'sales_letter' — Long-form with price/offer
    return `Genera el copy completo de una Carta de Ventas Larga (Long-Form Sales Letter) para: "${topic}".

Técnica combinada Dan Kennedy + Gary Halbert: La carta debe leerse como una conversación directa con un amigo que ya logró el resultado y te explica exactamente cómo. No un folleto. Una carta.

## PREHEAD
(1 línea de segmentación o credencial. Ej: "Solo para [avatar específico] que ya saben que [situación]...")

## HEADLINE PRINCIPAL
(La gran promesa con especificidad. Usa el formato más adecuado: curiosidad, promesa directa, o inversión de creencia. NUNCA empieces con el nombre de tu empresa.)

## SUBHEAD
(Refuerza el headline con el mecanismo: el "por qué esto funciona" en una frase.)

## CARTA DE APERTURA — EL GANCHO EMOCIONAL
(Párrafo de apertura que crea rapport inmediato. Técnica Halbert: empieza en el medio de una historia relevante al dolor del avatar. "Hace [X tiempo], yo estaba [situación específica frustrante]..." o ataca directamente el punto de dolor con empatía visceral.)

## EL PROBLEMA Y SU VERDADERA CAUSA
(No el problema obvio. El problema debajo del problema. La raíz que nadie está atacando. Agitación sin exageración, con datos si es posible.)

## LA SOLUCIÓN — EL MECANISMO ÚNICO
(Por qué tu enfoque es fundamentalmente diferente. El "unfair advantage". Sin revelar precio todavía.)

## 8-10 BULLETS DE FASCINACIÓN
(Los mejores bullets de Gary Bencivenga: cada uno revela que hay un secreto específico sin decir cuál es. Crean curiosidad insoportable. Formato: "Cómo [resultado] usando solo [mecanismo] — sin [objeción principal]...")

## PRUEBA SOCIAL DETALLADA
(2-3 testimonios con resultados específicos, nombres, y si es posible, el antes/después medible.)

## LA OFERTA — STACK DE VALOR
(Presenta el producto principal + bonos en capas. Cada elemento tiene valor propio. Técnica Hormozi: el stack debe hacer que el precio parezca ridículamente bajo antes de revelarlo.)

## PRECIO Y JUSTIFICACIÓN
(Revela el precio DESPUÉS de haber construido el valor. Justifica por qué es bajo comparado con el valor total. No pidas disculpas por el precio.)

## GARANTÍA SÓLIDA
(Una garantía tan fuerte que elimina todo el riesgo del comprador. Cuanto más ballsy, más confianza genera.)

## URGENCIA Y ESCASEZ REAL
(Una razón legítima para actuar hoy. No "oferta por tiempo limitado" sin fundamento. Escasez real de plazas, bonos que desaparecen, o fecha de cierre específica.)

## CTA FINAL + CIERRE
(Una sola acción. Recuerda el costo de no actuar. Cierra con la visión del futuro que el cliente quiere — future pacing de 2-3 líneas.)

Formatea con ## para secciones, **negrita** para énfasis, listas con guiones. Responde en el mismo idioma del brief.`;
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
          modulePrompt: buildLandingPrompt(type, topic),
          consciousnessLevel: 3,
          brandProfile: activeBrand,
          moduleType: 'landing',
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
      setOutput("Error generando la estructura de la landing.");
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

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar: Configurador / Brief */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1 flex items-center gap-2">
            <IconLayout size={24} className="text-brand-primary" />
            Landing Architect
          </h1>
          <p className="text-text-secondary text-sm">Construye páginas de conversión que imprimen dinero por ti.</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Objetivo / Tipo de Landing</label>
          <div className="flex flex-col gap-3">
            {LANDING_TYPES.map(t => {
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <h5 className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{t.name}</h5>
                  <p className="text-[10px] text-text-muted mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <label className="text-sm font-semibold text-text-primary flex justify-between">
            <span>¿De qué trata el producto u oferta?</span>
          </label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Un Mastermind para dueños de agencias cansados de sobrevivir mes a mes con clientes de bajo ticket..."
              className="w-full flex-1 bg-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
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
          className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-auto"
        >
          <IconWand size={20} className={isGenerating ? "animate-pulse" : ""} />
          {isGenerating ? 'Estructurando Bloques...' : 'Orquestar Landing'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 glass border border-border-glass rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-elevated">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <IconWand size={18} className="text-brand-primary" />
            Landing Output
          </h2>
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

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll relative z-10 text-sm leading-relaxed text-text-primary">
          {output ? (
            <div className="markdown-content">
              <ReactMarkdown>{cleanMarkdown(output)}</ReactMarkdown>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-elevated border border-border-subtle flex items-center justify-center shadow-lg animate-glow-pulse">
                 <IconLayout size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Ingresa la oferta y se generará todo el wireframe persuasivo, listo para diseñar y montar en tu CMS favorito.</p>
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
