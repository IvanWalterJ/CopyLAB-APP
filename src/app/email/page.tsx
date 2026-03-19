'use client';

import { useState } from 'react';
import { Wand2, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { useApp } from '@/lib/context';

const EMAIL_TYPES = [
  { id: 'lanzamiento', name: 'Serie Lanzamiento (5 emails)' },
  { id: 'bienvenida', name: 'Flujo de Bienvenida (3 emails)' },
  { id: 'abandono', name: 'Abandono de Carrito (2 emails)' },
  { id: 'nutricion', name: 'Contenido / Nutrición (1 email)' },
];

function buildEmailPrompt(type: string, topic: string): string {
  if (type === 'lanzamiento') {
    return `Redacta una Serie de Lanzamiento de 5 emails para: "${topic}".

Estructura de lanzamiento estilo Jeff Walker + Gary Halbert adaptada al email moderno:

**EMAIL 1 — EL PRECALENTAMIENTO (Enviar 5-7 días antes)**
Objetivo: Crear anticipación y abrir el loop. NO vender todavía.
- Subject A/B: Dos opciones. Una de curiosidad, una de promesa directa.
- Cuerpo: Historia personal que conecta con el dolor del avatar. Termina anunciando que algo está llegando sin revelar qué.
- CTA: "Responde este email y dime si esto te suena familiar..."

**EMAIL 2 — EL CONTENIDO DE VALOR (3-4 días antes)**
Objetivo: Demostrar expertise, destruir una creencia limitante.
- Subject A/B: Una de beneficio, una de contraintuitiva.
- Cuerpo: Enseña algo genuinamente útil relacionado con la oferta. Técnica Frank Kern: da tanto valor que la gente siente que ya debe algo.
- CTA: "Si quieres ver cómo aplico esto en detalle, sigue atento..."

**EMAIL 3 — LA PRUEBA SOCIAL (1-2 días antes)**
Objetivo: Generar FOMO con historias de transformación reales.
- Subject A/B: Una con nombre de cliente (si disponible), una con resultado específico.
- Cuerpo: 1-2 historias de transformación con antes/después medible. Conecta el resultado con lo que viene.
- CTA: "Mañana abro puertas. Te escribo a las [hora]."

**EMAIL 4 — APERTURA + OFERTA (Día del lanzamiento)**
Objetivo: Convertir. Este email vende directamente.
- Subject A/B: Una de apertura oficial, una de urgencia natural.
- Cuerpo: Recapitula el problema → promesa → mecanismo → stack de oferta → precio → garantía. Párrafos cortos, ritmo rápido. Técnica Kennedy: "Si has estado esperando el momento perfecto, este es."
- CTA: Link de compra directo con urgencia real.

**EMAIL 5 — CIERRE Y LAST CALL (Último día / última hora)**
Objetivo: Recuperar indecisos con urgencia de verdad.
- Subject A/B: Una de cuenta regresiva, una de "última oportunidad" con especificidad.
- Cuerpo: Muy corto. No más de 150 palabras. Recuerda el costo de no actuar. Cierra puertas con dignidad.
- CTA: Un solo link. Una sola acción.

REGLAS PARA TODOS LOS EMAILS:
- Párrafos de máximo 3 líneas. Preferible 1-2.
- Lenguaje conversacional, primera persona, como si lo escribiera un humano real.
- Sin bullets en el cuerpo principal (parecen spam). Narrativa fluida.
- Cada email debe poder leerse en menos de 60 segundos.`;
  }

  if (type === 'bienvenida') {
    return `Redacta un Flujo de Bienvenida de 3 emails para nuevos suscriptores de: "${topic}".

Objetivo del flujo: Convertir un lead frío en un prospecto caliente que confía, entiende el método, y está listo para comprar.

**EMAIL 1 — LA ENTREGA + PRIMER CONTACTO (Inmediato)**
Objetivo: Cumplir promesa de opt-in + establecer quién eres y por qué importa.
- Subject A/B: Confirma la entrega del lead magnet/recurso + curiosidad sobre qué sigue.
- Cuerpo: Entrega lo prometido. Luego, 3-4 líneas sobre quién eres en tono anti-guru (resultados concretos, no títulos). Cierra con una pregunta que invite a responder: humaniza la relación.
- CTA: Que descarguen/accedan al recurso + pide que respondan con su mayor desafío actual.

**EMAIL 2 — LA HISTORIA + EL MÉTODO (24-48 horas después)**
Objetivo: Generar confianza profunda mediante vulnerabilidad estratégica.
- Subject A/B: Una de historia personal, una de contraintuitiva sobre el tema.
- Cuerpo: Técnica Brunson "Epiphany Bridge": la historia de cómo encontraste el método. El fracaso real que precedió al breakthrough. Por qué tu enfoque es diferente. Sin vender todavía.
- CTA: "¿Quieres ver cómo apliqué esto? Te lo muestro en [recurso/próximo email]."

**EMAIL 3 — LA TRANSICIÓN A OFERTA (72 horas después)**
Objetivo: Invitar a dar el siguiente paso sin presión.
- Subject A/B: Una de beneficio directo, una de pregunta diagnóstica.
- Cuerpo: Resume el camino del suscriptor (dónde están, adónde quieren llegar). Presenta el siguiente paso natural (llamada, producto, comunidad) como la solución lógica. Tono de consejero, no de vendedor.
- CTA: Link a la oferta o página de aplicación con framing de "si encaja con lo que necesitas".

REGLAS: Párrafos cortos. Voz humana y cálida. El objetivo no es vender en estos emails, es crear la relación que hace que la venta sea la consecuencia natural.`;
  }

  if (type === 'abandono') {
    return `Redacta una Secuencia de Abandono de Carrito de 2 emails para: "${topic}".

Psicología del abandono: La persona quiso comprar. Algo la frenó. Tu trabajo es identificar y eliminar ese freno específico, no solo repetir la oferta.

**EMAIL 1 — EL RECORDATORIO EMPÁTICO (1 hora después del abandono)**
Objetivo: Recuperar sin presionar. Abrir diálogo.
- Subject A/B: Una que mencione el producto por nombre (curiosidad de "¿lo dejaron?"), una que hable al deseo (el resultado que buscaban).
- Cuerpo: Técnica Joanna Wiebe: habla al estado mental del comprador en ese momento. "Vi que empezaste y no terminaste — eso me dice que [X] importa. ¿Qué pasó?" Breve. Humano. Sin urgencia todavía.
- Incluye: Resumen de lo que obtienen (no precio, valor). Link de vuelta al carrito.
- CTA: "¿Tienes alguna pregunta antes de decidir? Responde este email."

**EMAIL 2 — LA OBJECIÓN + URGENCIA FINAL (24 horas después)**
Objetivo: Atacar la objeción más probable y cerrar con urgencia real.
- Subject A/B: Una que ataque la objeción más común ("¿Es el precio?"), una de escasez específica.
- Cuerpo: Nombra directamente la objeción más probable para ese avatar. Destrúyela con lógica y prueba social. Técnica Kennedy: el costo de esperar es mayor que el costo de actuar ahora. Urgencia real (plazas, fecha, bono que vence).
- CTA: Link directo al carrito con recordatorio de garantía para eliminar el riesgo residual.

REGLAS: Emails cortos y directos. Nada de explicar el producto de nuevo — ya lo vieron. Solo eliminar el freno que los detuvo.`;
  }

  // type === 'nutricion'
  return `Redacta 1 Email de Contenido / Nutrición para la lista de: "${topic}".

Objetivo: Aportar valor genuino que fortalezca la relación con la lista, demuestre expertise, y mantenga la confianza activa entre campañas de venta.

Técnica Gary Halbert "The Gary Halbert Letter" adaptada al email moderno: El mejor email de contenido es el que parece que lo escribió un amigo experto un domingo por la tarde, no una empresa.

- **Subject A/B**:
  - Opción A: Contraintuitiva o dato sorprendente relacionado con el tema.
  - Opción B: Una pregunta que el avatar se hace frecuentemente pero no sabe responder.

- **Cuerpo del email**:
  - Abre con una observación, anécdota, o dato de la vida real (NO "En el email de hoy...").
  - Desarrolla 1 idea central con profundidad. No listes 5 tips. Explora 1 insight de verdad.
  - Incluye un ejemplo concreto, un caso, o una analogía que haga la idea memorable.
  - Cierra con una reflexión o pregunta que invite a responder (los replies alimentan la entregabilidad).

- **CTA Suave** (opcional): Si hay un recurso o contenido relacionado, mencionarlo de forma natural, sin presión. "Si quieres ver cómo aplico esto, [link]."

REGLAS: Párrafos de 1-3 líneas. Máximo 350 palabras en el cuerpo. Que no parezca contenido de blog recortado — debe sonar a conversación personal.`;
}

export default function EmailArchitectPage() {
  const { activeBrand } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(4);
  const [type, setType] = useState('lanzamiento');
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
          modulePrompt: buildEmailPrompt(type, topic),
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'email',
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
      setOutput("Error generando la secuencia.");
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
            <Mail size={24} className="text-brand-primary" />
            Email Architect
          </h1>
          <p className="text-text-secondary text-sm">Convierte tu lista de contactos en compradores activos.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Objetivo de la Secuencia</label>
          <div className="grid grid-cols-1 gap-2">
            {EMAIL_TYPES.map(t => {
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
          <label className="text-sm font-semibold text-text-primary block">¿Sobre qué vamos a escribir?</label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Abrimos puertas al Bootcamp intensivo de desarrollo inmobiliario, es solo para 20 personas y se cierra el viernes a la medianoche."
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
          {isGenerating ? 'Enviando brief...' : 'Orquestar Flujo de Emails'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Mail size={18} className="text-brand-primary" />
            Flujo de Output
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
                 <Mail size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Los correos requieren A/B Testing, alta empatía y saltos de carro como un marketer legendario.</p>
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
