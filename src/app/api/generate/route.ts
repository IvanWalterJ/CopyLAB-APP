import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PERSONA = `Eres un Director Creativo de Respuesta Directa de clase mundial con 20 años de experiencia.
Has generado más de $100M en ventas para clientes con tus copys.
NUNCA usas frases genéricas o corporativas. SIEMPRE piensas en psicología del consumidor primero.
Tu copy es específico, visceral, emocional y orientado a la acción. 
Evitas: "transforma", "potencia", "eleva", "revolutionary", "game-changer" y cualquier cliché del marketing.
Usas: verbos de acción fuertes, números específicos, detalles concretos, contraste extremo, y bucles de curiosidad.`;

function buildMultiAnglePrompt(data: any) {
  const { product, audience, objective, mode, selectedFormats, selectedAngles } = data;
  const modeCtx = mode === "ads"
    ? "ADS PAGADOS: copia de respuesta directa, CTA explícito, arquitectura AIDA, orientado a conversión inmediata."
    : "CONTENIDO ORGÁNICO: genera engagement genuino, aporta valor real, conecta emocionalmente sin vender de forma explícita.";

  const formatInstructions = selectedFormats.map((fid: string) => {
    if (fid === "reel") return `- REEL: Hook visual en la primera línea (máx 10 palabras que paren el scroll) + guión de 10-15 líneas cortas con ritmo TikTok/Reels. Incluye [ACCIÓN DE CÁMARA] donde sea relevante.`;
    if (fid === "carrusel") return `- CARRUSEL: Slide 1 (portada: promesa/dato impactante que genere swipe), Slides 2-6 (desarrollo progresivo con ganchos entre slides), Último slide (CTA irresistible + razón para guardar)`;
    if (fid === "estatica") return `- IMAGEN ESTÁTICA: Headline de máx 7 palabras (debe funcionar solo como imagen) + copy de apoyo de 2-3 líneas + CTA específico con beneficio`;
    return "";
  }).join("\n");

  const angleMap: Record<string, string> = {
    dolor: "DOLOR: Clava el dedo en la herida. Describe el dolor con precisión quirúrgica, usa detalles específicos que hagan al lector decir 'eso me pasa a mí'.",
    aspiracional: "ASPIRACIONAL: Pinta la vida que quieren con detalles sensoriales. No la versión genérica del sueño, sino los detalles concretos del día a día deseado.",
    social_proof: "SOCIAL PROOF: Resultados específicos (números reales), no testimonios genéricos. '27 personas lograron X en Y semanas' es mejor que 'muchos clientes mejoraron'.",
    curiosidad: "CURIOSIDAD: Abre un loop mental que NO pueden cerrar sin consumir el contenido. Revela algo contraintuitivo o poco conocido del nicho.",
    urgencia: "URGENCIA: Crea consecuencias reales de NO actuar hoy. No urgencia falsa ('¡Solo quedan 3 cupos!'), sino urgencia basada en la realidad del lector.",
    educativo: "EDUCATIVO: Enseña algo genuinamente valioso en formato rápido. El aprendizaje en sí mismo es el engagement. Simplifica lo complejo.",
    identidad: "IDENTIDAD: Habla a quiénes son (o quieren ser), no a lo que hacen. 'Las personas que X hacen Y' activa la identidad tribal."
  };

  return `${SYSTEM_PERSONA}

${modeCtx}

===
BRIEF:
Producto/Servicio: ${product}
Público objetivo: ${audience}
Objetivo de negocio: ${objective}
===

ÁNGULOS A DESARROLLAR:
${selectedAngles.map((id: string) => angleMap[id] || id).join("\n")}

FORMATOS:
${formatInstructions}

PROCESO DE ESCRITURA:
1. Primero identifica el MAYOR DOLOR o DESEO más profundo del público
2. Luego elige el ángulo más disruptivo, no el más obvio
3. Escribe el hook/headline primero — si no para el scroll, reescribilo
4. Cada pieza debe poder funcionar SIN contexto previo

REGLAS ABSOLUTAS:
- ESPECÍFICO > GENÉRICO (siempre)
- EMOCIONAL > RACIONAL (siempre)  
- ACTIVO > PASIVO (siempre)
- Cada ángulo debe sonar diferente en tono y estructura
- Sin emojis excepto donde sean parte natural del contenido

RESPONDE ÚNICAMENTE con JSON válido (raw, sin markdown):
{
  "copies": [
    { "angle": "id_angulo", "format": "id_formato", "content": "copy generado completo" }
  ]
}
IDs de ángulos: ${selectedAngles.join(", ")}
IDs de formatos: ${selectedFormats.join(", ")}
Total piezas: ${selectedAngles.length * selectedFormats.length}`;
}

