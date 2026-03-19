'use client';

import { useState } from 'react';
import ConsciousnessSelector from '@/components/ConsciousnessSelector';
import { ConsciousnessLevel } from '@/lib/types';
import { Wand2, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '@/lib/context';

const ANGLES = [
  { id: 'identidad', name: 'Identidad Tribal', description: 'Por qué "los nuestros" hacen esto y los demás no.' },
  { id: 'miedo', name: 'Miedo al Statu Quo', description: 'El peligro de quedarse igual que ahora.' },
  { id: 'future', name: 'Future Pacing', description: 'Visualizar la vida después de conseguir la transformación.' },
  { id: 'identidad_negativa', name: 'Enemigo Común', description: 'Contra quién estamos luchando y por qué es su culpa.' },
  { id: 'urgencia', name: 'Urgencia y Escasez', description: 'La razón por la que actuar HOY vale más que esperar mañana.' },
  { id: 'prueba_social', name: 'Prueba Social', description: 'Lo que dicen los que ya cruzaron al otro lado y lograron el resultado.' },
  { id: 'comparacion', name: 'Comparación Directa', description: 'Por qué somos la mejor opción frente a las alternativas del mercado.' },
];

export default function MatrixPage() {
  const { activeBrand } = useApp();
  const [level, setLevel] = useState<ConsciousnessLevel>(3);
  const [topic, setTopic] = useState('');
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['identidad', 'miedo']);

  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');

  const toggleAngle = (id: string) => {
    if (selectedAngles.includes(id)) {
      if (selectedAngles.length > 1) { // Prevents unchecking all 
        setSelectedAngles(prev => prev.filter(a => a !== id));
      }
    } else {
      setSelectedAngles(prev => [...prev, id]);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modulePrompt: `Genera una "Matriz Multi-Ángulo" (Matrix) sobre el tema/oferta: "${topic}". \nVas a generar un Copy Email/Post persuasivo de 200 palabras por CADA UNO de estos ángulos de venta seleccionados: ${selectedAngles.map(id => ANGLES.find(a => a.id === id)?.name).join(', ')}. \nSepara claramente con el título del Ángulo.`,
          consciousnessLevel: level,
          brandProfile: activeBrand,
          moduleType: 'matrix',
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
      setOutput("Error generando contenido.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-8">
      {/* Sidebar: Configurador / Brief */}
      <div className="w-[450px] flex flex-col gap-6 overflow-y-auto pr-4 subtle-scrollbar custom-scroll pb-12 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary font-inter mb-1">Matriz Multi-Ángulo</h1>
          <p className="text-text-secondary text-sm">Explora múltiples enfoques psicológicos de venta para un mismo producto.</p>
        </div>

        <ConsciousnessSelector selectedLevel={level} onSelectLevel={setLevel} />

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary block">Ángulos a Generar</label>
          <div className="grid grid-cols-2 gap-3">
            {ANGLES.map(a => {
              const isSelected = selectedAngles.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAngle(a.id)}
                  className={`p-3 rounded-lg border text-left transition-colors flex flex-col gap-1 ${
                    isSelected ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-surface hover:bg-elevated'
                  }`}
                >
                  <h5 className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{a.name}</h5>
                  <p className="text-[10px] text-text-muted mt-0.5">{a.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-text-primary flex justify-between">
            <span>¿Qué estás vendiendo o promocionando?</span>
            <span className="text-text-muted text-xs font-normal">Sujeto / Ángulo Core</span>
          </label>
          <div className="relative">
             <div className="absolute top-3 left-3 text-text-muted">
               <Type size={18} />
             </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ej: Un curso de copywriting por IA avanzado para dueños de agencia que no tienen tiempo de entrenar juniors."
              rows={4}
              className="w-full bg-elevated border border-border-subtle rounded-xl px-10 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-4 bg-brand-primary hover:bg-brand-secondary disabled:bg-surface disabled:text-text-muted disabled:border disabled:border-border-subtle text-white rounded-xl font-bold transition-all shadow-glow-indigo disabled:shadow-none flex items-center justify-center gap-2 mt-4"
        >
          <Wand2 size={20} className={isGenerating ? "animate-pulse" : ""} />
          {isGenerating ? 'Escribiendo Matriz...' : 'Generar Matriz Estratégica'}
        </button>
      </div>

      {/* Renderizado de AI */}
        <div className="flex-1 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none -translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 blur-[80px] rounded-full pointer-events-none translate-x-12 translate-y-12"></div>

        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 relative z-10">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Wand2 size={18} className="text-brand-primary" />
            Resultados del Matrix Engine
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
                 <Wand2 size={28} className="text-text-secondary opacity-50" />
               </div>
               <p>Descubre qué mensaje conecta profundo configurando tu base y seleccionando múltiples ángulos de respuesta directa.</p>
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
