import { BrandProfile } from '@/lib/types';

interface Props {
  profile: Partial<BrandProfile>;
  updateProfile: (updates: Partial<BrandProfile>) => void;
}

export default function BusinessStep({ profile, updateProfile }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Información del Negocio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Nombre de la marca / proyecto *</label>
            <input 
              type="text" 
              value={profile.name || ''}
              onChange={e => updateProfile({ name: e.target.value })}
              placeholder="Ej: CopyLab"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Industria / vertical</label>
            <input 
              type="text" 
              value={profile.industry || ''}
              onChange={e => updateProfile({ industry: e.target.value })}
              placeholder="Ej: SaaS B2B, Coaching, E-commerce"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <label className="text-sm font-medium text-text-secondary">Propuesta Única de Valor (PUV) — 1 oración</label>
          <textarea 
            value={profile.uvp || ''}
            onChange={e => updateProfile({ uvp: e.target.value })}
            placeholder="Ej: El único sistema operativo de copywriting diseñado para el mercado hispanohablante."
            rows={2}
            className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
        </div>

        <div className="space-y-1 pt-2">
          <label className="text-sm font-medium text-text-secondary">Competidores directos y nuestra diferencia</label>
          <textarea 
            value={profile.competitors || ''}
            onChange={e => updateProfile({ competitors: e.target.value })}
            placeholder="Ej: Competimos contra Jasper y Copy.ai, pero nos diferenciamos aplicando directamente los niveles de Schwartz y siendo nativos en español."
            rows={3}
            className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
