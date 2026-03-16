'use client';

import { useState } from 'react';
import { ChevronDown, Check, Plus, Building2, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';

export default function BrandSelector() {
  const { activeBrand, setActiveBrand, brands, refreshBrands } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelect = (brand: typeof brands[0]) => {
    setActiveBrand(brand);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    router.push('/onboarding');
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshBrands();
    setLoading(false);
  };

  return (
    <div className="relative" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
    }}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) handleRefresh(); }}
        className="flex items-center gap-2.5 bg-surface hover:bg-elevated border border-border-subtle rounded-xl p-2 pr-3 transition-all text-left min-w-[180px] max-w-[220px]"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {activeBrand ? activeBrand.name.substring(0, 2).toUpperCase() : <Building2 size={14} />}
        </div>
        <div className="flex-1 overflow-hidden">
          {activeBrand ? (
            <>
              <p className="text-xs font-bold truncate text-text-primary leading-tight">{activeBrand.name}</p>
              <p className="text-[10px] text-text-muted truncate">{activeBrand.industry || 'Sin industria'}</p>
            </>
          ) : (
            <p className="text-xs font-semibold text-text-muted">Seleccionar marca</p>
          )}
        </div>
        {loading ? (
          <Loader2 size={14} className="text-text-muted animate-spin flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className={`text-text-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-overlay border border-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-2">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2 pt-1">Perfiles de Marca</p>
            
            {brands.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-text-muted mb-2">No tienes perfiles creados aún.</p>
              </div>
            ) : (
              brands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => handleSelect(brand)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-elevated/80 transition-colors text-left group ${activeBrand?.id === brand.id ? 'bg-elevated' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary/30 to-brand-secondary/30 flex items-center justify-center text-brand-primary text-xs font-bold border border-brand-primary/20 flex-shrink-0">
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-text-primary truncate">{brand.name}</p>
                    {brand.industry && <p className="text-[10px] text-text-muted truncate">{brand.industry}</p>}
                  </div>
                  {activeBrand?.id === brand.id && (
                    <Check size={14} className="text-brand-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-2 border-t border-border-subtle">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary/10 p-2.5 rounded-xl transition-colors"
            >
              <Plus size={16} />
              Crear Nuevo Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
