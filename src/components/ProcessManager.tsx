import React, { useState } from 'react';
import {
  Activity,
  XCircle,
  PauseCircle,
  PlayCircle,
  Zap,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { SystemProcess } from '../types/system';

interface ProcessManagerProps {
  processes: SystemProcess[];
  onKillProcess: (pid: number) => void;
  onToggleSuspendProcess: (pid: number) => void;
  onChangePriority: (pid: number, priority: SystemProcess['priority']) => void;
  onOptimizeBackground: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ProcessManager: React.FC<ProcessManagerProps> = ({
  processes,
  onKillProcess,
  onToggleSuspendProcess,
  onChangePriority,
  onOptimizeBackground,
  onRefresh,
  isRefreshing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | 'Segundo Plano' | 'Usuario' | 'Sistema' | 'Consumo Alto'>('Todos');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalRamConsumed = processes.reduce((acc, p) => acc + (p.status === 'Activo' ? p.ramMb : 0), 0);
  const totalCpuConsumed = processes.reduce((acc, p) => acc + (p.status === 'Activo' ? p.cpuPercent : 0), 0);

  const handleTurboOptimize = () => {
    onOptimizeBackground();
    setToastMessage('Modo Turbo activado: memoria liberada de procesos secundarios.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProcesses = processes.filter((proc) => {
    const matchesSearch =
      proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.pid.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (categoryFilter === 'Todos') return true;
    if (categoryFilter === 'Consumo Alto') return proc.ramMb > 400 || proc.cpuPercent > 3.0;
    return proc.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-400 font-mono">
              {processes.length} procesos
            </span>
            <span aria-hidden="true">·</span>
            <span>{(totalRamConsumed / 1024).toFixed(1)} GB en uso</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Procesos y Memoria
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Inspecciona el consumo de recursos, finaliza tareas o ajusta prioridades.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 whitespace-nowrap disabled:opacity-50"
              title="Volver a escanear procesos de Windows"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isRefreshing ? 'Escaneando...' : 'Actualizar'}</span>
            </button>
          )}

          <button
            onClick={handleTurboOptimize}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Modo Turbo</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-lg px-4 py-2.5 text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Procesos</span>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            {processes.length}
          </div>
          <span className="text-[11px] text-slate-500">
            {processes.filter((p) => p.status === 'Activo').length} activos
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">CPU</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {totalCpuConsumed.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-500">Carga total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Memoria</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {(totalRamConsumed / 1024).toFixed(2)} GB
          </div>
          <span className="text-[11px] text-slate-500">Física ocupada</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Segundo Plano</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {processes.filter((p) => p.category === 'Segundo Plano').length}
          </div>
          <span className="text-[11px] text-slate-500">Servicios activos</span>
        </div>
      </div>

      {/* Process Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o PID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto self-start sm:self-auto">
            {(['Todos', 'Consumo Alto', 'Segundo Plano', 'Usuario', 'Sistema'] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                    categoryFilter === filter
                      ? 'bg-slate-800 text-slate-100 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        {/* Process Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">Nombre del Proceso</div>
          <div className="col-span-2 text-right">PID / Tipo</div>
          <div className="col-span-2 text-right">CPU %</div>
          <div className="col-span-2 text-right">Memoria (RAM)</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800/80">
          {filteredProcesses.map((proc) => {
            const isSelected = selectedPid === proc.pid;
            const isSuspended = proc.status === 'Suspendido';

            return (
              <div
                key={proc.pid}
                onClick={() => setSelectedPid(isSelected ? null : proc.pid)}
                className={`p-3.5 sm:px-4 sm:py-3 transition-colors cursor-pointer flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3 ${
                  isSelected
                    ? 'bg-slate-800/70 border-l-2 border-l-cyan-400'
                    : 'hover:bg-slate-800/30'
                } ${isSuspended ? 'opacity-60' : ''}`}
              >
                {/* Name */}
                <div className="sm:col-span-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-slate-700" />
                  <div>
                    <div className="text-xs font-semibold text-slate-100 font-mono">
                      {proc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {proc.command}
                    </div>
                  </div>
                </div>

                {/* PID & Category */}
                <div className="sm:col-span-2 sm:text-right flex items-center sm:justify-end gap-2 text-xs">
                  <span className="font-mono text-slate-400">PID {proc.pid}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{proc.category}</span>
                </div>

                {/* CPU */}
                <div className="sm:col-span-2 sm:text-right flex sm:block items-center justify-between text-xs">
                  <span className="sm:hidden text-slate-500">CPU:</span>
                  <span
                    className={`font-mono font-semibold ${
                      proc.cpuPercent > 5
                        ? 'text-rose-400'
                        : proc.cpuPercent > 2
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {proc.cpuPercent.toFixed(1)}%
                  </span>
                </div>

                {/* RAM */}
                <div className="sm:col-span-2 sm:text-right flex sm:block items-center justify-between text-xs">
                  <span className="sm:hidden text-slate-500">RAM:</span>
                  <span className="font-mono text-slate-200">
                    {proc.ramMb} MB
                  </span>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 sm:text-right flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSuspendProcess(proc.pid);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                    title={isSuspended ? 'Reanudar proceso' : 'Suspender temporalmente'}
                  >
                    {isSuspended ? (
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <PauseCircle className="w-4 h-4" />
                    )}
                  </button>

                  <select
                    value={proc.priority}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onChangePriority(proc.pid, e.target.value as SystemProcess['priority'])
                    }
                    className="bg-slate-950 text-slate-300 border border-slate-800 text-[11px] rounded px-1.5 py-1 focus:outline-hidden"
                    title="Cambiar prioridad de CPU"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                  </select>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onKillProcess(proc.pid);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                    title="Finalizar tarea inmediatamente"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProcesses.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No se encontraron procesos activos coincidentes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
