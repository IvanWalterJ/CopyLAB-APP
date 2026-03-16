export const maxDuration = 60;

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { conversation } = await req.json() as {
      conversation: { role: 'agent' | 'user'; content: string }[];
    };

    const conversationText = conversation
      .map(m => `${m.role === 'agent' ? 'CONSULTOR' : 'CLIENTE'}: ${m.content}`)
      .join('\n\n');

    const synthesisPrompt = `Eres el mejor estratega de marketing del mercado hispanohablante. Analiza esta entrevista de descubrimiento de marca y extrae un perfil estratégico completo.

ENTREVISTA:
${conversationText}

TAREA: Basándote exclusivamente en la conversación, construye el perfil de marca más estratégico posible. Donde el cliente no haya dado detalles suficientes, infiere de forma inteligente y coherente con el contexto.

CRÍTICO: Devuelve ÚNICAMENTE un objeto JSON válido, sin texto previo, sin bloques de código markdown, sin explicaciones. Solo el JSON puro.

{
  "name": "nombre exacto de la marca o negocio mencionado",
  "industry": "industria o nicho específico (ej: 'Coaching de productividad para emprendedores')",
  "uvp": "Propuesta de valor única redactada de forma impactante. Una o dos oraciones que capturan la esencia diferenciadora. Sin clichés.",
  "competitors": "nombres de competidores mencionados, separados por coma",
  "avatar_name": "nombre ficticio representativo del cliente ideal (ej: 'Sofía, la emprendedora saturada')",
  "avatar_age": 35,
  "avatar_location": "país o región inferida del contexto",
  "avatar_pains": ["dolor 1 en las palabras exactas del cliente ideal", "dolor 2 visceral y específico", "dolor 3 profundo"],
  "avatar_desires": ["deseo 1 concreto y emocional", "deseo 2 con resultado tangible", "deseo 3 transformacional"],
  "avatar_objections": ["objeción 1 real y específica", "objeción 2", "objeción 3"],
  "brand_adjectives": ["adjetivo1", "adjetivo2", "adjetivo3", "adjetivo4", "adjetivo5"],
  "forbidden_words": ["palabra1", "palabra2", "palabra3"],
  "formality_level": 5,
  "product_name": "nombre del producto o servicio principal",
  "product_price": "precio tal como fue mencionado",
  "product_transformation": "Antes: [situación dolorosa actual]. Después: [resultado transformador concreto]",
  "product_mechanism": "el mecanismo, método o sistema único que diferencia esta oferta de cualquier otra",
  "product_results": "resultados concretos, números o casos de éxito mencionados",
  "product_guarantee": "garantía ofrecida si fue mencionada, null si no",
  "default_consciousness_level": 2
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(synthesisPrompt);
    const text = result.response.text().trim();

    // Extract JSON robustly even if Gemini adds extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'No se pudo generar el perfil. Intenta de nuevo.' }), { status: 500 });
    }

    const profile = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ profile }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Brand Agent Synthesis Error]:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error al generar el perfil.' }), { status: 500 });
  }
}
