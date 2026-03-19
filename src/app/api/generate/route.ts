export const maxDuration = 60; // Allows up to 60 seconds of execution
// Note: Node runtime (default) so cookies() works for auth

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrandProfile } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Replace with your actual Gemini API Key from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Admin client to bypass RLS securely for credit updates (requires SUPABASE_SERVICE_ROLE_KEY)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = serviceKey
  ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  : null;

function buildConsciousnessLayer(level: number): string {
  const layers: Record<number, string> = {
    1: `NIVEL 1 — INCONSCIENCIA: El mercado NO sabe que tiene este problema.
         Tu copy debe CREAR el problema en su mente. Usa datos, estadísticas, contrarian.
         Nunca hables de tu solución todavía. Habla de la situación/realidad que no ven.`,
    2: `NIVEL 2 — DOLOR CONSCIENTE: Saben el dolor, no conocen tu solución.
         Agita el dolor con detalles viscerales. Luego presenta la PROMESA general
         de que existe una salida. No reveles aún el cómo.`,
    3: `NIVEL 3 — SOLUCIÓN CONSCIENTE: Conocen el tipo de solución, no la tuya.
         Debes destruir las alternativas. Presenta tu MECANISMO ÚNICO.
         ¿Por qué tu enfoque funciona cuando otros fallan? Eso es lo que vende.`,
    4: `NIVEL 4 — PRODUCTO CONSCIENTE: Te conocen, están evaluando.
         Prueba social específica con resultados y nombres. Eliminá el riesgo.
         Garantía sólida. Trabaja las objeciones implícitas, no las obvias.`,
    5: `NIVEL 5 — MÁXIMA CONSCIENCIA: Listos para comprar. Solo necesitan el empujón.
         Precio claro. Urgencia real (no artificial). CTA directo y simple.
         Un solo paso de acción. Confirma que tomaron la decisión correcta.`,
  };
  return layers[level] || layers[2];
}

