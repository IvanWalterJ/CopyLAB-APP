'use client';

import { useState } from 'react';
import { Wand2, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';

const EMAIL_TYPES = [
  { id: 'lanzamiento', name: 'Serie Lanzamiento (5 emails)' },
  { id: 'bienvenida', name: 'Flujo de Bienvenida (3 emails)' },
  { id: 'abandono', name: 'Abandono de Carrito (2 emails)' },
  { id: 'nutricion', name: 'Contenido / Nutrición (1 email)' },
];

export default function EmailArchitectPage() {
  const [level, setLevel] = useState<ConsciousnessLevel>(4);
  const [type, setType] = useState('lanzamiento');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: `Redacta un flujo de emails estratégico tipo: ${EMAIL_TYPES.find(t=>t.id===type)?.name}. \nEl contexto y oferta es: "${topic}". \n\nInstrucciones:\n- Por CADA email, proporciona al menos 2 opciones de "Subject Line" (A/B testing) con alta tasa de apertura.\n- Escribe el cuerpo del correo de forma altamente persuasiva, natural, sin parecer "plantilla". Usar saltos de carro cortos.\n- Finaliza con un Call To Action (CTA) claro.`,
          consciousnessLevel: level,
          brandProfile: null
        }),
      });

      if (!response.body) throw new Error("No response string.");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      console.error(e);
      setOutput("Error generando la secuencia.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1 flex items-center gap-2">
            <Mail size={24} className="text-brand-primary" />
            Email Architect
          </h1>
          <p className="text-text-secondary text-sm">Convierte tu lista de contactos en compradores activos.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Objetivo de la Secuencia</label>
          <div className="grid grid-cols-1 gap-2">
            {EMAIL_TYPES.map(t => {
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`px-4 py-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${isSelected ? 'border-brand-primary bg-brand-primary' : 'border-text-muted bg-transparent'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <label className="text-sm font-semibold text-text-primary block">¿Sobre qué vamos a escribir?</label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Abrimos puertas al Bootcamp intensivo de desarrollo inmobiliario, es solo para 20 personas y se cierra el viernes a la medianoche."
              className="w-full flex-1 bg-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-4 bg-brand-primary hover:bg-brand-secondary disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-auto"
        >
          <Wand2 size={20} className={isGenerating ? "animate-pulse" : ""} />
          {isGenerating ? 'Enviando brief...' : 'Orquestar Flujo de Emails'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Mail size={18} className="text-brand-primary" />
            Flujo de Output
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll relative z-10 text-sm leading-relaxed text-text-primary">
          {output ? (
            <div className="markdown-content">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-elevated border border-border-subtle flex items-center justify-center shadow-lg">
                 <Mail size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Los correos requieren A/B Testing, alta empatía y saltos de carro como un marketer legendario.</p>
             </div>
          )}
          {isGenerating && (
            <span className="inline-block w-2 h-4 ml-1 bg-brand-primary animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
