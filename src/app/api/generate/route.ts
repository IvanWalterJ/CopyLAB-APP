import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyB5HKKZK5HgyjyK17Mqk0EKuumLWEyHjyI";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    try {
        const { product, audience, objective, mode, selectedFormats, selectedAngles } = await req.json();

        const modeCtx = mode === "ads"
            ? "ADS PAGADOS: copy directo, orientado a conversión, CTA claro."
            : "CONTENIDO ORGÁNICO: conectar, aportar valor, generar engagement genuino.";

        const formatInstructions = selectedFormats.map((fid: string) => {
            if (fid === "reel") return `- REEL: Hook impactante (máx 2 líneas) + guión fluido de 8-12 líneas con ritmo de video corto`;
            if (fid === "carrusel") return `- CARRUSEL: Slide 1 (portada gancho), Slides 2-5 (desarrollo), Slide final (CTA)`;
            if (fid === "estatica") return `- IMAGEN ESTÁTICA: Headline poderoso (máx 8 palabras) + copy de apoyo (2-4 líneas) + CTA`;
        }).join("\n");

        const prompt = `Eres un experto copywriter. ${modeCtx}

PRODUCTO: ${product}
PÚBLICO: ${audience}
OBJETIVO: ${objective}

Genera copy para los siguientes ÁNGULOS (IDs): ${selectedAngles.join(", ")}
En estos formatos (IDs): ${selectedFormats.join(", ")}

Instrucciones por formato:
${formatInstructions}

REGLAS:
- Cada pieza deber ser auténtica, no genérica.
- Lenguaje que resuene con el público objetivo.
- Ángulos notablemente distintos entre sí.
- Sin emojis excesivos.

RESPONDE ÚNICAMENTE con un objeto JSON válido, siguiendo estructuralmente este formato (sin markdown ni bloques de código, solo el raw JSON):
{
  "copies": [
    { "angle": "id_angulo", "format": "id_formato", "content": "copy generado completo" }
  ]
}
Tu repuesta debe incluir todas las combinaciones posibles de Ángulos y Formatos pedidas. Genera ${selectedAngles.length * selectedFormats.length} copys.`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to generate copy" }, { status: 500 });
    }
}
