'use client';

import { useState, useEffect } from 'react';
import { Zap, Save, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { BrandProfile } from '@/lib/types';
import { useApp } from '@/lib/context';
import BusinessStep from './BusinessStep';
import AvatarStep from './AvatarStep';
import VoiceStep from './VoiceStep';
import ProductStep from './ProductStep';

const TABS = [
  { id: 'business', label: '1. Negocio' },
  { id: 'avatar', label: '2. Avatar Ideal' },
  { id: 'voice', label: '3. Voz y Tono' },
  { id: 'product', label: '4. Producto/Oferta' },
] as const;

type TabId = typeof TABS[number]['id'];

const emptyProfile = (): Partial<BrandProfile> => ({
  name: '',
  industry: '',
  uvp: '',
  avatar_pains: ['', '', ''],
  avatar_desires: ['', '', ''],
  avatar_objections: ['', '', ''],
  brand_adjectives: ['', '', '', '', ''],
  forbidden_words: [''],
  formality_level: 5,
  default_consciousness_level: 2,
  is_active: true,
});

export default function AvatarBuilder() {
  const { activeBrand, setActiveBrand, brands, refreshBrands } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const [profile, setProfile] = useState<Partial<BrandProfile>>(emptyProfile());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Sync profile from activeBrand
  useEffect(() => {
    if (activeBrand) {
      setProfile(activeBrand);
      setIsNew(false);
    } else {
      setProfile(emptyProfile());
      setIsNew(true);
    }
  }, [activeBrand]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const calculateCompleteness = () => {
    let score = 0;
    let total = 0;
    const check = (field: string | string[] | number | undefined) => {
      total++;
      if (typeof field === 'string' && field.trim() !== '') score++;
      else if (Array.isArray(field) && field.some(x => x.trim() !== '')) score++;
      else if (typeof field === 'number' && field > 0) score++;
    };
    check(profile.name); check(profile.industry); check(profile.uvp);
    check(profile.avatar_name); check(profile.avatar_pains); check(profile.avatar_desires);
    check(profile.brand_adjectives); check(profile.formality_level);
    check(profile.product_name); check(profile.product_transformation);
    return Math.round((score / total) * 100) || 0;
  };

  const completeness = calculateCompleteness();

  const handleSave = async () => {
    if (!profile.name?.trim()) {
      showToast('error', 'El nombre de la marca es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      await refreshBrands();
      setActiveBrand(data as BrandProfile);
      setProfile(data);
      setIsNew(false);
      showToast('success', `Perfil "${data.name}" guardado correctamente ✓`);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setProfile(emptyProfile());
    setIsNew(true);
    setActiveTab('business');
  };

  const handleDelete = async () => {
    if (!profile.id) return;
    if (!confirm(`¿Eliminar el perfil "${profile.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch('/api/brand', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id }),
      });
      if (!res.ok) throw new Error('Error al eliminar');
      await refreshBrands();
      setActiveBrand(brands.length > 1 ? brands.find(b => b.id !== profile.id) ?? null : null);
      showToast('success', 'Perfil eliminado.');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error');
    }
  };

  const updateProfile = (updates: Partial<BrandProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const completenessColor = completeness > 80 ? 'bg-accent-emerald' : completeness > 40 ? 'bg-accent-amber' : 'bg-text-muted';

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
            : 'bg-accent-red/10 border-accent-red/30 text-accent-red'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1">Avatar Builder</h1>
          <p className="text-text-secondary text-sm">Perfil estratégico que alimenta el motor de IA.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Completeness */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium">Completeness</span>
            <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden border border-border-subtle">
              <div className={`h-full transition-all duration-500 ${completenessColor}`} style={{ width: `${completeness}%` }} />
            </div>
            <span className={`text-xs font-bold font-mono ${completeness > 80 ? 'text-accent-emerald' : 'text-text-muted'}`}>
              {completeness}%
            </span>
          </div>

          <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nuevo
          </button>

          {!isNew && profile.id && (
            <button onClick={handleDelete} className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-secondary disabled:opacity-60 text-white rounded-lg font-semibold transition-all shadow-glow-indigo active:scale-95"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : (isNew ? 'Crear Perfil' : 'Guardar Cambios')}
          </button>
        </div>
      </div>

      {/* Selector de marca existente cuando hay más de una */}
      {brands.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {brands.map(b => (
            <button
              key={b.id}
              onClick={() => { setActiveBrand(b); setIsNew(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                (profile.id === b.id && !isNew)
                  ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                  : 'bg-surface border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {b.name}
            </button>
          ))}
          {isNew && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-accent-amber/10 border-accent-amber/30 text-accent-amber">
              + Nuevo perfil
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-subtle mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'business' && <BusinessStep profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'avatar' && <AvatarStep profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'voice' && <VoiceStep profile={profile} updateProfile={updateProfile} />}
        {activeTab === 'product' && <ProductStep profile={profile} updateProfile={updateProfile} />}
      </div>

      {/* Bottom CTA on Mobile */}
      <div className="md:hidden pt-4 border-t border-border-subtle mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-primary hover:bg-brand-secondary disabled:opacity-60 text-white rounded-xl font-bold"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {saving ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </div>
    </div>
  );
}
