import { BrandProfile } from '@/lib/types';

interface Props {
  profile: Partial<BrandProfile>;
  updateProfile: (updates: Partial<BrandProfile>) => void;
}

export default function VoiceStep({ profile, updateProfile }: Props) {
  const updateAdjectives = (index: number, value: string) => {
    const list = [...(profile.brand_adjectives || ['', '', '', '', ''])];
    list[index] = value;
    updateProfile({ brand_adjectives: list });
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Voz y Tono de Marca</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-3">
                Top 5 Adjetivos (Personalidad)
              </label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(idx => (
                  <input 
                    key={`adj-${idx}`}
                    type="text" 
                    value={profile.brand_adjectives?.[idx] || ''}
                    onChange={e => updateAdjectives(idx, e.target.value)}
                    placeholder={`Ej: ${['Motivacional', 'Directo', 'Cercano', 'Técnico', 'Irreverente'][idx]}`}
                    className="w-full bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-text-secondary flex justify-between">
                <span>Nivel de Formalidad</span>
                <span className="text-brand-primary">{profile.formality_level}/10</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={profile.formality_level || 5}
                onChange={e => updateProfile({ formality_level: parseInt(e.target.value) })}
                className="w-full accent-brand-primary h-2 bg-elevated rounded-lg appearance-none cursor-pointer mt-2"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>Muy Casual (1)</span>
                <span>Muy Formal (10)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-[28px]">
            <div className="space-y-1">
              <label className="text-sm font-medium text-accent-red flex items-center gap-2">
                Palabras Prohibidas
              </label>
              <textarea 
                value={profile.forbidden_words?.join(', ') || ''}
                onChange={e => updateProfile({ forbidden_words: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="Ej: barato, mágico, sin esfuerzo (separa por comas)"
                rows={3}
                className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-red"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-accent-emerald flex items-center gap-2">
                Ejemplo de Copy Aprobado (opcional)
              </label>
              <textarea 
                value={profile.approved_copy || ''}
                onChange={e => updateProfile({ approved_copy: e.target.value })}
                placeholder="Pega aquí un fragmento de copy que capture perfectamente tu tono..."
                rows={4}
                className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-emerald text-sm custom-scroll"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
