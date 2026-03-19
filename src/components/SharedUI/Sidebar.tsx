'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Zap, Grid3X3, FileText, Video,
  Mail, Megaphone, UserCircle2, Settings, LogOut,
  ChevronRight, Coins, Star
} from 'lucide-react';

const modules = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/hooks', icon: Zap, label: 'Frenos de Scroll' },
  { href: '/history', icon: FileText, label: 'Historial de Copys' },
  { href: '/swipe', icon: Star, label: 'Swipe File' },
  { href: '/matrix', icon: Grid3X3, label: 'Matriz Multi-Ángulo' },
  { href: '/landing', icon: FileText, label: 'Landing Architect' },
  { href: '/vsl', icon: Video, label: 'Cinema VSL' },
  { href: '/email', icon: Mail, label: 'Email Architect' },
  { href: '/ads', icon: Megaphone, label: 'Ad-Spec Ops' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { credits, userEmail } = useApp();
  const router = useRouter();
  const supabase = createClient();

  const remainingCredits = credits ? credits.total_credits - credits.used_credits : null;
  const creditPct = credits ? Math.max(0, Math.min(100, (remainingCredits! / credits.total_credits) * 100)) : 0;
  const creditColor = creditPct > 50 ? 'bg-accent-emerald' : creditPct > 20 ? 'bg-accent-amber' : 'bg-accent-red';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-surface border-r border-border-subtle h-screen sticky top-0 flex flex-col hidden md:flex flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-glow-indigo flex-shrink-0">
            <Image src="/logo.jpg" alt="CopyLab" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black font-inter text-text-primary leading-tight">CopyLab</h1>
            <span className="text-[10px] text-text-muted font-semibold tracking-widest uppercase">v2.0 · OS</span>
          </div>
        </div>
      </div>

      {/* Avatar Link */}
      <div className="px-3 py-3 border-b border-border-subtle">
        <Link
          href="/avatar"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
            pathname === '/avatar'
              ? 'bg-brand-primary/15 border-brand-primary/40 text-brand-primary'
              : 'border-transparent hover:bg-elevated text-text-secondary hover:text-text-primary'
          }`}
        >
          <UserCircle2 size={18} />
          <div className="flex-1">
            <span className="text-sm font-semibold">Avatar Builder</span>
            <p className="text-[10px] text-text-muted">Knowledge Base</p>
          </div>
          <ChevronRight size={14} className="opacity-40" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Módulos</p>

        {modules.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-brand-primary' : ''} />
              <span>{label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Credits */}
      {credits !== null && (
        <div className="px-4 py-3 mx-3 mb-2 bg-elevated rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Coins size={13} className="text-accent-amber" />
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Créditos</span>
            </div>
            <span className={`text-[11px] font-black ${remainingCredits === 0 ? 'text-accent-red' : 'text-text-primary'}`}>
              {remainingCredits} / {credits.total_credits}
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${creditColor}`} style={{ width: `${creditPct}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border-subtle space-y-0.5">
        <Link href="/settings" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${pathname === '/settings' ? 'bg-brand-primary/15 text-brand-primary' : 'text-text-secondary hover:text-text-primary hover:bg-elevated'}`}>
          <Settings size={17} />
          <span>Configuración</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all text-text-secondary hover:text-accent-red hover:bg-accent-red/5"
        >
          <LogOut size={17} />
          <div className="flex-1 text-left">
            <span className="block">Cerrar Sesión</span>
            {userEmail && <span className="text-[10px] text-text-muted truncate block">{userEmail}</span>}
          </div>
        </button>
      </div>
    </aside>
  );
}