function buildHooksPrompt(data: any) {
  const { product, audience, objective, platform, hookCount } = data;
  const count = hookCount || 10;
  return `${SYSTEM_PERSONA}

Tu misión: generar ${count} hooks que PAREN EL SCROLL en los primeros 0.3 segundos.
El algoritmo favorece el tiempo de visualización. Un hook malo = el video muere.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
PLATAFORMA: ${platform || "Instagram/TikTok"}

TIPOS DE HOOKS (genera variedad, al menos 2 de cada tipo):
- PREGUNTA: No cualquier pregunta. Una que el público YA se está haciendo a las 2am.
- DATO: Un número específico y contraintuitivo. "El 73% de las personas que X nunca logran Y"
- CONFESIÓN: Vulnerabilidad calculada que rompe la cuarta pared. "Tardé 5 años en admitirlo..."
- CONTRARIAN: Destroza una creencia que TODOS en el nicho tienen. Más específico = mejor.
- CURIOSIDAD: Abre un loop que el cerebro NECESITA cerrar. No se puede evitar seguir viendo.
- INSTRUCCIÓN: "Haz X en los próximos 60 segundos y cambia Y para siempre"
- STORYTELLING: Primera línea de una historia que NO puede terminar bien (tensión inmediata)

REGLAS DE ORO:
- Máximo 2 líneas, máximo 15 palabras por línea
- Deben funcionar sin sonido (solo texto visual)
- Lenguaje natural, coloquial, del público objetivo
- Si el hook puede usarse para otro producto = no es específico suficiente
- Incluye una razón de por qué funciona psicológicamente

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "hooks": [
    { "type": "pregunta|dato|confesion|contrarian|curiosidad|instruccion|storytelling", "content": "hook aquí", "why": "principio psicológico que lo hace funcionar" }
  ]
}`;
}

function buildLandingPrompt(data: any) {
  const { product, audience, objective, landingType } = data;
  return `${SYSTEM_PERSONA}

Genera el copy completo para una landing page de ALTA CONVERSIÓN. 
Las landing pages mediocres convierten al 1-2%. Las grandes convierten al 8-15%.
La diferencia: especificidad brutal, sin generalidades.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
TIPO DE LANDING: ${landingType || "Venta directa"}

ARQUITECTURA DE CONVERSIÓN:

1. HERO: 
   - Headline: La transformación específica en máx 10 palabras (resultado + tiempo + sin X)
   - Subheadline: Para quién ES y para quién NO ES (claridad > persuasión)
   - CTA primario: Verbo de acción + beneficio (no "Comprar", sino "Quiero [resultado]")

2. PROBLEMA (Agitación):
   - 3 dolores específicos descritos con el lenguaje EXACTO que usa el público
   - Consecuencias de NO resolver el problema ahora

3. MECANISMO ÚNICO:
   - Por qué otras soluciones fallan
   - Qué hace diferente TU solución (el "secret mechanism")

4. SOLUCIÓN + BENEFICIOS:
   - 4-6 beneficios con headline de beneficio + descripción de por qué importa
   - Beneficios de 2do nivel (no "ahorra tiempo" sino "tiempo para lo que implorta")

5. PRUEBA SOCIAL:
   - 3 testimonios específicos (resultado + tiempo + obstáculo superado)
   - Credenciales o logros del creador/empresa

6. OFERTA IRRESISTIBLE:
   - Stack de valor con precio individual de cada componente
   - Precio con anclaje claro
   - Garantía específica (no "satisfacción garantizada")

7. FAQ (Objeciones Ocultas):
   - 5 preguntas que responden las VERDADERAS dudas: precio, tiempo, nivel, garantía, "¿funciona para mí?"

8. CTA FINAL:
   - Resumen de la transformación + urgencia real + CTA

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "sections": [
    { "section": "hero|problema|mecanismo|solucion|social_proof|oferta|faq|cta_final", "title": "título de la sección", "content": "copy completo" }
  ]
}`;
}

