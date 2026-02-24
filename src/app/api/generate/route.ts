import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

function buildMultiAnglePrompt(data: any) {
  const { product, audience, objective, mode, selectedFormats, selectedAngles } = data;
  const modeCtx = mode === "ads"
    ? "ADS PAGADOS: copy directo, orientado a conversión, CTA claro."
    : "CONTENIDO ORGÁNICO: conectar, aportar valor, generar engagement genuino.";

  const formatInstructions = selectedFormats.map((fid: string) => {
    if (fid === "reel") return `- REEL: Hook impactante (máx 2 líneas) + guión fluido de 8-12 líneas con ritmo de video corto`;
    if (fid === "carrusel") return `- CARRUSEL: Slide 1 (portada gancho), Slides 2-5 (desarrollo), Slide final (CTA)`;
    if (fid === "estatica") return `- IMAGEN ESTÁTICA: Headline poderoso (máx 8 palabras) + copy de apoyo (2-4 líneas) + CTA`;
    return "";
  }).join("\n");

  return `Eres un experto copywriter de clase mundial. ${modeCtx}

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}

Genera copy para los siguientes ÁNGULOS (IDs): ${selectedAngles.join(", ")}
En estos formatos (IDs): ${selectedFormats.join(", ")}

Instrucciones por formato:
${formatInstructions}

REGLAS:
- Cada pieza debe ser auténtica, no genérica.
- Lenguaje que resuene con el público objetivo.
- Ángulos notablemente distintos entre sí.
- Sin emojis excesivos.

RESPONDE ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código, solo el raw JSON):
{
  "copies": [
    { "angle": "id_angulo", "format": "id_formato", "content": "copy generado completo" }
  ]
}
IDs de ángulos válidos: ${selectedAngles.join(", ")}
IDs de formatos válidos: ${selectedFormats.join(", ")}
Total piezas: ${selectedAngles.length * selectedFormats.length}`;
}

function buildHooksPrompt(data: any) {
  const { product, audience, objective, platform, hookCount } = data;
  const count = hookCount || 10;
  return `Eres un experto en crear hooks virales para redes sociales. Genera ${count} hooks irresistibles.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
PLATAFORMA: ${platform || "Instagram/TikTok"}

Tipos de hooks a generar:
- Hooks de PREGUNTA provocadora
- Hooks de DATO impactante
- Hooks de CONFESIÓN/Vulnerabilidad
- Hooks de CONTRARIAN (opinión opuesta)
- Hooks de CURIOSIDAD (loop abierto)
- Hooks de INSTRUCCIÓN directa
- Hooks de STORYTELLING (inicio de historia)

REGLAS:
- Máximo 2 líneas por hook
- Deben detener el scroll inmediatamente
- Lenguaje natural, no corporativo
- Variedad de estilos

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "hooks": [
    { "type": "pregunta|dato|confesion|contrarian|curiosidad|instruccion|storytelling", "content": "hook aquí", "why": "por qué funciona en 1 línea" }
  ]
}`;
}

function buildLandingPrompt(data: any) {
  const { product, audience, objective, landingType } = data;
  return `Eres un experto copywriter especializado en páginas de venta de alta conversión. Genera el copy completo para una landing page.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
TIPO DE LANDING: ${landingType || "Venta directa"}

Genera el copy para CADA sección de la landing:

1. HERO: Headline principal (máx 10 palabras potentes), subheadline (1-2 líneas), CTA principal
2. PROBLEMA: 3 puntos de dolor específicos del público
3. SOLUCIÓN: Cómo el producto resuelve cada dolor
4. BENEFICIOS: 4-6 beneficios con headline + descripción
5. SOCIAL PROOF: 3 testimonios realistas (nombre, rol, testimonio)
6. OFERTA: Presentación de precio con anclaje, bonos incluidos
7. FAQ: 5 preguntas frecuentes con respuestas que vendan
8. CTA FINAL: Headline de cierre + botón + urgencia

REGLAS:
- Copy persuasivo pero honesto
- Usar dolor y aspiración
- CTAs claros y directos

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "sections": [
    { "section": "hero|problema|solucion|beneficios|social_proof|oferta|faq|cta_final", "title": "título de la sección", "content": "copy completo de la sección" }
  ]
}`;
}

