"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BriefFormProps {
    product: string; setProduct: (v: string) => void;
    audience: string; setAudience: (v: string) => void;
    objective: string; setObjective: (v: string) => void;
    children?: React.ReactNode;
}

export function BriefForm({ product, setProduct, audience, setAudience, objective, setObjective, children }: BriefFormProps) {
    const fields = [
        { key: "product", label: "Producto / Servicio", val: product, set: setProduct, ph: "Ej: Coaching 1 a 1 para emprendedores" },
        { key: "audience", label: "Público objetivo", val: audience, set: setAudience, ph: "Ej: Dueños de agencia que no tienen tiempo" },
        { key: "objective", label: "Objetivo", val: objective, set: setObjective, ph: "Ej: Agendar una llamada de calificación" },
    ];
    return (
        <div className="glassmorphism rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Brief</h2>
            {fields.map(f => (
                <div key={f.key}>
                    <label className="text-xs text-indigo-300/80 font-medium mb-1.5 block">{f.label}</label>
                    <textarea rows={2} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none" />
                </div>
            ))}
            {children}
        </div>
    );
}

export function GenerateButton({ onClick, loading, label, count }: { onClick: () => void; loading: boolean; label?: string; count?: number }) {
    return (
        <button onClick={onClick} disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all ${loading
                ? "bg-indigo-500/30 text-white/50 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:scale-[1.02]"
                }`}>
            {loading ? "GENERANDO..." : label || `GENERAR ${count || ""} CON IA`}
        </button>
    );
}

export function ErrorMessage({ error }: { error: string }) {
    return (
        <AnimatePresence>
            {error && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                    {error}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function LoadingSpinner({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-500/20">
                ✦
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-2">Generando con IA</h3>
            <p className="text-white/40 text-sm">{label || "Procesando tu brief..."}</p>
        </div>
    );
}

export function ResultCard({ children, accent }: { children: React.ReactNode; accent?: string }) {
    const [copied, setCopied] = useState(false);
    const copyAll = () => {
        const el = document.createElement("div");
        el.innerHTML = (children as any)?.toString() || "";
        navigator.clipboard.writeText(el.textContent || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
            className="glassmorphism rounded-2xl p-5 border-white/5 shadow-2xl">
            {children}
        </motion.div>
    );
}
