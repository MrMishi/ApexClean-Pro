import React, { useState } from 'react';
import {
  Rocket,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { StartupApp } from '../types/system';

interface StartupManagerProps {
  apps: StartupApp[];
  onToggleApp: (id: string) => void;
  onApplyRecommended: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  biosTimeSeconds?: number;
}

export const StartupManager: React.FC<StartupManagerProps> = ({
  apps,
  onToggleApp,
  onApplyRecommended,
  onRefresh,
  isRefreshing = false,
  biosTimeSeconds = 5.9,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState<'Todos' | 'Alto' | 'Medio' | 'Bajo'>('Todos');
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  // Calculate Boot Metrics
  const baseKernelTime = 8.5; // Windows kernel & critical drivers boot
  const totalEnabledDelay = apps
    .filter((a) => a.enabled)
    .reduce((acc, a) => acc + a.bootDelaySeconds, 0);
  const currentBootTime = Number((baseKernelTime + totalEnabledDelay).toFixed(1));

  const initialAllEnabledDelay = apps.reduce((acc, a) => acc + a.bootDelaySeconds, 0);
  const worstCaseBootTime = Number((baseKernelTime + initialAllEnabledDelay).toFixed(1));

  const savedSeconds = Math.max(0, Number((worstCaseBootTime - currentBootTime).toFixed(1)));
  const percentageFaster = worstCaseBootTime > 0
    ? Math.round((savedSeconds / worstCaseBootTime) * 100)
    : 0;

  const handleApplyRecommended = () => {
    onApplyRecommended();
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3500);
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (impactFilter === 'Todos') return true;
    return app.impact === impactFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-mono">
              -{savedSeconds}s estimados
            </span>
            <span aria-hidden="true">·</span>
            <span>{apps.filter((a) => a.enabled).length} de {apps.length} activos</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Programas de Inicio
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Desactiva aplicaciones de inicio automático para agilizar la carga del escritorio.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 whitespace-nowrap disabled:opacity-50"
              title="Volver a escanear aplicaciones de arranque de Windows"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isRefreshing ? 'Escaneando...' : 'Actualizar'}</span>
            </button>
          )}

          <button
            onClick={handleApplyRecommended}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimización Recomendada</span>
          </button>
        </div>
      </div>

      {showAppliedToast && (
        <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-lg px-4 py-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            Se han deshabilitado los programas de alto impacto no esenciales.
          </span>
        </div>
      )}

      {/* Boot Speed Comparison Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Tiempo de Arranque
              </span>
              {biosTimeSeconds && (
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  BIOS: {biosTimeSeconds}s
                </span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono">
              {currentBootTime}s
            </div>
            <p className="text-xs text-slate-400">
              Carga total estimada hasta el escritorio listo.
            </p>
          </div>

          <div className="space-y-1 md:border-l md:border-r border-slate-800 md:px-5">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-emerald-400" />
              Aceleración
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {percentageFaster > 0 ? `+${percentageFaster}%` : 'Base'}
            </div>
            <p className="text-xs text-slate-400">
              {savedSeconds > 0
                ? `${savedSeconds}s más rápido que el estado inicial.`
                : 'Desactiva aplicaciones para acelerar.'}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estado</span>
              <span className={`font-mono font-semibold ${
                percentageFaster >= 40 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {percentageFaster >= 40 ? 'Rápido' : 'Mejorable'}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(30, 100 - (totalEnabledDelay / initialAllEnabledDelay) * 70))}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              {apps.filter((a) => a.enabled).length} de {apps.length} aplicaciones activas
            </div>
          </div>
        </div>
      </div>

      {/* Apps Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aplicación..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            {(['Todos', 'Alto', 'Medio', 'Bajo'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setImpactFilter(filter)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  impactFilter === filter
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="divide-y divide-slate-800/80">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">{app.name}</span>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      app.impact === 'Alto'
                        ? 'text-rose-400 bg-rose-950/40 border-rose-900/60'
                        : app.impact === 'Medio'
                        ? 'text-amber-400 bg-amber-950/40 border-amber-900/60'
                        : 'text-slate-400 bg-slate-950 border-slate-800'
                    }`}
                  >
                    Impacto {app.impact}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    +{app.bootDelaySeconds}s
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{app.publisher}</span>
                  <span aria-hidden="true">·</span>
                  <span>{app.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-xs font-mono text-[11px] text-slate-500">
                    {app.executablePath}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className={`text-xs font-medium ${app.enabled ? 'text-slate-200' : 'text-slate-500'}`}>
                  {app.enabled ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={() => onToggleApp(app.id)}
                  type="button"
                  role="switch"
                  aria-checked={app.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-hidden ${
                    app.enabled ? 'bg-cyan-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      app.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}

          {filteredApps.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No se encontraron aplicaciones con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
