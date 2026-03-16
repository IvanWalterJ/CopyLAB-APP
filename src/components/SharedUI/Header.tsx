'use client';

import { useApp } from '@/lib/context';
import { Coins, UserCircle } from 'lucide-react';
import BrandSelector from './BrandSelector';
import Link from 'next/link';

export default function Header() {
  const { credits, userEmail } = useApp();
  const remaining = credits ? credits.total_credits - credits.used_credits : null;

  return (
    <header className="h-14 border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-10 px-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <BrandSelector />
      </div>

      <div className="flex items-center gap-3">
        {/* Credits chip */}
        {remaining !== null && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
            remaining <= 0
              ? 'bg-accent-red/10 border-accent-red/30 text-accent-red'
              : remaining < 5
              ? 'bg-accent-amber/10 border-accent-amber/30 text-accent-amber'
              : 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
          }`}>
            <Coins size={12} />
            {remaining} créditos
          </div>
        )}

        {/* User avatar */}
        <Link href="/settings" className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-elevated transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 border border-brand-primary/30 flex items-center justify-center">
            <UserCircle size={16} className="text-brand-secondary" />
          </div>
          {userEmail && (
            <span className="text-xs text-text-muted hidden lg:block max-w-[140px] truncate">{userEmail}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
