"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BriefForm, GenerateButton, ErrorMessage, LoadingSpinner } from "@/components/SharedUI";

export default function EmailModule() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [objective, setObjective] = useState("");
    const [sequenceLength, setSequenceLength] = useState(5);
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const generate = async () => {
        if (!product.trim() || !audience.trim()) { setError("Completá al menos producto y público."); return; }
        setError(""); setLoading(true); setResults(null);
        try {
            const res = await fetch("/api/generate", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ module: "email", product, audience, objective, sequenceLength }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setResults(data.emails);
        } catch { setError("Error al generar. Intentá de nuevo."); }
        finally { setLoading(false); }
    };

    const copyEmail = (email: any, idx: number) => {
        const text = `Subject: ${email.subject}\nPreview: ${email.preview}\n\n${email.body}\n\n[CTA]: ${email.cta}`;
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 flex flex-col gap-6">
                <BriefForm product={product} setProduct={setProduct} audience={audience} setAudience={setAudience} objective={objective} setObjective={setObjective}>
                    <div>
                        <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">Emails en la secuencia</label>
                        <div className="flex gap-2">
                            {[3, 5, 7, 10].map(n => (
                                <button key={n} onClick={() => setSequenceLength(n)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${sequenceLength === n ? "bg-indigo-500/80 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </BriefForm>
                <ErrorMessage error={error} />
                <GenerateButton onClick={generate} loading={loading} label={`GENERAR ${sequenceLength} EMAILS`} />
            </div>

            <div className="lg:col-span-8">
                {!results && !loading && (
                    <div className="flex flex-col items-center justify-center text-center glassmorphism rounded-3xl border-dashed border-2 border-white/10 py-20 px-8">
                        <div className="text-5xl mb-6">✉</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Secuencias de Email</h2>
                        <p className="text-white/40 max-w-md">Secuencias completas de email marketing. Subject lines A/B, preview text, body y CTAs listos para copiar.</p>
                    </div>
                )}
                {loading && <LoadingSpinner label="Escribiendo tu secuencia de emails..." />}
                {results && (
                    <div className="flex flex-col gap-3">
                        {results.map((email: any, i: number) => {
                            const isExpanded = expandedEmail === i;
                            return (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                    className="glassmorphism rounded-2xl overflow-hidden">
                                    <button onClick={() => setExpandedEmail(isExpanded ? null : i)}
                                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                                            {email.number || i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-white/90 truncate">{email.subject}</div>
                                            <div className="text-xs text-white/30 truncate mt-0.5">{email.preview}</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); copyEmail(email, i); }}
                                                className={`text-xs font-medium px-3 py-1 rounded-lg transition-all ${copiedIdx === i ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 hover:bg-white/10"}`}>
                                                {copiedIdx === i ? "✓ Copiado" : "Copiar"}
                                            </button>
                                            <span className="text-white/20 text-lg">{isExpanded ? "−" : "+"}</span>
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-white/5">
                                            <div className="p-5 flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <div className="flex-1 bg-white/[0.03] rounded-xl p-3">
                                                        <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">Subject A</div>
                                                        <div className="text-sm text-white/80">{email.subject}</div>
                                                    </div>
                                                    {email.subject_ab && (
                                                        <div className="flex-1 bg-white/[0.03] rounded-xl p-3">
                                                            <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold mb-1">Subject B</div>
                                                            <div className="text-sm text-white/80">{email.subject_ab}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <pre className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap font-sans bg-white/[0.02] rounded-xl p-4">{email.body}</pre>
                                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-sm text-indigo-300">
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400/60 block mb-1">CTA</span>
                                                    {email.cta}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
