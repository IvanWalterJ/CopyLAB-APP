'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  IconDashboard, IconBolt, IconMegaphone, IconLayout, IconVideo,
  IconMail, IconGrid, IconDocument, IconStar, IconUser,
  IconSettings, IconLogout, IconChevronRight, IconCoins, IconCalendar
} from '@/components/icons';

const generatorModules = [
  { href: '/', icon: IconDashboard, label: 'Dashboard' },
  { href: '/hooks', icon: IconBolt, label: 'Ganchos Irresistibles' },
  { href: '/ads', icon: IconMegaphone, label: 'Anuncios en Redes' },
  { href: '/landing', icon: IconLayout, label: 'Página que Vende' },
  { href: '/vsl', icon: IconVideo, label: 'Guión VSL' },
  { href: '/email', icon: IconMail, label: 'Secuencia de Emails' },
  { href: '/matrix', icon: IconGrid, label: 'Ángulos de Persuasión' },
];

const libraryModules = [
  { href: '/calendar', icon: IconCalendar, label: 'Canvas de Contenido' },
  { href: '/history', icon: IconDocument, label: 'Mis Copys' },
  { href: '/swipe', icon: IconStar, label: 'Banco de Inspiración' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { credits, userEmail } = useApp();
  const router = useRouter();
  const supabase = createClient();

  const remainingCredits = credits ? credits.total_credits - credits.used_credits : null;
  const creditPct = credits ? Math.max(0, Math.min(100, (remainingCredits! / credits.total_credits) * 100)) : 0;
  const creditColor = creditPct > 50 ? 'bg-accent-emerald' : creditPct > 20 ? 'bg-accent-amber' : 'bg-accent-red';
  const creditGlow = creditPct <= 20 ? 'animate-glow-pulse' : '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const renderNavItem = ({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        className={`group flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-brand-primary/10 text-brand-primary font-semibold border-l-2 border-brand-primary shadow-glow-indigo/30 ml-0'
            : 'text-text-secondary hover:text-text-primary hover:bg-elevated/80 hover:translate-x-0.5 border-l-2 border-transparent'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          isActive ? 'bg-brand-primary/15' : 'bg-transparent group-hover:bg-elevated'
        }`}>
          <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
        </div>
        <span className="truncate">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />}
      </Link>
    );
  };

  return (
    <aside className="w-64 glass noise-bg relative bg-surface/90 border-r border-border-glass h-screen sticky top-0 flex flex-col hidden md:flex flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-subtle relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-glow-indigo flex-shrink-0 animate-glow-pulse">
            <Image src="/logo.jpg" alt="CopyLab" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black font-inter text-text-primary leading-tight">CopyLab</h1>
            <span className="text-[10px] text-text-muted font-semibold tracking-widest uppercase">v2.0 · OS</span>
          </div>
        </div>
      </div>

      {/* Avatar Link */}
      <div className="px-3 py-3 border-b border-border-subtle relative z-10">
        <Link
          href="/avatar"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 ${
            pathname === '/avatar'
              ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary shadow-glow-indigo/20'
              : 'border-border-glass hover:border-brand-primary/20 hover:bg-elevated/80 text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            pathname === '/avatar' ? 'bg-brand-primary/15' : 'bg-gradient-brand-subtle'
          }`}>
            <IconUser size={17} />
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold block">Avatar Builder</span>
            <p className="text-[10px] text-text-muted">Knowledge Base</p>
          </div>
          <IconChevronRight size={14} className="opacity-40" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scroll space-y-0.5 relative z-10">
        {/* Generadores */}
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Generadores</p>
        {generatorModules.map(renderNavItem)}

        {/* Separator */}
        <div className="pt-4 pb-1">
          <div className="border-t border-border-subtle mx-2" />
        </div>

        {/* Biblioteca */}
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2 pt-1">Planificación</p>
        {libraryModules.map(renderNavItem)}
      </nav>

      {/* Credits */}
      {credits !== null && (
        <div className={`px-4 py-3 mx-3 mb-2 bg-elevated/80 rounded-xl border border-border-glass relative z-10 ${creditGlow}`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <IconCoins size={13} className="text-accent-amber" />
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Créditos</span>
            </div>
            <span className={`text-[11px] font-black ${remainingCredits === 0 ? 'text-accent-red' : 'text-text-primary'}`}>
              {remainingCredits} / {credits.total_credits}
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${creditColor}`} style={{ width: `${creditPct}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border-subtle space-y-0.5 relative z-10">
        <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${pathname === '/settings' ? 'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary hover:bg-elevated/80 border-l-2 border-transparent'}`}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center">
            <IconSettings size={16} />
          </div>
          <span>Configuración</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 text-text-secondary hover:text-accent-red hover:bg-accent-red/5 border-l-2 border-transparent"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center">
            <IconLogout size={16} />
          </div>
          <div className="flex-1 text-left">
            <span className="block">Cerrar Sesión</span>
            {userEmail && <span className="text-[10px] text-text-muted truncate block">{userEmail}</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