function buildVSLPrompt(data: any) {
  const { product, audience, objective, duration } = data;
  return `${SYSTEM_PERSONA}

Genera un guión de VSL (Video Sales Letter) que VENDE mientras entretiene.
Los primeros 30 segundos determinan si el video se ve completo. Sin hook poderoso, todo lo demás es inútil.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
DURACIÓN: ${duration || "5-8 minutos"}

ESTRUCTURA DE MÁXIMA CONVERSIÓN:

1. HOOK (0:00-0:30): 
   - Promesa específica + credibilidad inmediata + loop de curiosidad
   - "En los próximos X minutos vas a descubrir [resultado específico] incluso si [obstáculo principal]"

2. IDENTIFICACIÓN (0:30-1:30):
   - "¿Alguna vez sentiste que...?" — descripción exacta de su realidad actual
   - Agitar el dolor con detalles concretos que hagan decir "eso soy yo"

3. HISTORIA DE ORIGEN (1:30-2:30):
   - Tu historia o la historia de un cliente: del punto A (dolor compartido) al punto B (resultado)
   - Incluye el MOMENTO DE QUIEBRE específico

4. PRESENTACIÓN DEL SISTEMA (2:30-4:00):
   - El mecanismo único explicado de forma simple
   - Por qué funciona cuando otras cosas fallaron
   - Pasos del proceso (máx 3-5 pasos)

5. PRUEBA (4:00-5:00):
   - Resultados específicos (números, plazos, nombres si hay permiso)
   - Responde la pregunta: "¿Por qué no lo hacen todos?" 

6. OFERTA STACK (5:00-6:00):
   - Construye el valor primero, luego revela el precio
   - "Si tuvieras que contratar a alguien para hacer todo esto, pagarías X..."

7. URGENCIA + GARANTÍA (6:00-6:30):
   - Razón real de la urgencia (no artificial)
   - Garantía que elimine el riesgo de la decisión

8. CTA TRIPLE (6:30-7:00):
   - Resumén del beneficio principal
   - Instrucción de acción exacta (qué hacer)
   - Reafirmación de la garantía

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "sections": [
    { "section": "hook|identificacion|historia|sistema|prueba|oferta|urgencia|cta", "timestamp": "0:00-0:30", "title": "nombre sección", "script": "guión palabra por palabra", "direction": "nota de producción/dirección" }
  ]
}`;
}

function buildEmailPrompt(data: any) {
  const { product, audience, objective, sequenceLength } = data;
  const count = sequenceLength || 5;
  return `${SYSTEM_PERSONA}

Genera una secuencia de ${count} emails de nurturing que CONVIERTEN.
El email marketing tiene el ROI más alto ($36 por cada $1 invertido), pero solo si los emails se abren.
La tasa de apertura promedio es del 21%. Los mejores llegan al 50%+. La diferencia: el subject line.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}

ARQUITECTURA DE LA SECUENCIA:
Email 1 (Día 0 - BIENVENIDA+VALOR): Entrega valor INMEDIATO y sorprendente. Rompe con la expectativa de "email de bienvenida genérico".
Email 2 (Día 2 - HISTORIA): Historia de transformación con detalles viscerales. Conexión emocional profunda.
Email 3 (Día 4 - EDUCACIÓN): El secreto que cambia la perspectiva. Los deja pensando "no sabía esto".
Email 4 (Día 6 - PRUEBA SOCIAL): Resultados específicos de personas COMO ELLOS (mismo punto de partida).
Email 5 (Día 8 - OFERTA+URGENCIA): Todo lo anterior construyó confianza. Ahora: oferta clara con urgencia real.
${count > 5 ? `Emails 6-${count} (Días 10+): Seguimiento con más valor, soft CTAs, objeciones respondidas, testimonios adicionales.` : ""}

PARA CADA EMAIL:
- Subject (A): Curiosidad o beneficio específico (máx 50 chars)
- Subject (B): Contrarian u provocación (para A/B test)
- Preview text: Complementa el subject, no lo repite
- Body: Conversacional, como carta de un amigo que te conoce bien
- CTA: Específico y con beneficio, no solo "Comprar"

REGLAS DE EMAIL MARKETING DE ÉLITE:
- Escribe como si le escribes a UNA persona, no a una lista
- Primer párrafo: gancho. Si no engancha, el resto no importa.
- Longitud ideal: 150-250 palabras (respetan el tiempo del lector)
- Incluye [NOMBRE] para personalización (máx 1-2 veces)
- Un solo CTA por email (no des opciones paralelas)
- Termina cada email con anticipación del siguiente

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "emails": [
    { "number": 1, "day": 0, "subject": "subject A", "subject_ab": "subject B", "preview": "preview text", "body": "cuerpo completo del email", "cta": "texto + URL del CTA" }
  ]
}`;
}

