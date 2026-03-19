'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useApp } from '@/lib/context';
import {
  History,
  Search,
  Calendar,
  FileText,
  Copy,
  Trash2,
  ChevronRight,
  Zap,
  Grid3X3,
  Mail,
  Video,
  Megaphone,
  Filter,
  Star,
  X,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Generation {
  id: string;
  created_at: string;
  module_type: string;
  prompt: string;
  content: string;
  brand_name?: string;
  brand_id?: string;
}

const moduleInfo: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  hooks: { icon: Zap, color: 'text-brand-primary', label: 'Frenos de Scroll' },
  matrix: { icon: Grid3X3, color: 'text-accent-amber', label: 'Matriz Multi-Ángulo' },
  landing: { icon: FileText, color: 'text-accent-emerald', label: 'Landing Architect' },
  vsl: { icon: Video, color: 'text-brand-secondary', label: 'Cinema VSL' },
  email: { icon: Mail, color: 'text-brand-primary', label: 'Email Architect' },
  ads: { icon: Megaphone, color: 'text-accent-red', label: 'Ad-Spec Ops' },
};

export default function HistoryPage() {
  const { activeBrand } = useApp();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(true);
  const [savingToSwipe, setSavingToSwipe] = useState(false);
  const [swipeForm, setSwipeForm] = useState<{ title: string; category: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('generations')
      .select('*, brand_profiles(name)')
      .order('created_at', { ascending: false });

    if (!showAllBrands && activeBrand) {
      query = query.eq('brand_id', activeBrand.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      setGenerations(data.map(g => ({
        ...g,
        brand_name: g.brand_profiles?.name
      })));
    }
    setLoading(false);
  }, [showAllBrands, activeBrand]);

  useEffect(() => {
    fetchHistory();
    setSelectedId(null);
  }, [fetchHistory]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteGeneration = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Seguro que quieres eliminar este registro?')) return;

    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', id);

    if (!error) {
      setGenerations(generations.filter(g => g.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const saveToSwipeFile = async () => {
    if (!selectedGen || !swipeForm) return;
    setSavingToSwipe(true);
    await supabase.from('swipe_file').insert({
      title: swipeForm.title || selectedGen.content.substring(0, 60),
      category: swipeForm.category || 'Sin categoría',
      content: selectedGen.content,
      source: selectedGen.module_type,
    });
    setSavingToSwipe(false);
    setSwipeForm(null);
  };

  const selectedGen = generations.find(g => g.id === selectedId);
  const filteredGenerations = generations.filter(g =>
    g.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.module_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.brand_name && g.brand_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar: List of Generations */}
      <div className="w-[450px] flex flex-col gap-4 overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <History className="text-brand-primary" size={24} />
              Historial
            </h1>
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mt-1">Tus creaciones</p>
          </div>
        </div>

        {/* Brand filter toggle */}
        {activeBrand && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllBrands(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                !showAllBrands
                  ? 'bg-brand-primary/15 border-brand-primary text-brand-primary'
                  : 'bg-surface border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              <Filter size={11} />
              {activeBrand.name}
            </button>
            <button
              onClick={() => setShowAllBrands(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                showAllBrands
                  ? 'bg-elevated border-text-muted text-text-primary'
                  : 'bg-surface border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              <Layers size={11} />
              Todos los perfiles
            </button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Buscar por contenido, marca o módulo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface/50 border border-border-subtle rounded-xl animate-pulse" />
            ))
          ) : filteredGenerations.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-text-muted bg-surface/30 border border-dashed border-border-subtle rounded-2xl">
              <History size={40} className="opacity-20 mb-3" />
              <p className="text-sm">No se encontraron registros</p>
              {!showAllBrands && activeBrand && (
                <button onClick={() => setShowAllBrands(true)} className="mt-2 text-xs text-brand-primary underline">
                  Ver todos los perfiles
                </button>
              )}
            </div>
          ) : (
            filteredGenerations.map(gen => {
              const info = moduleInfo[gen.module_type] || { icon: FileText, color: 'text-text-secondary', label: gen.module_type };
              const Icon = info.icon;
              return (
                <div
                  key={gen.id}
                  onClick={() => setSelectedId(gen.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    selectedId === gen.id
                      ? 'bg-brand-primary/10 border-brand-primary'
                      : 'bg-surface border-border-subtle hover:border-text-muted hover:bg-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-surface border border-border-subtle ${info.color}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{info.label}</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">{new Date(gen.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-primary font-medium line-clamp-2 mb-1">
                    {gen.content.replace(/[#*]/g, '').substring(0, 100)}...
                  </p>
                  {gen.brand_name && (
                    <span className="text-[10px] bg-elevated border border-border-subtle px-2 py-0.5 rounded text-text-muted">
                      {gen.brand_name}
                    </span>
                  )}

                  <button
                    onClick={(e) => deleteGeneration(gen.id, e)}
                    className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-surface border border-border-subtle rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
        {selectedGen ? (
          <>
            <div className="flex items-center justify-between border-b border-border-subtle pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-elevated border border-border-subtle ${moduleInfo[selectedGen.module_type]?.color || 'text-text-primary'}`}>
                  {(() => {
                    const Icon = moduleInfo[selectedGen.module_type]?.icon || FileText;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{moduleInfo[selectedGen.module_type]?.label || 'Generación'}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(selectedGen.created_at).toLocaleString()}</span>
                    {selectedGen.brand_name && <span className="flex items-center gap-1 font-bold text-brand-primary"><ChevronRight size={10} /> {selectedGen.brand_name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSwipeForm(swipeForm ? null : { title: '', category: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-amber/10 border border-accent-amber/20 rounded-xl text-xs font-bold text-accent-amber hover:bg-accent-amber/20 transition-all active:scale-95"
                >
                  <Star size={14} />
                  Swipe File
                </button>
                <button
                  onClick={() => copyToClipboard(selectedGen.content)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-primary/20 transition-all active:scale-95"
                >
                  <Copy size={14} />
                  {copied ? '¡Copiado!' : 'Copiar Todo'}
                </button>
              </div>
            </div>

            {/* Swipe File save form */}
            {swipeForm && (
              <div className="mb-4 p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-2xl flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Título (opcional)"
                    value={swipeForm.title}
                    onChange={e => setSwipeForm({ ...swipeForm, title: e.target.value })}
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-amber"
                  />
                  <input
                    type="text"
                    placeholder="Categoría (ej: Emails, Hooks, Ads...)"
                    value={swipeForm.category}
                    onChange={e => setSwipeForm({ ...swipeForm, category: e.target.value })}
                    className="w-full bg-surface border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-amber"
                  />
                </div>
                <button
                  onClick={saveToSwipeFile}
                  disabled={savingToSwipe}
                  className="px-4 py-2 bg-accent-amber text-background rounded-xl text-xs font-bold hover:bg-accent-amber/90 transition-all disabled:opacity-60"
                >
                  {savingToSwipe ? 'Guardando...' : 'Guardar'}
                </button>
                <button onClick={() => setSwipeForm(null)} className="p-2 text-text-muted hover:text-text-primary">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-4 custom-scroll">
              <div className="markdown-content prose prose-invert max-w-none">
                <ReactMarkdown>{selectedGen.content}</ReactMarkdown>
              </div>

              {selectedGen.prompt && (
                <div className="mt-12 p-6 bg-elevated/50 border border-border-subtle rounded-2xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                    <Filter size={12} /> Configuración del Prompt
                  </h4>
                  <p className="text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed italic">
                    {selectedGen.prompt}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-elevated border border-border-subtle flex items-center justify-center shadow-inner scale-110">
              <History size={40} className="text-text-muted opacity-30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">Visor de Copywriting</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto">Selecciona una generación de la lista de la izquierda para ver los detalles, editarlos o volver a copiarlos.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
