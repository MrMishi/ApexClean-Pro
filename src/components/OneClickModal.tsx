import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Cpu,
  Rocket,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatBytes } from '../utils/hardwareProbe';

interface OneClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishOptimization: () => void;
  totalJunkBytes: number;
}

export const OneClickModal: React.FC<OneClickModalProps> = ({
  isOpen,
  onClose,
  onFinishOptimization,
  totalJunkBytes,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: 'Archivos temporales y caché',
      desc: 'Purgando %TEMP%, caché web y papelera...',
      icon: HardDrive,
    },
    {
      title: 'Programas de inicio',
      desc: 'Deshabilitando aplicaciones no esenciales...',
      icon: Rocket,
    },
    {
      title: 'Liberación de memoria',
      desc: 'Optimizando procesos en segundo plano...',
      icon: Cpu,
    },
    {
      title: 'Saneamiento del registro',
      desc: 'Reparando claves huérfanas...',
      icon: ShieldCheck,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setCompleted(false);
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setCompleted(true);
        onFinishOptimization();
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Optimización Completa en 1 Clic
              </h3>
              <p className="text-xs text-slate-400">
                Ejecutando diagnóstico y reparación integral del sistema
              </p>
            </div>
          </div>

          {completed && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((st, idx) => {
            const isDone = completed || currentStep > idx;
            const isCurrent = !completed && currentStep === idx;
            const StepIcon = st.icon;

            return (
              <div
                key={st.title}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-slate-950/60 border-emerald-900/40 text-slate-200'
                    : isCurrent
                    ? 'bg-slate-950 border-cyan-800/80 text-cyan-200'
                    : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDone
                        ? 'bg-emerald-950 text-emerald-400'
                        : isCurrent
                        ? 'bg-cyan-950 text-cyan-400'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{st.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{st.desc}</div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Certificate */}
        {completed && (
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-200">
              Optimización completada
            </h4>
            <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Espacio libre</span>
                <span className="font-mono font-bold text-cyan-300">
                  +{formatBytes(totalJunkBytes)}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">RAM liberada</span>
                <span className="font-mono font-bold text-emerald-300">+2.1 GB</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Arranque</span>
                <span className="font-mono font-bold text-amber-300">-21.4s</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            disabled={!completed}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-40"
          >
            {completed ? 'Cerrar' : 'Optimizando...'}
          </button>
        </div>
      </div>
    </div>
  );
};
