'use client';

import Link from 'next/link';
import { useApp } from '@/lib/context';
import {
  Zap, Grid3X3, FileText, Video, Mail, Megaphone,
  UserCircle2, Coins, ArrowRight, TrendingUp, Sparkles
} from 'lucide-react';

const modules = [
  {
    href: '/hooks', icon: Zap, label: 'Frenos de Scroll',
    description: 'Hooks virales que paran el scroll al instante.',
    color: 'from-brand-primary to-brand-secondary', badge: 'Más usado'
  },
  {
    href: '/matrix', icon: Grid3X3, label: 'Matriz Multi-Ángulo',
    description: 'Explora 7 ángulos distintos para el mismo producto.',
    color: 'from-purple-600 to-pink-500', badge: 'Estratégico'
  },
  {
    href: '/landing', icon: FileText, label: 'Landing Architect',
    description: 'Páginas de conversión de 8 secciones completas.',
    color: 'from-emerald-500 to-teal-500', badge: 'Alta conversión'
  },
  {
    href: '/vsl', icon: Video, label: 'Cinema VSL',
    description: 'Guiones de video para ventas con timestamps.',
    color: 'from-orange-500 to-red-500', badge: 'Video'
  },
  {
    href: '/email', icon: Mail, label: 'Email Architect',
    description: 'Secuencias de lanzamiento y nutrición que convierten.',
    color: 'from-sky-500 to-indigo-500', badge: 'Secuencias'
  },
  {
    href: '/ads', icon: Megaphone, label: 'Ad-Spec Ops',
    description: 'Copy y briefs creativos para Meta, TikTok, Google.',
    color: 'from-amber-500 to-orange-500', badge: 'Ads'
  },
];

export default function Home() {
  const { activeBrand, credits, userEmail } = useApp();
  const remaining = credits ? credits.total_credits - credits.used_credits : null;
  const usedPct = credits ? Math.round((credits.used_credits / credits.total_credits) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border-subtle p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-accent-amber" />
                <span className="text-xs font-semibold text-accent-amber uppercase tracking-widest">Sistema Operativo de Copywriting</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-inter text-text-primary mb-2">
                Bienvenido a CopyLab
                {userEmail && <span className="text-brand-primary">, {userEmail.split('@')[0]}</span>}
              </h1>
              <p className="text-text-secondary text-sm max-w-lg">
                El motor de respuesta directa más inteligente del mercado hispanohablante.
                Powered by <span className="text-brand-primary font-semibold">Eugene Schwartz + Gemini AI</span>.
              </p>
            </div>

            {/* Status cards */}
            <div className="flex gap-3 flex-shrink-0">
              {/* Credits Card */}
              <div className="bg-elevated border border-border-subtle rounded-xl p-4 min-w-[130px] text-center">
                <Coins size={20} className="text-accent-amber mx-auto mb-1" />
                <p className="text-2xl font-black text-text-primary">{remaining ?? '--'}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Créditos</p>
                {credits && (
                  <div className="mt-2 w-full h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usedPct > 80 ? 'bg-accent-red' : 'bg-accent-emerald'}`}
                      style={{ width: `${100 - usedPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Brand Card */}
              <div className="bg-elevated border border-border-subtle rounded-xl p-4 min-w-[130px] text-center">
                <TrendingUp size={20} className="text-brand-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-text-primary truncate max-w-[100px] mx-auto">
                  {activeBrand?.name ?? 'Sin perfil'}
                </p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Marca activa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar CTA: if no brand */}
      {!activeBrand && (
        <Link href="/avatar" className="flex items-center justify-between p-5 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl hover:bg-brand-primary/15 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center">
              <UserCircle2 size={20} className="text-brand-primary" />
            </div>
            <div>
              <p className="font-bold text-brand-primary text-sm">Configura tu Avatar Estratégico</p>
              <p className="text-text-muted text-xs">Sin un perfil de marca, la IA genera copy genérico. Potencia todos los módulos en 3 minutos.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Modules Grid */}
      <div>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Módulos de Generación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ href, icon: Icon, label, description, color, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative bg-surface border border-border-subtle rounded-2xl p-5 hover:border-brand-primary/50 hover:bg-surface/80 transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-elevated border border-border-subtle rounded-full text-text-muted">
                    {badge}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-sm mb-1 group-hover:text-brand-primary transition-colors">{label}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{description}</p>
                <div className="flex items-center gap-1 mt-3 text-text-muted group-hover:text-brand-primary transition-colors">
                  <span className="text-xs font-semibold">Generar ahora</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
