'use client';

import { useState } from 'react';
import { Wand2, LayoutTemplate } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const LANDING_TYPES = [
  { id: 'vsl', name: 'VSL / Webinar', desc: 'Para productos high-ticket.' },
  { id: 'lead_magnet', name: 'Squeeze Page', desc: 'Opt-in de emails corto.' },
  { id: 'sales_letter', name: 'Carta de Ventas Larga', desc: 'Texto persuasivo largo.' }
];

export default function LandingArchitectPage() {
  const [type, setType] = useState('vsl');
  const [topic, setTopic] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const cleanMarkdown = (text: string) =>
    text.replace(/^```(?:markdown)?\n?/i, '').replace(/```\s*$/, '').trim();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: `Genera la estructura y el copy completo de una Landing Page tipo "${LANDING_TYPES.find(t=>t.id===type)?.name}" para: "${topic}". \n\nEstructura esperada:\n1. Prehead & Head\n2. Subhead\n3. Agitación de Dolor y Problema (Schwartz)\n4. Introducción de la Solución (Mecanismo)\n5. Bullets Fascinations\n6. Oferta, Precio y Garantía\n7. CTA Final.\n\nFormatea cada sección claramente usando Markdown (## para títulos, **negrita** para énfasis, listas con guiones). IMPORTANTE: Responde SIEMPRE en el mismo idioma en que está escrito el brief del producto. Si el brief está en español, responde en español.`,
          consciousnessLevel: 3, // Default for landing
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
      setOutput("Error generando la estructura de la landing.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar: Configurador / Brief */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1 flex items-center gap-2">
            <LayoutTemplate size={24} className="text-brand-primary" />
            Landing Architect
          </h1>
          <p className="text-text-secondary text-sm">Construye páginas de conversión que imprimen dinero por ti.</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Objetivo / Tipo de Landing</label>
          <div className="flex flex-col gap-3">
            {LANDING_TYPES.map(t => {
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <h5 className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{t.name}</h5>
                  <p className="text-[10px] text-text-muted mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <label className="text-sm font-semibold text-text-primary flex justify-between">
            <span>¿De qué trata el producto u oferta?</span>
          </label>
          <div className="relative h-full flex flex-col">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Un Mastermind para dueños de agencias cansados de sobrevivir mes a mes con clientes de bajo ticket..."
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
          {isGenerating ? 'Estructurando Bloques...' : 'Orquestar Landing'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Wand2 size={18} className="text-brand-primary" />
            Landing Output
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll relative z-10 text-sm leading-relaxed text-text-primary">
          {output ? (
            <div className="markdown-content">
              <ReactMarkdown>{cleanMarkdown(output)}</ReactMarkdown>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-text-muted w-3/4 mx-auto text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-elevated border border-border-subtle flex items-center justify-center shadow-lg">
                 <LayoutTemplate size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Ingresa la oferta y se generará todo el wireframe persuasivo, listo para diseñar y montar en tu CMS favorito.</p>
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
