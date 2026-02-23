"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

const HOOK_TYPES: Record<string, { label: string; color: string }> = {
    pregunta: { label: "Pregunta", color: "#3b82f6" },
    dato: { label: "Dato Impactante", color: "#f59e0b" },
    confesion: { label: "Confesión", color: "#ec4899" },
    contrarian: { label: "Contrarian", color: "#ef4444" },
    curiosidad: { label: "Curiosidad", color: "#8b5cf6" },
    instruccion: { label: "Instrucción", color: "#10b981" },
    storytelling: { label: "Storytelling", color: "#f97316" },
};

export default function HooksModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [platform, setPlatform] = useState("Instagram/TikTok");
    const [hookCount, setHookCount] = useState(10);
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
                body: JSON.stringify({ module: "hooks", product, audience, objective, platform, hookCount }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResults(data.hooks);
        } catch { setError("Error al generar. Intentá de nuevo."); }
        finally { setLoading(false); }
    };

    const copyHook = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
                <BriefForm product={product} setProduct={setProduct} audience={audience} setAudience={setAudience} objective={objective} setObjective={setObjective}>
                    <div>
                        <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">Plataforma</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none">
                            <option value="Instagram/TikTok">Instagram / TikTok</option>
                            <option value="YouTube Shorts">YouTube Shorts</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter/X">Twitter / X</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">Cantidad de hooks</label>
                        <div className="flex gap-2">
                            {[5, 10, 15, 20].map(n => (
                                <button key={n} onClick={() => setHookCount(n)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${hookCount === n ? "bg-indigo-500/80 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </BriefForm>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} label={`GENERAR ${hookCount} HOOKS`} />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">⚡</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Generador de Hooks Virales</h2>
                        <p className="text-white/40 max-w-md">Creá hooks que detengan el scroll. Pregunta, dato, confesión, contrarian, curiosidad, instrucción y storytelling.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Generando hooks irresistibles..." />}
                {results && (
                    <div className="flex flex-col gap-3">
                        {results.map((hook: any, i: number) => {
                            const type = HOOK_TYPES[hook.type] || { label: hook.type, color: "#6366f1" };
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className="glassmorphism rounded-xl p-4 flex items-start gap-4 group hover:bg-white/[0.06] transition-all cursor-pointer"
                                    onClick={() => copyHook(hook.content, i)}>
                                    <div className="text-lg font-bold text-white/15 w-6 shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ background: `${type.color}20`, color: type.color }}>{type.label}</span>
                                        </div>
                                        <p className="text-sm text-white/85 leading-relaxed font-medium">{hook.content}</p>
                                        {hook.why && <p className="text-xs text-white/30 mt-2 italic">💡 {hook.why}</p>}
                                    </div>
                                    <div className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copiedIdx === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 opacity-0 group-hover:opacity-100"}`}>
                                        {copiedIdx === i ? "✓ Copiado" : "Copiar"}
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
