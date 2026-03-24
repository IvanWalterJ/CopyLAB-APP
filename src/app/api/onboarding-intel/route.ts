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
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { q0Answer, q1Answer } = await req.json() as { q0Answer: string; q1Answer: string };

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Eres un investigador de mercado senior especializado en psicología del consumidor hispanohablante.

El usuario acaba de describir su negocio así:
---
Respuesta 1 (nombre, industria, nicho): "${q0Answer}"
Respuesta 2 (qué hace, problema que resuelve): "${q1Answer}"
---

Tu tarea: generar inteligencia de mercado ESPECÍFICA y REAL para este nicho.

Devuelve SOLO el JSON válido, sin texto adicional, sin markdown, sin bloques de código:

{
  "pains": [
    "frase corta, primera persona, coloquial — cómo el avatar describiría su dolor",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona"
  ],
  "desires": [
    "frase corta, primera persona — qué sueña con lograr",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona",
    "frase corta, primera persona"
  ],
  "objections": [
    "objeción o miedo en primera persona, como el avatar lo diría",
    "objeción o miedo en primera persona",
    "objeción o miedo en primera persona",
    "objeción o miedo en primera persona",
    "objeción o miedo en primera persona"
  ],
  "mechanisms": [
    "posible diferenciador único para este tipo de negocio",
    "posible diferenciador único",
    "posible diferenciador único",
    "posible diferenciador único"
  ]
}

Reglas críticas:
1. Los pains/desires/objections en PRIMERA PERSONA del avatar, coloquiales, como los diría alguien real
2. ESPECÍFICOS para este nicho — no genéricos como "quiero mejorar"
3. Basados en lo que realmente dice la gente en foros, grupos, reviews y testimonios de este sector
4. Los dolores deben hacer que alguien del sector los lea y piense "sí, eso exactamente me pasa"
5. Máximo 12 palabras por item, lenguaje natural y directo`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON robustly
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const intel = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(intel), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[OnboardingIntel Error]:', error);
    return new Response(JSON.stringify({ error: 'Error generating intel' }), { status: 500 });
  }
}
