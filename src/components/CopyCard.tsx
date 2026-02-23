"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export const ANGLES = [
    { id: "dolor", label: "Dolor", emoji: "⚡", accent: "#ef4444" },
    { id: "aspiracional", label: "Aspiracional", emoji: "✦", accent: "#8b5cf6" },
    { id: "social_proof", label: "Social Proof", emoji: "◈", accent: "#f59e0b" },
    { id: "curiosidad", label: "Curiosidad", emoji: "◎", accent: "#3b82f6" },
    { id: "urgencia", label: "Urgencia", emoji: "◷", accent: "#f97316" },
    { id: "educativo", label: "Educativo", emoji: "◆", accent: "#10b981" },
    { id: "identidad", label: "Identidad", emoji: "♡", accent: "#ec4899" },
];

export const FORMATS = [
    { id: "reel", label: "Reel", sub: "Hook + guión" },
    { id: "carrusel", label: "Carrusel", sub: "Slide por slide" },
    { id: "estatica", label: "Estática", sub: "Headline + copy" },
];

interface CopyCardProps {
    angle: string;
    format: string;
    content: string;
    isWinner: boolean;
    onToggleWinner: () => void;
}

export default function CopyCard({ angle, format, content, isWinner, onToggleWinner }: CopyCardProps) {
    const [copied, setCopied] = useState(false);
    const a = ANGLES.find((a) => a.id === angle) || ANGLES[0];

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`glassmorphism rounded-2xl p-5 ${isWinner
                    ? "border-amber-400/40 shadow-[0_4px_24px_rgba(0,0,0,0.2),0_0_0_1px_rgba(251,191,36,0.15)]"
                    : "border-white/5 shadow-2xl"
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                            backgroundColor: a.accent,
                            boxShadow: `0 0 8px ${a.accent}80`,
                        }}
                    />
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-white/40">
                        {a.label}
                    </span>
                    <span className="text-[11px] font-medium text-white/20 ml-2 border border-white/10 rounded px-2 py-0.5 bg-white/5">
                        {FORMATS.find(f => f.id === format)?.label}
                    </span>
                </div>
                <div className="flex gap-1.5 w-auto">
                    <button
                        onClick={onToggleWinner}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all border ${isWinner
                                ? "bg-amber-400/15 border-amber-400/30 text-amber-400"
                                : "bg-transparent border-white/10 text-white/30 hover:bg-white/5"
                            }`}
                    >
                        {isWinner ? "★ Ganador" : "☆ Marcar"}
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all border ${copied
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            }`}
                    >
                        {copied ? "✓ Copiado" : "Copiar"}
                    </button>
                </div>
            </div>
            <pre className="text-[13.5px] text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
                {content}
            </pre>
        </motion.div>
    );
}
