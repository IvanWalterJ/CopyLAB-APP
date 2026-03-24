'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCalendar, IconPlus, IconX, IconChevronRight, IconCheck,
  IconInstagram, IconTwitter, IconLinkedin, IconPlayCircle,
  IconMail, IconCarousel, IconReel, IconImage, IconTextPost, IconStory, IconTrash, IconWand
} from '@/components/icons';

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'email';
type Format = 'reel' | 'carrusel' | 'post' | 'story' | 'email';
type Status = 'planned' | 'draft' | 'published';

interface ContentSlot {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  platform: Platform;
  format: Format;
  status: Status;
  notes: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'instagram', label: 'Instagram', icon: IconInstagram },
  { id: 'tiktok', label: 'TikTok', icon: IconPlayCircle },
  { id: 'twitter', label: 'Twitter / X', icon: IconTwitter },
  { id: 'linkedin', label: 'LinkedIn', icon: IconLinkedin },
  { id: 'email', label: 'Email', icon: IconMail },
];

const FORMATS: { id: Format; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'reel', label: 'Reel / Video', icon: IconReel },
  { id: 'carrusel', label: 'Carrusel', icon: IconCarousel },
  { id: 'post', label: 'Post / Imagen', icon: IconImage },
  { id: 'story', label: 'Story', icon: IconStory },
  { id: 'email', label: 'Email', icon: IconTextPost },
];

