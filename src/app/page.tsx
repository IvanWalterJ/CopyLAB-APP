"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── MODULES ─────────────────────
import MultiAngleModule from "@/components/modules/MultiAngleModule";
import HooksModule from "@/components/modules/HooksModule";
import LandingModule from "@/components/modules/LandingModule";
import VSLModule from "@/components/modules/VSLModule";
import EmailModule from "@/components/modules/EmailModule";
import AdCopyModule from "@/components/modules/AdCopyModule";

const MODULES = [
    { id: "hooks", label: "Hooks Virales", icon: "⚡", desc: "Hooks que detienen el scroll", accent: "#f59e0b" },
    { id: "multi_angle", label: "Copy Multi-Ángulo", icon: "✦", desc: "Reels, carruseles, estáticas", accent: "#8b5cf6" },
    { id: "landing", label: "Landing Pages", icon: "◈", desc: "Copy de venta completo", accent: "#3b82f6" },
    { id: "vsl", label: "Guión VSL", icon: "▶", desc: "Video Sales Letter", accent: "#ef4444" },
    { id: "email", label: "Email Sequences", icon: "✉", desc: "Secuencias de nurturing", accent: "#10b981" },
    { id: "adcopy", label: "Ad Copy", icon: "◎", desc: "Facebook, IG, TikTok Ads", accent: "#f97316" },
];

export default function App() {
    const [activeModule, setActiveModule] = useState("hooks");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const currentModule = MODULES.find(m => m.id === activeModule)!;

    const renderModule = () => {
        switch (activeModule) {
            case "hooks": return <HooksModule />;
            case "multi_angle": return <MultiAngleModule />;
            case "landing": return <LandingModule />;
            case "vsl": return <VSLModule />;
            case "email": return <EmailModule />;
            case "adcopy": return <AdCopyModule />;
            default: return <MultiAngleModule />;
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0a0f] text-white font-sans">
            {/* ═══ SIDEBAR ═══ */}
            <motion.aside
                animate={{ width: sidebarCollapsed ? 72 : 260 }}
                transition={{ duration: 0.2 }}
                className="h-screen sticky top-0 flex flex-col border-r border-white/[0.06] bg-[#0c0c14]/80 backdrop-blur-xl z-20"
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25 shrink-0">
                        ✦
                    </div>
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                                <div className="text-sm font-bold text-white tracking-tight">CopyAI Studio</div>
                                <div className="text-[10px] text-white/30 font-medium tracking-wider uppercase">Pro Suite</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Module List */}
                <div className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
                    <div className={`px-2 mb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-white/20 ${sidebarCollapsed ? "text-center" : ""}`}>
                        {sidebarCollapsed ? "•••" : "Módulos"}
                    </div>
                    {MODULES.map(m => {
                        const isActive = activeModule === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setActiveModule(m.id)}
                                className={`group flex items-center gap-3 w-full rounded-xl transition-all duration-200 ${sidebarCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
                                    } ${isActive
                                        ? "bg-white/[0.08] shadow-lg"
                                        : "hover:bg-white/[0.04]"
                                    }`}
                                title={sidebarCollapsed ? m.label : undefined}
                            >
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all ${isActive ? "shadow-lg" : "opacity-50 group-hover:opacity-80"
                                        }`}
                                    style={{
                                        background: isActive ? `${m.accent}20` : "rgba(255,255,255,0.04)",
                                        color: isActive ? m.accent : "rgba(255,255,255,0.5)",
                                        boxShadow: isActive ? `0 0 20px ${m.accent}15` : "none",
                                    }}
                                >
                                    {m.icon}
                                </div>
                                <AnimatePresence>
                                    {!sidebarCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-left min-w-0"
                                        >
                                            <div className={`text-[13px] font-semibold truncate ${isActive ? "text-white" : "text-white/50 group-hover:text-white/70"}`}>
                                                {m.label}
                                            </div>
                                            <div className="text-[10px] text-white/25 truncate">{m.desc}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {!sidebarCollapsed && isActive && (
                                    <div className="ml-auto w-1.5 h-5 rounded-full shrink-0" style={{ background: m.accent, boxShadow: `0 0 10px ${m.accent}60` }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Collapse Toggle */}
                <div className="px-3 py-3 border-t border-white/[0.06]">
                    <button
                        onClick={() => setSidebarCollapsed(v => !v)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all text-xs"
                    >
                        {sidebarCollapsed ? "»" : "« Colapsar"}
                    </button>
                </div>
            </motion.aside>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 min-h-screen overflow-y-auto">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: currentModule.accent, boxShadow: `0 0 10px ${currentModule.accent}80` }} />
                        <h1 className="text-lg font-bold text-white">{currentModule.label}</h1>
                        <span className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-0.5 bg-white/[0.03]">{currentModule.desc}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-white/20 tracking-wider uppercase font-medium">Powered by Gemini AI</div>
                    </div>
                </div>

                {/* Module Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeModule}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderModule()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