function buildVSLPrompt(data: any) {
  const { product, audience, objective, duration } = data;
  return `Eres un experto en guiones de VSL (Video Sales Letters) de alta conversión. Genera un guión completo.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
DURACIÓN OBJETIVO: ${duration || "5-8 minutos"}

Estructura del guión VSL:

1. HOOK (0:00-0:30): Gancho que detenga y enganche al espectador en los primeros 5 segundos
2. PROBLEMA (0:30-2:00): Agitar el dolor, hacer que se sienta identificado
3. CREDIBILIDAD (2:00-2:30): Por qué deberían escucharte a vos
4. SOLUCIÓN (2:30-4:00): Presentar la solución de forma progresiva
5. PRUEBA (4:00-5:00): Evidencia, resultados, testimonios
6. OFERTA (5:00-6:00): Qué incluye, precio, anclaje de valor
7. URGENCIA (6:00-6:30): Por qué actuar ahora
8. CTA (6:30-7:00): Llamada a la acción clara y repetida

REGLAS:
- Tono conversacional, como si hablaras 1 a 1
- Transiciones naturales entre secciones
- Incluir direcciones de cámara [CORTE A], [ZOOM IN], [B-ROLL]
- Pausas dramáticas marcadas con ...

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "sections": [
    { "section": "hook|problema|credibilidad|solucion|prueba|oferta|urgencia|cta", "timestamp": "0:00-0:30", "title": "nombre sección", "script": "guión palabra por palabra", "direction": "nota de dirección" }
  ]
}`;
}

function buildEmailPrompt(data: any) {
  const { product, audience, objective, sequenceLength } = data;
  const count = sequenceLength || 5;
  return `Eres un experto en email marketing y secuencias de nurturing. Genera una secuencia de ${count} emails.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}

Estructura de la secuencia:
Email 1: BIENVENIDA + Entrega de valor inmediato
Email 2: HISTORIA + Conexión emocional
Email 3: EDUCACIÓN + Posicionamiento como autoridad
Email 4: PRUEBA SOCIAL + Casos de éxito
Email 5: OFERTA + Urgencia y CTA final
${count > 5 ? `Email 6-${count}: Secuencia de seguimiento con más valor y soft CTAs` : ""}

Para cada email genera:
- Subject line (testear con variante A/B)
- Preview text
- Body completo
- CTA

REGLAS:
- Subjects que generen apertura (curiosidad, beneficio o urgencia)
- Longitud entre 150-300 palabras por email
- Personalización con [NOMBRE]
- No spam, valor real

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "emails": [
    { "number": 1, "subject": "subject line", "subject_ab": "variante A/B", "preview": "preview text", "body": "cuerpo completo", "cta": "texto del CTA" }
  ]
}`;
}

function buildAdCopyPrompt(data: any) {
  const { product, audience, objective, platform } = data;
  return `Eres un experto en publicidad digital y copywriting para ads pagados. Genera variantes de ad copy profesional.

PRODUCTO: ${product}
PÚBLICO: ${audience}  
OBJETIVO: ${objective}
PLATAFORMA: ${platform || "Meta Ads (Facebook/Instagram)"}

Genera 6 variantes de ads con diferentes enfoques:
1. DOLOR → SOLUCIÓN: Part del problema hacia la solución
2. BENEFICIO DIRECTO: Lidera con el resultado que obtienen
3. SOCIAL PROOF: Usa prueba social como gancho
4. CONTRARIAN: Desafía una creencia común del nicho
5. STORYTELLING: Mini historia en el ad
6. URGENCIA/ESCASEZ: Acción inmediata

Para CADA variante genera:
- Primary text (texto principal del ad, 125 chars para mobile)
- Headline (40 chars máx)
- Description (30 chars máx)
- Versión larga del primary text (hasta 500 chars)

REGLAS:
- Respetar límites de caracteres de la plataforma
- CTAs claros y específicos
- Sin clickbait engañoso
- Orientado 100% a conversión

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "ads": [
    { "approach": "dolor_solucion|beneficio|social_proof|contrarian|storytelling|urgencia", "label": "nombre del enfoque", "primary_short": "texto corto", "primary_long": "texto largo", "headline": "headline", "description": "descripción" }
  ]
}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { module: moduleType, ...data } = body;

    let prompt = "";

    switch (moduleType) {
      case "hooks":
        prompt = buildHooksPrompt(data);
        break;
      case "multi_angle":
        prompt = buildMultiAnglePrompt(data);
        break;
      case "landing":
        prompt = buildLandingPrompt(data);
        break;
      case "vsl":
        prompt = buildVSLPrompt(data);
        break;
      case "email":
        prompt = buildEmailPrompt(data);
        break;
      case "adcopy":
        prompt = buildAdCopyPrompt(data);
        break;
      default:
        prompt = buildMultiAnglePrompt(data);
    }

    const models = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
    let lastError: any = null;

    for (const modelName of models) {
      try {
        console.log(`Intentando con modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (err: any) {
        console.error(`Error con modelo ${modelName}:`, err?.message || err);
        lastError = err;
        // Continue to next model
      }
    }

    throw lastError || new Error("No se pudo generar contenido con ningún modelo.");

  } catch (error: any) {
    console.error("API Error Final:", error?.message || error);
    return NextResponse.json(
      { error: "Error al generar. Los modelos están saturados. Intentá de nuevo en unos segundos.", details: error?.message },
      { status: 500 }
    );
  }
}
