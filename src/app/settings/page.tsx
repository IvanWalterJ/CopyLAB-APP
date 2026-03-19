'use client';

import { User, Bell, CreditCard, Shield } from 'lucide-react';
import { useApp } from '@/lib/context';

export default function SettingsView() {
  const { userEmail } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Configuración</h1>
        <p className="text-text-secondary text-sm">Gestiona tu cuenta, preferencias y facturación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Settings */}
        <div className="space-y-1">
          {[
            { id: 'profile', label: 'Perfil', icon: User, active: true },
            { id: 'billing', label: 'Facturación', icon: CreditCard },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
            { id: 'security', label: 'Seguridad', icon: Shield },
          ].map(item => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active 
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                  : 'text-text-secondary hover:bg-elevated border border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} className="text-brand-primary" />
              Información de Perfil
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="text"
                  disabled
                  value={userEmail ?? ''}
                  readOnly
                  className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre de Usuario</label>
                <input 
                  type="text" 
                  placeholder="Tu nombre"
                  className="w-full bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-2xl p-6 opacity-50 relative overflow-hidden">
             <div className="absolute inset-0 bg-surface/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="bg-elevated border border-border-subtle px-3 py-1 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-widest">Próximamente</span>
             </div>
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-accent-amber" />
              Suscripción y Créditos
            </h3>
            <p className="text-sm text-text-secondary">Pronto podrás gestionar tus pagos de Hotmart y suscripciones recurrentes aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
