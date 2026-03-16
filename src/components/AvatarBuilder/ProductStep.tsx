import { BrandProfile } from '@/lib/types';

interface Props {
  profile: Partial<BrandProfile>;
  updateProfile: (updates: Partial<BrandProfile>) => void;
}

export default function ProductStep({ profile, updateProfile }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Mapeo del Producto / Oferta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-text-secondary">Nombre del Producto / Oferta Principal</label>
            <input 
              type="text" 
              value={profile.product_name || ''}
              onChange={e => updateProfile({ product_name: e.target.value })}
              placeholder="Ej: Sprint de Adquisición B2B"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-text-secondary">Transformación Principal (Antes → Después)</label>
            <textarea 
              value={profile.product_transformation || ''}
              onChange={e => updateProfile({ product_transformation: e.target.value })}
              placeholder="Ej: De depender del boca a boca incierto a tener un sistema de adquisición de leads calificados garantizado."
              rows={2}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-secondary">Mecanismo Único</label>
            <p className="text-xs text-text-muted mb-2">¿Por qué de repente pueden lograr el resultado ahora?</p>
            <textarea 
              value={profile.product_mechanism || ''}
              onChange={e => updateProfile({ product_mechanism: e.target.value })}
              placeholder="Ej: Embudos con IA Dinámica basada en Niveles de Schwartz."
              rows={3}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-secondary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Resultados Típicos (Números Duros)</label>
            <p className="text-xs text-text-muted mb-2">Casos de éxito, % de mejora, días.</p>
            <textarea 
              value={profile.product_results || ''}
              onChange={e => updateProfile({ product_results: e.target.value })}
              placeholder="Ej: 15 llamadas agendadas extra en los primeros 30 días, aumento del 40% en retención."
              rows={3}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Garantía / Política de Riesgo</label>
            <input 
              type="text" 
              value={profile.product_guarantee || ''}
              onChange={e => updateProfile({ product_guarantee: e.target.value })}
              placeholder="Ej: 30 días 100% money back o te pagamos la diferencia de los ads"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Precio / Inversión</label>
            <input 
              type="text" 
              value={profile.product_price || ''}
              onChange={e => updateProfile({ product_price: e.target.value })}
              placeholder="Ej: U$D 1.500 una sola vez o 3 pagos de U$D 550"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
