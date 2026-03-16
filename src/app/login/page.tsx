import { login, signup } from './actions'
import { Hexagon } from 'lucide-react'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden selection:bg-brand-primary selection:text-white">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-secondary opacity-15 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto p-8 sm:p-10 bg-surface/60 backdrop-blur-xl border border-border-subtle rounded-3xl shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-14 w-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-glow-indigo mb-5">
            <Hexagon className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-inter text-text-primary mb-2 tracking-tight">Ingresa a CopyLab</h1>
          <p className="text-text-secondary text-sm sm:text-base font-medium">Tu sistema operativo de <br/> respuesta directa con IA</p>
        </div>

        <form className="flex flex-col gap-5 text-text-primary w-full">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              className="w-full rounded-xl px-4 py-3.5 bg-elevated/80 border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary placeholder:text-text-muted transition-all text-sm font-medium"
              name="email"
              type="email"
              placeholder="tu@agencia.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full rounded-xl px-4 py-3.5 bg-elevated/80 border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary placeholder:text-text-muted transition-all text-sm font-medium"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold rounded-xl px-4 py-4 transition-all shadow-glow-indigo active:scale-[0.98] text-sm"
            >
              Iniciar Sesión
            </button>

            <button
              formAction={signup}
              className="w-full bg-transparent border border-border-subtle hover:bg-white/5 text-text-primary font-bold rounded-xl px-4 py-4 transition-all active:scale-[0.98] text-sm"
            >
              Crear Nueva Cuenta
            </button>
          </div>

          {searchParams?.message && (
            <div className="mt-2 p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl text-center">
              <p className="text-accent-amber text-sm font-medium">
                {searchParams.message}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
