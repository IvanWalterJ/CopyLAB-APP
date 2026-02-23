"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

const SECTION_META: Record<string, { label: string; color: string; icon: string }> = {
    hook: { label: "Hook", color: "#ef4444", icon: "🎬" },
    problema: { label: "Problema", color: "#f59e0b", icon: "⚡" },
    credibilidad: { label: "Credibilidad", color: "#3b82f6", icon: "★" },
    solucion: { label: "Solución", color: "#10b981", icon: "✅" },
    prueba: { label: "Prueba", color: "#8b5cf6", icon: "◈" },
    oferta: { label: "Oferta", color: "#f97316", icon: "💰" },
    urgencia: { label: "Urgencia", color: "#ec4899", icon: "⏰" },
    cta: { label: "CTA", color: "#6366f1", icon: "→" },
};

export default function VSLModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [duration, setDuration] = useState("5-8 minutos");
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const generate = async () => {
        if (!product.trim() || !audience.trim()) { setError("Completá al menos producto y público."); return; }
        setError(""); setLoading(true); setResults(null);
        try {
            const res = await fetch("/api/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ module: "vsl", product, audience, objective, duration }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResults(data.sections);
        } catch { setError("Error al generar. Intentá de nuevo."); }
        finally { setLoading(false); }
    };

    const copySection = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
                <BriefForm product={product} setProduct={setProduct} audience={audience} setAudience={setAudience} objective={objective} setObjective={setObjective}>
                    <div>
                        <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">Duración del VSL</label>
                        <select value={duration} onChange={e => setDuration(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none">
                            <option value="3-5 minutos">Corto (3-5 min)</option>
                            <option value="5-8 minutos">Medio (5-8 min)</option>
                            <option value="10-15 minutos">Largo (10-15 min)</option>
                            <option value="20-30 minutos">Webinar (20-30 min)</option>
                        </select>
                    </div>
                </BriefForm>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} label="GENERAR GUIÓN VSL" />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">▶</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Guión de VSL</h2>
                        <p className="text-white/40 max-w-md">Video Sales Letter completo. Palabra por palabra, con timestamps, direcciones de cámara y transiciones.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Escribiendo tu guión de video de ventas..." />}
                {results && (
                    <div className="flex flex-col gap-4">
                        {results.map((section: any, i: number) => {
                            const meta = SECTION_META[section.section] || { label: section.section, color: "#6366f1", icon: "•" };
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    className="glassmorphism rounded-2xl overflow-hidden group">
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5" style={{ background: `${meta.color}08` }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base">{meta.icon}</span>
                                            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: meta.color }}>{meta.label}</span>
                                            {section.timestamp && <span className="text-[11px] text-white/25 font-mono bg-white/5 px-2 py-0.5 rounded">{section.timestamp}</span>}
                                            {section.title && <span className="text-xs text-white/30">— {section.title}</span>}
                                        </div>
                                        <button onClick={() => copySection(section.script, i)}
                                            className={`text-xs font-medium px-3 py-1 rounded-lg transition-all ${copiedIdx === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 opacity-0 group-hover:opacity-100"}`}>
                                            {copiedIdx === i ? "✓ Copiado" : "Copiar"}
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <pre className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">{section.script}</pre>
                                        {section.direction && (
                                            <div className="mt-3 text-xs text-indigo-400/60 italic bg-indigo-500/5 rounded-lg p-2 border border-indigo-500/10">
                                                🎬 {section.direction}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
