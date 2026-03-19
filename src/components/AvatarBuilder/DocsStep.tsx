'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { BrandProfile } from '@/lib/types';

interface Props {
  profile: Partial<BrandProfile>;
  updateProfile: (updates: Partial<BrandProfile>) => void;
}

export default function DocsStep({ profile, updateProfile }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!profile.id) {
      setUploadStatus('error');
      setStatusMsg('Guarda el perfil primero antes de subir documentos.');
      return;
    }

    const allowed = ['.pdf', '.docx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setUploadStatus('error');
      setStatusMsg('Solo se aceptan archivos PDF o DOCX.');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand_id', profile.id);

    try {
      const res = await fetch('/api/brand/upload-knowledge', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir');

      const fakeText = `[Documento: ${file.name} — ${data.chars} caracteres extraídos]`;
      updateProfile({ knowledge_base_text: fakeText });
      setUploadStatus('success');
      setStatusMsg(`"${file.name}" procesado — ${data.chars.toLocaleString()} caracteres extraídos.`);
    } catch (err: unknown) {
      setUploadStatus('error');
      setStatusMsg(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearKnowledgeBase = () => {
    if (!confirm('¿Limpiar la base de conocimiento de este perfil?')) return;
    updateProfile({ knowledge_base_text: '' });
    setUploadStatus('idle');
    setStatusMsg('');
  };

  const hasKnowledge = !!profile.knowledge_base_text?.trim();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h3 className="text-sm font-bold text-text-primary mb-1">Base de Conocimiento</h3>
        <p className="text-xs text-text-muted">
          Sube documentos PDF o DOCX (briefs, reportes, guías de marca) para que la IA los use como contexto adicional al generar copy.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragging
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-border-subtle bg-surface hover:border-text-muted hover:bg-elevated'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
        {uploading ? (
          <Loader2 size={36} className="text-brand-primary animate-spin mb-3" />
        ) : (
          <Upload size={36} className="text-text-muted mb-3" />
        )}
        <p className="text-sm font-semibold text-text-primary mb-1">
          {uploading ? 'Procesando documento...' : 'Arrastra un archivo o haz clic para subir'}
        </p>
        <p className="text-xs text-text-muted">PDF o DOCX · Máx. ~50 páginas recomendado</p>
      </div>

      {/* Status message */}
      {uploadStatus !== 'idle' && statusMsg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
          uploadStatus === 'success'
            ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald'
            : 'bg-accent-red/10 border-accent-red/20 text-accent-red'
        }`}>
          {uploadStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {statusMsg}
        </div>
      )}

      {/* Current knowledge base preview */}
      {hasKnowledge && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-brand-primary" />
              <span className="text-sm font-semibold text-text-primary">Conocimiento cargado</span>
            </div>
            <button
              onClick={clearKnowledgeBase}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              <Trash2 size={13} />
              Limpiar
            </button>
          </div>
          <div className="bg-elevated border border-border-subtle rounded-xl p-4 max-h-40 overflow-y-auto custom-scroll">
            <p className="text-xs text-text-muted font-mono leading-relaxed whitespace-pre-wrap">
              {profile.knowledge_base_text?.substring(0, 500)}
              {(profile.knowledge_base_text?.length ?? 0) > 500 && '...'}
            </p>
          </div>
          <p className="text-[10px] text-text-muted">
            {profile.knowledge_base_text?.length?.toLocaleString()} caracteres · La IA usará este contexto al generar copy para este perfil.
          </p>
        </div>
      )}

      {!profile.id && (
        <div className="flex items-center gap-2 p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl text-xs text-accent-amber">
          <AlertCircle size={14} />
          Guarda el perfil primero para poder subir documentos.
        </div>
      )}
    </div>
  );
}
