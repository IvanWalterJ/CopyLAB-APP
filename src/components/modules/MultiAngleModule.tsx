"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CopyCard, { ANGLES, FORMATS } from "@/components/CopyCard";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

export default function MultiAngleModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [selectedFormats, setSelectedFormats] = useState(["reel", "carrusel", "estatica"]);
    const [selectedAngles, setSelectedAngles] = useState(ANGLES.map(a => a.id));
    const [mode, setMode] = useState("organico");
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [winners, setWinners] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState("reel");
    const [error, setError] = useState("");

    const toggleFormat = (id: string) => setSelectedFormats(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
    const toggleAngle = (id: string) => setSelectedAngles(p => p.includes(id) ? p.filter(a => a !== id) : [...p, id]);
    const toggleWinner = (key: string) => setWinners(p => ({ ...p, [key]: !p[key] }));
    const winnerCount = Object.values(winners).filter(Boolean).length;

    const generate = async () => {
        if (!product.trim() || !audience.trim() || !objective.trim()) { setError("Completá los tres campos."); return; }
        if (!selectedAngles.length || !selectedFormats.length) { setError("Elegí al menos un ángulo y un formato."); return; }
        setError(""); setLoading(true); setResults(null); setWinners({});
        try {
            const res = await fetch("/api/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ module: "multi_angle", product, audience, objective, mode, selectedFormats, selectedAngles }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResults(data.copies);
            setActiveTab(selectedFormats[0] || "reel");
        } catch { setError("Error al generar. Intentá de nuevo."); }
        finally { setLoading(false); }
    };

    const visibleFormats = FORMATS.filter(f => selectedFormats.includes(f.id));
    const tabList = results
        ? [...visibleFormats.map(f => ({ id: f.id, label: f.label })), ...(winnerCount > 0 ? [{ id: "winners", label: `★ ${winnerCount}` }] : [])]
        : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Mode */}
                <div className="glassmorphism rounded-2xl p-5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Modo</h2>
                    <div className="flex bg-black/40 p-1 rounded-xl">
                        {[{ id: "organico", label: "Orgánico" }, { id: "ads", label: "Ads" }].map(m => (
                            <button key={m.id} onClick={() => setMode(m.id)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m.id ? "bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30" : "text-white/40"}`}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <BriefForm product={product} setProduct={setProduct} audience={audience} setAudience={setAudience} objective={objective} setObjective={setObjective} />

                {/* Formats & Angles */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glassmorphism rounded-2xl p-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Formatos</h2>
                        <div className="flex flex-col gap-2">
                            {FORMATS.map(f => {
                                const sel = selectedFormats.includes(f.id);
                                return (
                                    <button key={f.id} onClick={() => toggleFormat(f.id)}
                                        className={`flex justify-between items-center p-2 rounded-xl border transition-all ${sel ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/5 hover:bg-white/5"}`}>
                                        <span className={`text-sm font-medium ${sel ? "text-white/90" : "text-white/40"}`}>{f.label}</span>
                                        {sel && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="glassmorphism rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Ángulos</h2>
                            <button onClick={() => setSelectedAngles(selectedAngles.length === ANGLES.length ? [] : ANGLES.map(a => a.id))}
                                className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">{selectedAngles.length === ANGLES.length ? "Ninguno" : "Todos"}</button>
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                            {ANGLES.map(a => {
                                const sel = selectedAngles.includes(a.id);
                                return (
                                    <button key={a.id} onClick={() => toggleAngle(a.id)}
                                        className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${sel ? "bg-white/5" : "hover:bg-white/[0.02]"}`}>
                                        <div className="w-2 h-2 rounded-full shrink-0 transition-all" style={{ backgroundColor: sel ? a.accent : "rgba(255,255,255,0.1)", boxShadow: sel ? `0 0 8px ${a.accent}60` : "none" }} />
                                        <span className={`text-[13px] font-medium ${sel ? "text-white/80" : "text-white/30"}`}>{a.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} count={selectedAngles.length * selectedFormats.length} label={`GENERAR ${selectedAngles.length * selectedFormats.length} PIEZAS`} />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">✦</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Copy Multi-Ángulo</h2>
                        <p className="text-white/40 max-w-md">Generá copys para reels, carruseles y estáticas usando 7 ángulos de venta distintos. Ideal para testeo A/B.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Escribiendo variantes multi-ángulo..." />}
                {results && (
                    <div className="flex flex-col gap-5">
                        <div className="flex gap-2 p-1.5 bg-black/30 rounded-xl w-fit border border-white/5">
                            {tabList.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id
                                        ? (t.id === "winners" ? "bg-amber-400 text-black shadow-lg" : "bg-indigo-500 text-white shadow-lg")
                                        : "text-white/40 hover:text-white/70"}`}>{t.label}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-10">
                            {(activeTab === "winners"
                                ? results.filter(r => winners[`${r.angle}-${r.format}`])
                                : results.filter(r => r.format === activeTab)
                            ).map((r, i) => (
                                <CopyCard key={`${r.angle}-${r.format}-${i}`} {...r}
                                    isWinner={winners[`${r.angle}-${r.format}`] || false}
                                    onToggleWinner={() => toggleWinner(`${r.angle}-${r.format}`)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
