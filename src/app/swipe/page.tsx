'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useApp } from '@/lib/context';
import {
  IconStar, IconSearch, IconCopy, IconTrash, IconCalendar, IconTag, IconPlus, IconX, IconDocument
} from '@/components/icons';
import ReactMarkdown from 'react-markdown';

interface SwipeItem {
  id: string;
  created_at: string;
  category: string | null;
  title: string | null;
  content: string;
  tags: string[] | null;
  source: string | null;
}

const CATEGORIES = ['Emails', 'Hooks', 'Ads', 'Landing', 'VSL', 'Otro'];

export default function SwipePage() {
  const [items, setItems] = useState<SwipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', category: '', content: '' });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { userId } = useApp();

  useEffect(() => {
    fetchSwipe();
  }, []);

  const fetchSwipe = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('swipe_file')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data as SwipeItem[]);
    setLoading(false);
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este elemento del Swipe File?')) return;
    await supabase.from('swipe_file').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const saveNewItem = async () => {
    if (!newItem.content.trim() || !userId) return;
    setSaving(true);
    const { data } = await supabase.from('swipe_file').insert({
      user_id: userId,
      title: newItem.title || newItem.content.substring(0, 60),
      category: newItem.category || 'Sin categoría',
      content: newItem.content,
    }).select().single();
    if (data) {
      setItems([data as SwipeItem, ...items]);
      setSelectedId(data.id);
    }
    setSaving(false);
    setShowAddForm(false);
    setNewItem({ title: '', category: '', content: '' });
  };

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];

  const filtered = items.filter(i => {
    const matchSearch = !searchQuery ||
      i.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (i.category?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = !filterCategory || i.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex gap-6">
      {/* Left panel */}
      <div className="w-[450px] flex flex-col gap-4 overflow-hidden shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <IconStar className="text-accent-amber" size={24} />
              Banco de Inspiración
            </h1>
            <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mt-1">Tus mejores copys guardados</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent-amber/10 border border-accent-amber/20 text-accent-amber rounded-xl text-xs font-bold hover:bg-accent-amber/20 transition-all"
          >
            {showAddForm ? <IconX size={14} /> : <IconPlus size={14} />}
            {showAddForm ? 'Cancelar' : 'Agregar'}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="p-4 bg-surface border border-accent-amber/20 rounded-2xl space-y-3">
            <input
              type="text"
              placeholder="Título (opcional)"
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-amber"
            />
            <select
              value={newItem.category}
              onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-amber"
            >
              <option value="">Categoría...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              placeholder="Pega tu copy aquí..."
              value={newItem.content}
              onChange={e => setNewItem({ ...newItem, content: e.target.value })}
              rows={5}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-amber resize-none"
            />
            <button
              onClick={saveNewItem}
              disabled={saving || !newItem.content.trim()}
              className="w-full py-2.5 bg-accent-amber text-background rounded-xl text-sm font-bold hover:bg-accent-amber/90 transition-all disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar en Swipe File'}
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Buscar en tu swipe file..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-amber transition-all"
          />
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory('')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${!filterCategory ? 'bg-accent-amber/20 border-accent-amber text-accent-amber' : 'bg-surface border-border-subtle text-text-muted hover:text-text-primary'}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${filterCategory === cat ? 'bg-accent-amber/20 border-accent-amber text-accent-amber' : 'bg-surface border-border-subtle text-text-muted hover:text-text-primary'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface/50 border border-border-subtle rounded-xl animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-text-muted bg-surface/30 border border-dashed border-border-subtle rounded-2xl">
              <IconStar size={40} className="opacity-20 mb-3" />
              <p className="text-sm">Tu banco está vacío</p>
              <p className="text-xs mt-1 text-text-muted">Guarda tus mejores copys desde Mis Copys con el botón ⭐</p>
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                  selectedId === item.id
                    ? 'bg-accent-amber/10 border-accent-amber'
                    : 'bg-surface border-border-subtle hover:border-text-muted hover:bg-elevated'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-accent-amber uppercase tracking-widest">
                        <IconTag size={10} />{item.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1 line-clamp-1">{item.title || item.content.substring(0, 60)}</p>
                <p className="text-xs text-text-muted line-clamp-2">{item.content.replace(/[#*]/g, '').substring(0, 100)}</p>
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right preview */}
      <div className="flex-1 glass border border-border-glass rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-elevated">
        {selectedItem ? (
          <>
            <div className="flex items-center justify-between border-b border-border-subtle pb-5 mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{selectedItem.title || 'Sin título'}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><IconCalendar size={12} /> {new Date(selectedItem.created_at).toLocaleString()}</span>
                  {selectedItem.category && (
                    <span className="flex items-center gap-1 font-bold text-accent-amber"><IconTag size={10} /> {selectedItem.category}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(selectedItem.content)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-primary/20 transition-all active:scale-95"
              >
                <IconCopy size={14} />
                Copiar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-4 custom-scroll">
              <div className="markdown-content prose prose-invert max-w-none">
                <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-[2rem] bg-elevated border border-border-subtle flex items-center justify-center shadow-inner">
              <IconDocument size={40} className="text-text-muted opacity-30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-primary">Banco de Inspiración</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto">Guarda aquí los copys que más te gustan. La IA los usará como referencia para generar mejores resultados adaptados a tu estilo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
