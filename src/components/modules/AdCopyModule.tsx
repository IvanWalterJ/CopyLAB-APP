"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

const APPROACH_META: Record<string, { label: string; color: string }> = {
    dolor_solucion: { label: "Dolor → Solución", color: "#ef4444" },
    beneficio: { label: "Beneficio Directo", color: "#10b981" },
    social_proof: { label: "Social Proof", color: "#f59e0b" },
    contrarian: { label: "Contrarian", color: "#8b5cf6" },
    storytelling: { label: "Storytelling", color: "#3b82f6" },
    urgencia: { label: "Urgencia", color: "#f97316" },
};

export default function AdCopyModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [platform, setPlatform] = useState("Meta Ads (Facebook/Instagram)");
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [expandedAd, setExpandedAd] = useState<number | null>(0);

    const generate = async () => {
        if (!product.trim() || !audience.trim()) { setError("Completá al menos producto y público."); return; }
        setError(""); setLoading(true); setResults(null);
        try {
            const res = await fetch("/api/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ module: "adcopy", product, audience, objective, platform }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResults(data.ads);
        } catch { setError("Error al generar. Intentá de nuevo."); }
        finally { setLoading(false); }
    };

    const copyAd = (ad: any, idx: number) => {
        const text = `PRIMARY TEXT:\n${ad.primary_long}\n\nHEADLINE: ${ad.headline}\nDESCRIPTION: ${ad.description}`;
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
                            <option value="Meta Ads (Facebook/Instagram)">Meta Ads (Facebook/IG)</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="TikTok Ads">TikTok Ads</option>
                            <option value="YouTube Ads">YouTube Ads</option>
                            <option value="LinkedIn Ads">LinkedIn Ads</option>
                        </select>
                    </div>
                </BriefForm>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} label="GENERAR 6 VARIANTES DE ADS" />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">◎</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Ad Copy Generator</h2>
                        <p className="text-white/40 max-w-md">6 variantes de ads con distintos enfoques: dolor, beneficio, social proof, contrarian, storytelling y urgencia. Listos para importar en tu Ad Manager.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Generando variantes de anuncios..." />}
                {results && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {results.map((ad: any, i: number) => {
                            const meta = APPROACH_META[ad.approach] || { label: ad.label || ad.approach, color: "#6366f1" };
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    className="glassmorphism rounded-2xl overflow-hidden group">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                        <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ background: `${meta.color}15`, color: meta.color }}>
                                            {meta.label}
                                        </span>
                                        <button onClick={() => copyAd(ad, i)}
                                            className={`text-xs font-medium px-3 py-1 rounded-lg transition-all ${copiedIdx === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 opacity-0 group-hover:opacity-100"}`}>
                                            {copiedIdx === i ? "✓ Copiado" : "Copiar todo"}
                                        </button>
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        {/* Ad preview */}
                                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                                            <p className="text-sm text-white/80 leading-relaxed mb-3">{ad.primary_short}</p>
                                            <div className="border-t border-white/5 pt-3 flex flex-col gap-1">
                                                <div className="text-sm font-bold text-white/90">{ad.headline}</div>
                                                <div className="text-xs text-white/40">{ad.description}</div>
                                            </div>
                                        </div>
                                        {/* Long version */}
                                        <details className="group/detail">
                                            <summary className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 font-medium">Ver versión larga ▾</summary>
                                            <div className="mt-2 bg-white/[0.02] rounded-xl p-3">
                                                <pre className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap font-sans">{ad.primary_long}</pre>
                                            </div>
                                        </details>
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
