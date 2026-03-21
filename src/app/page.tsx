'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import {
  IconBolt, IconGrid, IconLayout, IconVideo, IconMail, IconMegaphone,
  IconUser, IconCoins, IconArrowRight, IconTrendingUp, IconSparkles,
  IconBarChart, IconCalendar, IconTrophy
} from '@/components/icons';

const modules = [
  {
    href: '/hooks', icon: IconBolt, label: 'Ganchos Irresistibles',
    description: 'Primeras líneas que paran el scroll y obligan a seguir leyendo.',
    color: 'from-brand-primary to-brand-secondary', badge: 'Más usado'
  },
  {
    href: '/matrix', icon: IconGrid, label: 'Ángulos de Persuasión',
    description: '7 enfoques distintos para vender el mismo producto.',
    color: 'from-purple-600 to-pink-500', badge: 'Estratégico'
  },
  {
    href: '/landing', icon: IconLayout, label: 'Página que Vende',
    description: 'Landing pages de 8 secciones diseñadas para convertir.',
    color: 'from-emerald-500 to-teal-500', badge: 'Alta conversión'
  },
  {
    href: '/vsl', icon: IconVideo, label: 'Guión VSL',
    description: 'Guiones de video de ventas con estructura y timestamps.',
    color: 'from-orange-500 to-red-500', badge: 'Video'
  },
  {
    href: '/email', icon: IconMail, label: 'Secuencia de Emails',
    description: 'Emails de lanzamiento y nurturing que convierten.',
    color: 'from-sky-500 to-indigo-500', badge: 'Secuencias'
  },
  {
    href: '/ads', icon: IconMegaphone, label: 'Anuncios en Redes',
    description: 'Copy creativo para Meta, TikTok y Google Ads.',
    color: 'from-amber-500 to-orange-500', badge: 'Ads'
  },
];

const moduleLabels: Record<string, string> = {
  hooks: 'Ganchos Irresistibles',
  matrix: 'Ángulos de Persuasión',
  landing: 'Página que Vende',
  vsl: 'Guión VSL',
  email: 'Secuencia de Emails',
  ads: 'Anuncios en Redes',
};

interface GenerationStats {
  totalCopys: number;
  copysThisWeek: number;
  mostUsedModule: string;
}

export default function Home() {
  const { activeBrand, credits, userEmail, userId, brands, isLoading } = useApp();
  const router = useRouter();
  const supabase = createClient();
  const remaining = credits ? credits.total_credits - credits.used_credits : null;
  const [stats, setStats] = useState<GenerationStats | null>(null);

  // Auto-redirect to onboarding if user has no brands
  useEffect(() => {
    if (!isLoading && userId && brands.length === 0) {
      router.replace('/onboarding');
    }
  }, [isLoading, userId, brands, router]);

  useEffect(() => {
    if (!userId) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from('generations')
        .select('module_type, created_at');

      if (!data) return;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const copysThisWeek = data.filter(g => new Date(g.created_at) >= oneWeekAgo).length;

      const moduleCounts: Record<string, number> = {};
      data.forEach(g => {
        moduleCounts[g.module_type] = (moduleCounts[g.module_type] || 0) + 1;
      });
      const mostUsedModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      setStats({ totalCopys: data.length, copysThisWeek, mostUsedModule });
    };
    fetchStats();
  }, [userId]);

  if (isLoading || (!isLoading && userId && brands.length === 0)) return null;
  const usedPct = credits ? Math.round((credits.used_credits / credits.total_credits) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl glass noise-bg border-border-glass p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/8 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconSparkles size={16} className="text-accent-amber" />
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
              <div className="bg-elevated/80 border border-border-glass rounded-xl p-4 min-w-[130px] text-center shadow-card">
                <IconCoins size={20} className="text-accent-amber mx-auto mb-1" />
                <p className="text-2xl font-black text-text-primary">{remaining ?? '--'}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Créditos</p>
                {credits && (
                  <div className="mt-2 w-full h-1 bg-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${usedPct > 80 ? 'bg-accent-red' : 'bg-accent-emerald'}`}
                      style={{ width: `${100 - usedPct}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Brand Card */}
              <div className="bg-elevated/80 border border-border-glass rounded-xl p-4 min-w-[130px] text-center shadow-card">
                <IconTrendingUp size={20} className="text-brand-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-text-primary truncate max-w-[100px] mx-auto">
                  {activeBrand?.name ?? 'Sin perfil'}
                </p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mt-0.5">Marca activa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="animate-fade-in">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Tu Actividad</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass border-border-glass rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <IconBarChart size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-xl font-black text-text-primary">{stats.totalCopys}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Copys generados</p>
              </div>
            </div>

            <div className="glass border-border-glass rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center flex-shrink-0">
                <IconCalendar size={18} className="text-accent-emerald" />
              </div>
              <div>
                <p className="text-xl font-black text-text-primary">{stats.copysThisWeek}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Esta semana</p>
              </div>
            </div>

            <div className="glass border-border-glass rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
                <IconTrophy size={18} className="text-accent-amber" />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary leading-tight">{stats.mostUsedModule ? (moduleLabels[stats.mostUsedModule] || stats.mostUsedModule) : '—'}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Módulo estrella</p>
              </div>
            </div>

            <div className="glass border-border-glass rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center flex-shrink-0">
                <IconCoins size={18} className="text-accent-red" />
              </div>
              <div>
                <p className="text-xl font-black text-text-primary">{credits?.used_credits ?? '—'}</p>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Créditos usados</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar CTA: if no brand */}
      {!activeBrand && (
        <Link href="/avatar" className="flex items-center justify-between p-5 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl hover:bg-brand-primary/15 transition-all group shadow-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center">
              <IconUser size={20} className="text-brand-primary" />
            </div>
            <div>
              <p className="font-bold text-brand-primary text-sm">Configura tu Avatar Estratégico</p>
              <p className="text-text-muted text-xs">Sin un perfil de marca, la IA genera copy genérico. Potencia todos los módulos en 3 minutos.</p>
            </div>
          </div>
          <IconArrowRight size={18} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Modules Grid */}
      <div>
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Módulos de Generación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ href, icon: Icon, label, description, color, badge }, i) => (
            <Link
              key={href}
              href={href}
              className="group relative glass border-border-glass rounded-2xl p-5 hover:border-brand-primary/40 transition-all overflow-hidden shadow-card hover:shadow-glow-indigo animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 blur-2xl rounded-full group-hover:opacity-15 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-elevated/80 border border-border-glass rounded-full text-text-muted">
                    {badge}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-sm mb-1 group-hover:text-brand-primary transition-colors">{label}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{description}</p>
                <div className="flex items-center gap-1 mt-3 text-text-muted group-hover:text-brand-primary transition-colors">
                  <span className="text-xs font-semibold">Generar ahora</span>
                  <IconArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
