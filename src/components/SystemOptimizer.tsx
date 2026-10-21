import React, { useState } from 'react';
import {
  Sliders,
  Zap,
  CheckCircle2,
  Sparkles,
  Shield,
  Gauge,
  Wifi,
  HardDrive,
  Info,
} from 'lucide-react';
import { SystemTweak } from '../types/system';

interface SystemOptimizerProps {
  tweaks: SystemTweak[];
  onToggleTweak: (id: string) => void;
  onApplyAllRecommended: () => void;
}

export const SystemOptimizer: React.FC<SystemOptimizerProps> = ({
  tweaks,
  onToggleTweak,
  onApplyAllRecommended,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const activeCount = tweaks.filter((t) => t.active).length;

  const handleApplyRecommended = () => {
    onApplyAllRecommended();
    setToastMessage('Ajustes recomendados aplicados correctamente.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCategoryIcon = (category: SystemTweak['category']) => {
    switch (category) {
      case 'Rendimiento':
        return <Gauge className="w-4 h-4 text-cyan-400" />;
      case 'Red y Conexión':
        return <Wifi className="w-4 h-4 text-emerald-400" />;
      case 'Almacenamiento':
        return <HardDrive className="w-4 h-4 text-blue-400" />;
      case 'Privacidad y Telemetría':
        return <Shield className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-400 font-mono">
              {activeCount} de {tweaks.length} activos
            </span>
            <span aria-hidden="true">·</span>
            <span>Optimización global</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Ajustes del Sistema
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Perfiles de energía, reducción de telemetría y configuración de servicios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApplyRecommended}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Aplicar Recomendados</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-lg px-4 py-2.5 text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tweaks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tweaks.map((tweak) => (
          <div
            key={tweak.id}
            className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
              tweak.active
                ? 'border-cyan-900/60 shadow-xs'
                : 'border-slate-800 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  {getCategoryIcon(tweak.category)}
                  {tweak.category}
                </span>

                {tweak.recommended && (
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded">
                    Recomendado
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-100 mt-2">
                {tweak.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {tweak.description}
              </p>

              <div className="mt-3 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300">
                <span className="font-semibold text-cyan-300">Impacto: </span>
                <span>{tweak.impactNote}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className={`text-xs font-medium ${tweak.active ? 'text-cyan-400' : 'text-slate-500'}`}>
                {tweak.active ? 'Activo' : 'Inactivo'}
              </span>

              <button
                onClick={() => onToggleTweak(tweak.id)}
                type="button"
                role="switch"
                aria-checked={tweak.active}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                  tweak.active ? 'bg-cyan-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    tweak.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