const STATUSES: { id: Status; label: string; color: string; dot: string }[] = [
  { id: 'planned', label: 'Planificado', color: 'text-brand-primary', dot: 'bg-brand-primary' },
  { id: 'draft', label: 'En Draft', color: 'text-amber-400', dot: 'bg-amber-400' },
  { id: 'published', label: 'Publicado', color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
  tiktok: 'bg-slate-500/15 border-slate-500/30 text-slate-300',
  twitter: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
  linkedin: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  email: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
};

const STATUS_BORDER: Record<Status, string> = {
  planned: 'border-l-brand-primary',
  draft: 'border-l-amber-400',
  published: 'border-l-emerald-400',
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const STORAGE_KEY = 'copylab_content_calendar';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based week: Mon=0 ... Sun=6
  const startPad = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));

  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatMonthTitle(year: number, month: number): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${months[month]} ${year}`;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function loadSlots(): ContentSlot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSlots(slots: ContentSlot[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

// ─── Modal Component ──────────────────────────────────────────────────────────

interface SlotModalProps {
  date: string;
  slot: ContentSlot | null; // null = new slot
  onSave: (slot: ContentSlot) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function SlotModal({ date, slot, onSave, onDelete, onClose }: SlotModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(slot?.title ?? '');
  const [platform, setPlatform] = useState<Platform>(slot?.platform ?? 'instagram');
  const [format, setFormat] = useState<Format>(slot?.format ?? 'post');
  const [status, setStatus] = useState<Status>(slot?.status ?? 'planned');
  const [notes, setNotes] = useState(slot?.notes ?? '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: slot?.id ?? generateId(),
      date,
      title: title.trim(),
      platform,
      format,
      status,
      notes: notes.trim(),
    });
  };

  const handleGenerate = () => {
    router.push(`/hooks?topic=${encodeURIComponent(title)}&platform=${platform}`);
    onClose();
  };

  // Format the display date
  const [yr, mo, dy] = date.split('-').map(Number);
  const displayDate = new Date(yr, mo - 1, dy).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface border border-border-glass rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              {slot ? 'Editar contenido' : 'Agregar contenido'}
            </p>
            <p className="text-sm text-text-secondary capitalize mt-0.5">{displayDate}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-elevated transition-colors text-text-muted">
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tema / Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Por qué tu copy espanta clientes..."
              className="w-full bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary/50 transition-colors"
              autoFocus
            />
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Plataforma</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? PLATFORM_COLORS[p.id]
                        : 'border-border-subtle bg-elevated text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <Icon size={12} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Formato</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map(f => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary'
                        : 'border-border-subtle bg-elevated text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <Icon size={12} />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Estado</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    status === s.id
                      ? `border-current bg-elevated ${s.color}`
                      : 'border-border-subtle bg-elevated text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status === s.id ? s.dot : 'bg-text-muted'}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Referencias, ideas, ángulos a explorar..."
              rows={2}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <IconCheck size={14} />
              {slot ? 'Guardar cambios' : 'Agregar al calendario'}
            </button>
            {title.trim() && (
              <button
                onClick={handleGenerate}
                className="px-3 py-2.5 bg-elevated hover:bg-overlay border border-border-subtle rounded-xl transition-all text-text-secondary hover:text-text-primary flex items-center gap-1.5 text-xs font-semibold"
                title="Generar copy para este contenido"
              >
                <IconWand size={14} className="text-brand-primary" />
                Generar
              </button>
            )}
          </div>
          {slot && (
            <button
              onClick={() => onDelete(slot.id)}
              className="w-full py-2 text-xs text-accent-red/70 hover:text-accent-red flex items-center justify-center gap-1.5 transition-colors"
            >
              <IconTrash size={12} />
              Eliminar este contenido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Day Cell Component ───────────────────────────────────────────────────────

function DayCell({
  date,
  slots,
  isToday,
  isCurrentMonth,
  onDayClick,
  onSlotClick,
}: {
  date: Date | null;
  slots: ContentSlot[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onDayClick: (dateKey: string) => void;
  onSlotClick: (slot: ContentSlot) => void;
}) {
  if (!date) {
    return <div className="min-h-[100px] bg-surface/30 rounded-xl border border-border-subtle/30" />;
  }

  const dateKey = toDateKey(date);
  const dayNum = date.getDate();
  const maxVisible = 3;
  const overflow = slots.length - maxVisible;

  return (
    <div
      className={`min-h-[100px] rounded-xl border transition-all group relative ${
        isToday
          ? 'border-brand-primary/40 bg-brand-primary/5'
          : isCurrentMonth
          ? 'border-border-subtle bg-surface hover:border-border-glass hover:bg-elevated/50'
          : 'border-border-subtle/30 bg-surface/30'
      }`}
    >
      {/* Day number */}
      <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
        <span className={`text-sm font-bold leading-none ${
          isToday
            ? 'w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs'
            : isCurrentMonth
            ? 'text-text-primary'
            : 'text-text-muted'
        }`}>
          {dayNum}
        </span>
        {/* Add button */}
        <button
          onClick={() => onDayClick(dateKey)}
          className="w-5 h-5 rounded-md bg-brand-primary/10 text-brand-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-primary/20 flex items-center justify-center flex-shrink-0"
        >
          <IconPlus size={11} />
        </button>
      </div>

      {/* Slots */}
      <div className="px-1.5 pb-2 space-y-1">
        {slots.slice(0, maxVisible).map(slot => {
          const PlatIcon = PLATFORMS.find(p => p.id === slot.platform)?.icon;
          return (
            <button
              key={slot.id}
              onClick={() => onSlotClick(slot)}
              className={`w-full text-left px-2 py-1 rounded-md border-l-2 bg-elevated/80 hover:bg-elevated transition-all ${STATUS_BORDER[slot.status]}`}
            >
              <div className="flex items-center gap-1 min-w-0">
                {PlatIcon && <PlatIcon size={10} className="flex-shrink-0 text-text-muted" />}
                <span className="text-[10px] text-text-secondary truncate leading-tight">{slot.title}</span>
              </div>
            </button>
          );
        })}
        {overflow > 0 && (
          <button
            onClick={() => onDayClick(dateKey)}
            className="w-full text-[9px] text-text-muted text-center py-0.5 hover:text-text-secondary transition-colors"
          >
            +{overflow} más
          </button>
        )}
        {slots.length === 0 && (
          <button
            onClick={() => onDayClick(dateKey)}
            className="w-full h-8 rounded-md border border-dashed border-border-subtle/50 text-[9px] text-text-muted opacity-0 group-hover:opacity-100 transition-all hover:border-brand-primary/30 hover:text-brand-primary/70 flex items-center justify-center gap-1"
          >
            <IconPlus size={9} />
            Agregar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<ContentSlot[]>([]);
  const [modal, setModal] = useState<{ date: string; slot: ContentSlot | null } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setSlots(loadSlots());
  }, []);

  const persist = useCallback((updated: ContentSlot[]) => {
    setSlots(updated);
    saveSlots(updated);
  }, []);

  const openNewSlot = useCallback((dateKey: string) => {
    setModal({ date: dateKey, slot: null });
  }, []);

  const openEditSlot = useCallback((slot: ContentSlot) => {
    setModal({ date: slot.date, slot });
  }, []);

  const handleSave = useCallback((slot: ContentSlot) => {
    const updated = slots.filter(s => s.id !== slot.id);
    persist([...updated, slot]);
    setModal(null);
  }, [slots, persist]);

  const handleDelete = useCallback((id: string) => {
    persist(slots.filter(s => s.id !== id));
    setModal(null);
  }, [slots, persist]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const cells = getMonthDays(year, month);

  // Group slots by date for quick lookup
  const slotsByDate = slots.reduce<Record<string, ContentSlot[]>>((acc, s) => {
    acc[s.date] = acc[s.date] ? [...acc[s.date], s] : [s];
    return acc;
  }, {});

  // Stats for this month
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthSlots = slots.filter(s => s.date.startsWith(monthKey));
  const statsByStatus = STATUSES.map(st => ({
    ...st,
    count: monthSlots.filter(s => s.status === st.id).length,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand-subtle flex items-center justify-center">
            <IconCalendar size={18} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Canvas de Contenido</h1>
            <p className="text-text-secondary text-sm">Planificá tu mes de contenido en un solo lugar.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {statsByStatus.map(s => (
            <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated border border-border-subtle rounded-xl text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-text-muted">{s.label}</span>
              <span className={`font-bold ${s.color}`}>{s.count}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-xs">
            <span className="text-text-muted">Total</span>
            <span className="font-bold text-brand-primary">{monthSlots.length}</span>
          </div>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-border-subtle bg-surface hover:bg-elevated flex items-center justify-center transition-colors text-text-secondary"
          >
            <IconChevronRight size={15} className="rotate-180" />
          </button>
          <h2 className="text-lg font-bold text-text-primary min-w-[200px] text-center">
            {formatMonthTitle(year, month)}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-border-subtle bg-surface hover:bg-elevated flex items-center justify-center transition-colors text-text-secondary"
          >
            <IconChevronRight size={15} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-semibold border border-border-subtle bg-elevated hover:bg-overlay rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={() => {
            const todayKey = toDateKey(today);
            setYear(today.getFullYear());
            setMonth(today.getMonth());
            setTimeout(() => openNewSlot(todayKey), 50);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold rounded-xl transition-all"
        >
          <IconPlus size={15} />
          Agregar contenido
        </button>
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-[11px] font-bold text-text-muted uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => (
            <DayCell
              key={i}
              date={date}
              slots={date ? (slotsByDate[toDateKey(date)] ?? []) : []}
              isToday={date ? toDateKey(date) === toDateKey(today) : false}
              isCurrentMonth={date ? date.getMonth() === month : false}
              onDayClick={openNewSlot}
              onSlotClick={openEditSlot}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-border-subtle">
        <div className="flex items-center gap-4 flex-wrap">
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            const count = monthSlots.filter(s => s.platform === p.id).length;
            return (
              <div key={p.id} className="flex items-center gap-1.5 text-xs text-text-muted">
                <Icon size={12} />
                <span>{p.label}</span>
                {count > 0 && <span className="font-bold text-text-secondary">({count})</span>}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-text-muted">Click en un día para agregar · Click en un item para editar</p>
      </div>

      {/* Modal */}
      {modal && (
        <SlotModal
          date={modal.date}
          slot={modal.slot}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
