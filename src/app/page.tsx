"use client";
import { useState, useEffect } from "react";
import CopyCard, { ANGLES, FORMATS } from "@/components/CopyCard";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [selectedFormats, setSelectedFormats] = useState(["reel", "carrusel", "estatica"]);
    const [selectedAngles, setSelectedAngles] = useState(ANGLES.map(a => a.id));
    const [mode, setMode] = useState("organico");
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [winners, setWinners] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<string>("reel");
    const [error, setError] = useState("");
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        try {
            const r = localStorage.getItem("copy_history_v2");
            if (r) setHistory(JSON.parse(r));
        } catch { }
    };

    const saveHistory = (entry: any) => {
        try {
            const updated = [entry, ...history].slice(0, 10);
            setHistory(updated);
            localStorage.setItem("copy_history_v2", JSON.stringify(updated));
        } catch { }
    };

    const toggleFormat = (id: string) => setSelectedFormats(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);
    const toggleAngle = (id: string) => setSelectedAngles(p => p.includes(id) ? p.filter(a => a !== id) : [...p, id]);
    const toggleWinner = (key: string) => setWinners(p => ({ ...p, [key]: !p[key] }));
    const winnerCount = Object.values(winners).filter(Boolean).length;

    const generate = async () => {
        if (!product.trim() || !audience.trim() || !objective.trim()) {
            setError("Completá los tres campos del brief para continuar.");
            return;
        }
        if (!selectedAngles.length || !selectedFormats.length) {
            setError("Elegí al menos un ángulo y un formato.");
            return;
        }
        setError("");
        setLoading(true);
        setResults(null);
        setWinners({});

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product, audience, objective, mode, selectedFormats, selectedAngles }),
            });
            if (!res.ok) throw new Error("API Route failed");
            const data = await res.json();
            setResults(data.copies);
            setActiveTab(selectedFormats[0] || "reel");
            saveHistory({
                id: Date.now(), product, audience, objective, mode, copies: data.copies, date: new Date().toLocaleDateString("es-AR")
            });
        } catch (e) {
            setError("Algo salió mal al conectar con la IA. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const visibleFormats = FORMATS.filter(f => selectedFormats.includes(f.id));
    const tabList = results
        ? [...visibleFormats.map(f => ({ id: f.id, label: f.label })), ...(winnerCount > 0 ? [{ id: "winners", label: `★ Ganadores (${winnerCount})` }] : [])]
        : [];

    return (
        <div className="min-h-screen flex flex-col items-center max-w-7xl mx-auto px-4 w-full">
            {/* Top Navigation Bar */}
            <nav className="w-full flex justify-between items-center py-6 border-b border-white/10 mt-2 mb-8 glassmorphism px-8 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
                        ✦
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Copy AI</h1>
                        <p className="text-xs text-white/40 tracking-wider font-medium">PARA CREATORS & AGENCIAS</p>
                    </div>
                </div>
                {winnerCount > 0 && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm px-4 py-1.5 rounded-full font-medium flex items-center gap-2">
                        ★ {winnerCount} ganador{winnerCount > 1 ? "es" : ""}
                    </motion.div>
                )}
            </nav>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Sidebar Configuration */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    <div className="glassmorphism rounded-2xl p-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Modo de Copys</h2>
                        <div className="flex bg-black/40 p-1 rounded-xl">
                            {[
                                { id: "organico", label: "Contenido Orgánico" },
                                { id: "ads", label: "Anuncios (ADS)" }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m.id ? "bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30" : "text-white/40 hover:text-white/60"
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glassmorphism rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Brief del Cliente</h2>
                        {[
                            { key: "product", label: "Producto o servicio", val: product, set: setProduct, ph: "Ej: Coaching 1 a 1 para emprendedores" },
                            { key: "audience", label: "Público objetivo y dolor", val: audience, set: setAudience, ph: "Ej: Dueños de agencia que no tienen tiempo" },
                            { key: "objective", label: "Objetivo de negocio", val: objective, set: setObjective, ph: "Ej: Agendar una llamada de calificación" },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-xs text-indigo-300 font-medium mb-1.5 block">{f.label}</label>
                                <textarea
                                    rows={2}
                                    value={f.val}
                                    onChange={e => f.set(e.target.value)}
                                    placeholder={f.ph}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glassmorphism rounded-2xl p-5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Formatos</h2>
                            <div className="flex flex-col gap-2">
                                {FORMATS.map(f => {
                                    const sel = selectedFormats.includes(f.id);
                                    return (
                                        <button
                                            key={f.id}
                                            onClick={() => toggleFormat(f.id)}
                                            className={`flex justify-between items-center p-2.5 rounded-xl border text-left transition-all ${sel ? "border-indigo-500/40 bg-indigo-500/10" : "border-white/5 bg-transparent hover:bg-white/5"
                                                }`}
                                        >
                                            <span className={`text-sm font-medium ${sel ? "text-white/90" : "text-white/40"}`}>{f.label}</span>
                                            {sel && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glassmorphism rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Ángulos</h2>
                                <button
                                    onClick={() => setSelectedAngles(selectedAngles.length === ANGLES.length ? [] : ANGLES.map(a => a.id))}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-widest uppercase transition-colors"
                                >
                                    {selectedAngles.length === ANGLES.length ? "Ninguno" : "Todos"}
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 h-[200px] overflow-y-auto pr-1">
                                {ANGLES.map(a => {
                                    const sel = selectedAngles.includes(a.id);
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => toggleAngle(a.id)}
                                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${sel ? "bg-white/5 border border-white/5" : "border border-transparent hover:bg-white/[0.02]"
                                                }`}
                                        >
                                            <div className="w-2 h-2 rounded-full shrink-0 transition-all" style={{ backgroundColor: sel ? a.accent : "rgba(255,255,255,0.1)", boxShadow: sel ? `0 0 8px ${a.accent}60` : "none" }} />
                                            <span className={`text-[13px] font-medium ${sel ? "text-white/80" : "text-white/30"}`}>{a.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={generate}
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all ${loading
                                ? "bg-indigo-500/30 text-white/50 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? "GENERANDO TEXTOS..." : `GENERAR ${Math.max(1, selectedAngles.length * selectedFormats.length)} VARIANTES CON IA`}
                    </button>
                </div>

                {/* Main Display Area */}
                <div className="lg:col-span-8 flex flex-col">
                    {!results && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 glassmorphism rounded-3xl mt-2 border-dashed border-2 px-8 py-20 border-white/10">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl mb-6 text-indigo-400">
                                ✦
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Lienzo en Blanco</h2>
                            <p className="text-white/40 max-w-md leading-relaxed mb-8">
                                Ingresá el brief de tu cliente a la izquierda. Analizaremos audiencias complejas y generaremos copys utilizando matrices de ángulos ganadores (dolor, urgencia, identidad, etc).
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center max-w-md">
                                {["Reels", "Carruseles", "Ads Pagados", "Testeo A/B", "Venta Directa", "Engagement"].map(t => (
                                    <div key={t} className="bg-white/5 border border-white/5 rounded-full px-4 py-1.5 text-xs font-medium text-white/30">
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-500/20">
                                ✦
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-2">Procesando Estrategia</h3>
                            <p className="text-white/40">Conectando ángulos cognitivos y escribiendo...</p>
                        </div>
                    )}

                    {results && (
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-2 p-1.5 bg-black/30 rounded-xl w-fit xl:overflow-visible overflow-x-auto border border-white/5">
                                {tabList.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id
                                                ? (t.id === "winners" ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20")
                                                : "text-white/40 hover:text-white/80"
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="text-xs font-semibold tracking-widest uppercase text-white/30">
                                {activeTab === "winners"
                                    ? `${winnerCount} ganadores seleccionados listos para exportar`
                                    : `${results.filter(r => r.format === activeTab).length} piezas de contenido · Modo ${mode === "ads" ? "Anuncios Pagados" : "Orgánico"}`}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                                {(activeTab === "winners"
                                    ? results.filter(r => winners[`${r.angle}-${r.format}`])
                                    : results.filter(r => r.format === activeTab)
                                ).map((r, i) => (
                                    <CopyCard
                                        key={`${r.angle}-${r.format}-${i}`}
                                        {...r}
                                        isWinner={winners[`${r.angle}-${r.format}`] || false}
                                        onToggleWinner={() => toggleWinner(`${r.angle}-${r.format}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