function buildBrandLayer(profile: BrandProfile | null): string {
  if (!profile) return 'No hay contexto de marca específico proveído. Genera asumiendo un tono persuasivo pero neutral.';

  const knowledgeSection = profile.knowledge_base_text?.trim()
    ? `\nBASE DE CONOCIMIENTO ADICIONAL (documentos subidos por el usuario):\n${profile.knowledge_base_text.substring(0, 3000)}\n`
    : '';

  return `
--- CONTEXTO DE MARCA (OBLIGATORIO) ---
Marca: ${profile.name} (${profile.industry || 'No especificada'})
Propuesta Única: ${profile.uvp || 'N/A'}

AVATAR AL QUE LE HABLAMOS:
- Nombre: ${profile.avatar_name || 'Desconocido'} (${profile.avatar_age || 'Edad no especificada'})
- Dolores que están experimentando: ${profile.avatar_pains?.join(', ')}
- Deseos o resultados anhelados: ${profile.avatar_desires?.join(', ')}

VOZ Y TONO DE MARCA:
- Adjetivos de personalidad: ${profile.brand_adjectives?.filter(Boolean).join(', ')}
- Formalidad (1 casual a 10 formal): ${profile.formality_level}
- PALABRAS ESTRICTAMENTE PROHIBIDAS: ${profile.forbidden_words?.filter(Boolean).join(', ')}

PRODUCTO A VENDER:
- Nombre: ${profile.product_name}
- Precio: ${profile.product_price}
- Transformación principal: ${profile.product_transformation}
- Mecanismo que hace que funcione: ${profile.product_mechanism}
- Garantía: ${profile.product_guarantee}
${knowledgeSection}--------------------------------------
`.trim();
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabaseSession = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {} // Immutable in this context 
        }
      }
    );

    const { data: { user } } = await supabaseSession.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Verify & Deduct Credits (only if service role key is configured)
    if (supabaseAdmin) {
      const { data: creditsData } = await supabaseAdmin
        .from('user_credits')
        .select('total_credits, used_credits')
        .eq('user_id', user.id)
        .single();

      if (!creditsData || (creditsData.total_credits - creditsData.used_credits <= 0)) {
        return new Response(JSON.stringify({ error: 'Insuficientes créditos. Recarga tu cuenta para continuar.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Deduct 1 credit using Admin client to ensure RLS bypass works for this specific action
      const { error: updateError } = await supabaseAdmin.rpc('use_credit', { target_user_id: user.id });
      
      if (updateError) {
        // Fallback for immediate update if RPC fails
        await supabaseAdmin
          .from('user_credits')
          .update({ used_credits: (creditsData.used_credits || 0) + 1 })
          .eq('user_id', user.id);
      }
    }

    const { modulePrompt, consciousnessLevel, brandProfile, moduleType = 'general' } = await req.json() as { 
      modulePrompt: string; 
      consciousnessLevel: number;
      brandProfile: BrandProfile | null;
      moduleType?: string;
    };

    const modelInfo = {
      model: "gemini-2.0-flash",
      systemInstruction: `Eres el mejor copywriter de respuesta directa del mundo hispanohablante. Tienes internalizadas las técnicas de los grandes maestros y sabes cuándo aplicar cada una según el formato y el nivel de consciencia del prospecto.

MAESTROS QUE DOMINAS (y cuándo usarlos):
- Gary Halbert: Historias personales crudas, cartas de ventas con urgencia emocional real, apertura con "Dear friend" energy adaptada al español.
- Gary Bencivenga: Credibilidad máxima, prueba aplastante, bullets de fascinación que crean curiosidad insoportable sobre secretos específicos.
- Dan Kennedy: Lenguaje directo sin filtros, targeting brutal ("Si eres el tipo de persona que..."), ofertas irresistibles con deadline real.
- Eugene Schwartz: Niveles de consciencia exactos, amplificación de deseos ya existentes, nunca crear necesidades artificiales.
- Alex Hormozi: Stacks de valor, math del ROI, eliminar el riesgo hasta el absurdo, lenguaje de negocios práctico sin florituras.
- Russell Brunson: Storytelling de "héroe roto", secuencias de epifanía, el "One Thing" como eje de toda comunicación.
- Frank Kern: Tono coloquial de amigo que ya consiguió el resultado, future pacing cinematográfico, humor estratégico.
- Joanna Wiebe (CopyHackers): Copy orientado a conversión digital, voz del cliente extraída de sus propias palabras, friction-busting.
- David Deutsch: Leads de gran idea, premisas contraintuitivas que reencuadran toda la categoría.

PRINCIPIOS IRRENUNCIABLES:
1. NUNCA empieces con "Descubre cómo...", "Imagina que...", "¿Te has preguntado alguna vez...". Son señales de copy mediocre.
2. El primer párrafo/frase debe ser tan magnético que sea físicamente imposible no seguir leyendo.
3. Habla como habla la audiencia, no como crees que debe hablar. Usa el lenguaje exacto del dolor y el deseo.
4. La especificidad vende. "Generé €47,382 en 11 días" > "generé miles de euros en poco tiempo".
5. Cada línea tiene un solo trabajo: hacer que se lea la siguiente.
6. El precio es el último argumento. La transformación y la prueba van primero.
7. REGLA CRÍTICA PARA ALTO TICKET: Nunca menciones precio en páginas/scripts diseñados para vender una llamada o aplicación. El precio se revela en la llamada de ventas, no antes.

VARIACIÓN DE ESTILO: Ajusta el tono según el módulo y el perfil de marca. No todo es urgencia y miedo. A veces el copy más poderoso es el más sereno, el más confiado, el que habla desde la autoridad sin pedir permiso.`
    };

    const model = genAI.getGenerativeModel(modelInfo);

    const brandLayer = buildBrandLayer(brandProfile);
    const consciousnessLayer = buildConsciousnessLayer(consciousnessLevel);

    const finalPrompt = `
Recuerda tus instrucciones de sistema.

Esta es la información contextual que DEBES usar como marco de referencia:

[PERFIL DE MARCA Y AUDIENCIA]
${brandLayer}

[NIVEL DE CONSCIENCIA DE LA AUDIENCIA (Schwartz)]
${consciousnessLayer}

[INSTRUCCIONES DEL MÓDULO (TU TAREA PRINCIPAL)]
${modulePrompt}

IMPORTANTE: Respira profundo y analiza las 3 capas antes de escribir. El resultado final
debe estar estrictamente alineado a la TAREA PRINCIPAL. Entrega SOLO el output solicitado en texto o JSON si se especificó, SIN explicaciones de cortesía al inicio o al final.
`;

    // Usamos Streaming
    const result = await model.generateContentStream(finalPrompt);

    // Creamos un ReadableStream que vamos popeando segun los chunks de Gemini
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            fullText += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }

        // Save to History when stream is done (don't wait for response to close)
        if (supabaseAdmin) {
          supabaseAdmin.from('generations').insert({
            user_id: user.id,
            brand_id: brandProfile?.id,
            module_type: moduleType,
            prompt: finalPrompt,
            content: fullText
          }).then(({ error: saveError }) => {
             if (saveError) console.error('[History Save Error]:', saveError);
          });
        }

        controller.close();
      }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive',
        }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Generate API Error]:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error occurred generating content.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