function buildAdCopyPrompt(data: any) {
  const { product, audience, objective, platform } = data;
  return `${SYSTEM_PERSONA}

Genera 6 variantes de ad copy de ALTA CONVERSIÓN para tests A/B.
Los ads mediocres gastan presupuesto. Los buenos generan ROAS de 3x+.
La clave: hablar exclusivamente al segmento correcto en el momento correcto.

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}
PLATAFORMA: ${platform || "Meta Ads (Facebook/Instagram)"}

VARIANTES PARA TEST A/B:

1. DOLOR → SOLUCIÓN: Clava el dedo en el dolor MÁS específico, luego presenta la solución como el único camino lógico.

2. BENEFICIO DIRECTO: Lidera con el resultado final más deseable. No el producto, sino la VIDA después del producto.

3. SOCIAL PROOF ESPECÍFICO: "X personas en [ciudad/nicho/situación] lograron [resultado] en [tiempo]". Números reales.

4. CONTRARIAN DISRUPTIVO: Destroza una creencia dominante del nicho que saben que necesita ser desafiada.

5. MICRO-HISTORIA: En 3-5 líneas, el arco completo: problema → intento fallido → solución → resultado.

6. URGENCIA BASADA EN CONSECUENCIAS: No "¡Últimas horas!", sino las CONSECUENCIAS REALES de no actuar hoy.

PARA CADA VARIANTE:
- Primary text corto: Para mobile feed (máx 125 chars) — debe funcionar sin necesitar el resto
- Primary text largo: Versión extendida con más contexto y persuasión (hasta 500 chars)
- Headline: Máx 40 chars - completa o contrasta el primary text
- Description: Máx 30 chars - CTA específico con beneficio
- Nota creativa: Imagen/video sugerido para maximizar la variante

REGLAS DE ADS DE ÉLITE:
- El primer texto visible determina si se expande "Ver más"
- Prueba social específica siempre > afirmaciones genéricas
- Nunca uses "¡" al principio (señal de spam)
- La imagen/video vende la emoción, el copy vende la razón
- CTAs: "Quiero X", "Ver cómo", "Únete a X personas" > "Comprar ahora"

RESPONDE ÚNICAMENTE con JSON válido (sin markdown):
{
  "ads": [
    { "approach": "dolor_solucion|beneficio|social_proof|contrarian|storytelling|urgencia", "label": "nombre del enfoque", "primary_short": "texto corto", "primary_long": "texto largo", "headline": "headline", "description": "descripción", "creative_note": "sugerencia de imagen/video" }
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

    // Gemini 2.0 Flash is the fastest and most capable model — use it first
    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
    let lastError: any = null;

    for (const modelName of models) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (err: any) {
        console.error(`Error with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("Could not generate content with any model.");

  } catch (error: any) {
    console.error("API Error:", error?.message || error);
    return NextResponse.json(
      { error: "Error al generar. Intentá de nuevo en unos segundos.", details: error?.message },
      { status: 500 }
    );
  }
}
