'use client';

import { useState } from 'react';
import { ConsciousnessLevel } from '@/lib/types';
import { 
  EyeOff, 
  Search, 
  Target, 
  ShoppingCart, 
  CreditCard 
} from 'lucide-react';

const LEVELS = [
  {
    level: 1 as ConsciousnessLevel,
    name: "Inconsciente",
    icon: EyeOff,
    color: "text-text-muted",
    bgColor: "bg-surface",
    activeColor: "bg-text-muted/10 border-text-muted",
    tooltip: "No sabe que tiene el problema. Necesita historias, datos reveladores o un choque con la realidad.",
    example: "El secreto que los dentistas no quieren que sepas sobre el hilo dental."
  },
  {
    level: 2 as ConsciousnessLevel,
    name: "Consciente del Dolor",
    icon: Search,
    color: "text-accent-red",
    bgColor: "bg-surface",
    activeColor: "bg-accent-red/10 border-accent-red",
    tooltip: "Sabe que le duele, no sabe si hay cura. Necesita agitación del problema y empatía.",
    example: "¿Tus encías sangran al usar hilo dental? No es normal."
  },
  {
    level: 3 as ConsciousnessLevel,
    name: "Consciente de Solución",
    icon: Target,
    color: "text-brand-secondary",
    bgColor: "bg-surface",
    activeColor: "bg-brand-secondary/10 border-brand-secondary",
    tooltip: "Sabe que existen soluciones (hilos, cepillos), no te conoce. Necesita el Mecanismo Único.",
    example: "Por qué el hilo de agua es 300% más efectivo que el tradicional."
  },
  {
    level: 4 as ConsciousnessLevel,
    name: "Consciente del Producto",
    icon: ShoppingCart,
    color: "text-brand-primary",
    bgColor: "bg-surface",
    activeColor: "bg-brand-primary/10 border-brand-primary",
    tooltip: "Te conoce, pero compara y duda. Necesita prueba social innegable y ofertas.",
    example: "Mira cómo este hilo de agua eliminó el sarro de 10,000 pacientes."
  },
  {
    level: 5 as ConsciousnessLevel,
    name: "Más Consciente",
    icon: CreditCard,
    color: "text-accent-emerald",
    bgColor: "bg-surface",
    activeColor: "bg-accent-emerald/10 border-accent-emerald",
    tooltip: "Sabe qué vendes y lo quiere. Necesita urgencia, bonos o un CTA muy directo.",
    example: "50% de descuento en el WaterPik2000 solo por las próximas 24h."
  }
];

interface Props {
  selectedLevel: ConsciousnessLevel;
  onSelectLevel: (level: ConsciousnessLevel) => void;
}

export default function ConsciousnessSelector({ selectedLevel, onSelectLevel }: Props) {
  const [hoveredLevel, setHoveredLevel] = useState<ConsciousnessLevel | null>(null);

  const currentLevelData = LEVELS.find(l => l.level === (hoveredLevel || selectedLevel)) || LEVELS[1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          Nivel de Consciencia de la Audiencia
          <span className="text-xs font-normal text-text-muted border border-border-subtle rounded px-2 py-0.5 ml-2">
            Eugene Schwartz
          </span>
        </label>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((data) => {
          const Icon = data.icon;
          const isActive = selectedLevel === data.level;
          
          return (
            <button
              key={data.level}
              onClick={() => onSelectLevel(data.level)}
              onMouseEnter={() => setHoveredLevel(data.level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`relative h-14 rounded-lg flex items-center justify-center transition-all border
                ${isActive ? data.activeColor : `border-border-subtle ${data.bgColor} hover:bg-elevated opacity-70 hover:opacity-100`}
              `}
            >
              <div className={`flex flex-col items-center gap-1 ${isActive ? data.color : 'text-text-secondary'}`}>
                <Icon size={20} />
                <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap hidden sm:block">Nivel {data.level}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`p-4 rounded-xl border transition-colors ${
          selectedLevel === currentLevelData.level 
            ? currentLevelData.activeColor 
            : 'bg-surface border-border-subtle'
        }`}>
        <div className="flex flex-col gap-2">
          <h4 className={`text-sm font-bold flex items-center gap-2 ${currentLevelData.color}`}>
            <currentLevelData.icon size={16} />
            {currentLevelData.level}: {currentLevelData.name}
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            {currentLevelData.tooltip}
          </p>
          <div className="mt-2 text-xs">
            <span className="font-mono text-text-muted block mb-1">Ejemplo de Enfoque:</span>
            <span className="italic text-text-primary border-l-2 border-border-active pl-3 block">
              &quot;{currentLevelData.example}&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
