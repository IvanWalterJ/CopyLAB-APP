"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

const SECTION_COLORS: Record<string, { label: string; color: string; icon: string }> = {
    hero: { label: "Hero", color: "#8b5cf6", icon: "🎯" },
    problema: { label: "Problema", color: "#ef4444", icon: "⚡" },
    solucion: { label: "Solución", color: "#10b981", icon: "✅" },
    beneficios: { label: "Beneficios", color: "#3b82f6", icon: "★" },
    social_proof: { label: "Social Proof", color: "#f59e0b", icon: "◈" },
    oferta: { label: "Oferta", color: "#f97316", icon: "💰" },
    faq: { label: "FAQ", color: "#6366f1", icon: "?" },
    cta_final: { label: "CTA Final", color: "#ec4899", icon: "→" },
};

export default function LandingModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [landingType, setLandingType] = useState("Venta directa");
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
                body: JSON.stringify({ module: "landing", product, audience, objective, landingType }),
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
                        <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">Tipo de Landing</label>
                        <select value={landingType} onChange={e => setLandingType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none">
                            <option value="Venta directa">Venta Directa</option>
                            <option value="Captación de leads">Captación de Leads</option>
                            <option value="Webinar/Evento">Webinar / Evento</option>
                            <option value="Waitlist/Lanzamiento">Waitlist / Lanzamiento</option>
                            <option value="SaaS/App">SaaS / App</option>
                        </select>
                    </div>
                </BriefForm>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} label="GENERAR COPY DE LANDING" />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">◈</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Copy para Landing Pages</h2>
                        <p className="text-white/40 max-w-md">Generá el copy completo de tu página de venta. Hero, problema, solución, beneficios, testimonios, oferta, FAQ y CTA.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Escribiendo tu landing de alta conversión..." />}
                {results && (
                    <div className="flex flex-col gap-4">
                        {results.map((section: any, i: number) => {
                            const meta = SECTION_COLORS[section.section] || { label: section.section, color: "#6366f1", icon: "•" };
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    className="glassmorphism rounded-2xl overflow-hidden group">
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/5" style={{ background: `${meta.color}08` }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base">{meta.icon}</span>
                                            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: meta.color }}>{meta.label}</span>
                                            {section.title && <span className="text-xs text-white/30">— {section.title}</span>}
                                        </div>
                                        <button onClick={() => copySection(section.content, i)}
                                            className={`text-xs font-medium px-3 py-1 rounded-lg transition-all ${copiedIdx === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 opacity-0 group-hover:opacity-100"}`}>
                                            {copiedIdx === i ? "✓ Copiado" : "Copiar"}
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <pre className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap font-sans">{section.content}</pre>
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
