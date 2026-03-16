import { BrandProfile } from '@/lib/types';

interface Props {
  profile: Partial<BrandProfile>;
  updateProfile: (updates: Partial<BrandProfile>) => void;
}

export default function AvatarStep({ profile, updateProfile }: Props) {
  const updateArray = (field: 'avatar_pains' | 'avatar_desires' | 'avatar_objections', index: number, value: string) => {
    const arr = [...(profile[field] || [])];
    arr[index] = value;
    updateProfile({ [field]: arr });
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Demográfica del Avatar Ideal</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Nombre ficticio</label>
            <input 
              type="text" 
              value={profile.avatar_name || ''}
              onChange={e => updateProfile({ avatar_name: e.target.value })}
              placeholder="Ej: Marcos Director"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Edad</label>
            <input 
              type="number" 
              value={profile.avatar_age || ''}
              onChange={e => updateProfile({ avatar_age: parseInt(e.target.value) || undefined })}
              placeholder="Ej: 38"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Ubicación</label>
            <input 
              type="text" 
              value={profile.avatar_location || ''}
              onChange={e => updateProfile({ avatar_location: e.target.value })}
              placeholder="Ej: LATAM, España"
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-accent-red mb-2">Dolores Principales</h2>
          <p className="text-xs text-text-muted mb-4">Usa sus propias palabras.</p>
          {[0, 1, 2].map(i => (
            <input 
              key={`pain-${i}`}
              type="text" 
              value={profile.avatar_pains?.[i] || ''}
              onChange={e => updateArray('avatar_pains', i, e.target.value)}
              placeholder={`Dolor ${i+1}`}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-red transition-colors"
            />
          ))}
        </div>

        <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-accent-emerald mb-2">Deseos Profundos</h2>
          <p className="text-xs text-text-muted mb-4">Lo que realmente quieren lograr.</p>
          {[0, 1, 2].map(i => (
            <input 
              key={`desire-${i}`}
              type="text" 
              value={profile.avatar_desires?.[i] || ''}
              onChange={e => updateArray('avatar_desires', i, e.target.value)}
              placeholder={`Deseo ${i+1}`}
              className="w-full bg-elevated border border-border-subtle rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-emerald transition-colors"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
