import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Flame,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { HardwareStats } from '../types/system';
import { formatBytes } from '../utils/hardwareProbe';

interface HardwareMonitorProps {
  stats: HardwareStats;
  isPaused: boolean;
  onTogglePause: () => void;
  onPurgeRam: () => void;
  isPurgingRam: boolean;
  onQuickCleanClick: () => void;
  onOpenAuditModal: () => void;
  isHardwareVerified?: boolean;
  analyzedAt?: string;
}

export const HardwareMonitor: React.FC<HardwareMonitorProps> = ({
  stats,
  isPaused,
  onTogglePause,
  onPurgeRam,
  isPurgingRam,
  onQuickCleanClick,
  onOpenAuditModal,
  isHardwareVerified,
  analyzedAt,
}) => {
  const [selectedCoreView, setSelectedCoreView] = useState<'all' | 'summary'>('summary');
  const [notification, setNotification] = useState<string | null>(null);

  const handleRamPurge = () => {
    onPurgeRam();
    setNotification('Memoria de procesos inactivos liberada correctamente.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate SVG path for history sparkline
  const generateHistoryPath = (history: number[], width = 280, height = 60, maxVal = 100) => {
    if (!history || history.length < 2) return '';
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - (Math.min(val, maxVal) / maxVal) * (height - 8) - 4;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const cpuPath = generateHistoryPath(stats.cpu.history, 300, 50, 100);
  const ramPath = generateHistoryPath(stats.ram.history, 300, 50, 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Intervalo: 1.5s</span>
            <span aria-hidden="true">·</span>
            <span className={isPaused ? 'text-amber-400' : 'text-emerald-400'}>
              {isPaused ? 'Pausado' : 'En vivo'}
            </span>
            <span aria-hidden="true">·</span>
            {isHardwareVerified ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Especificaciones Verificadas {analyzedAt ? `(${analyzedAt})` : ''}
              </span>
            ) : (
              <span className="text-cyan-400">
                Hardware Autodetectado
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Rendimiento del Sistema
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Carga en tiempo real de procesador, memoria RAM, almacenamiento y adaptadores gráficos.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAuditModal}
            className="px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-700/70 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            title="Analiza y sincroniza las especificaciones reales de tu PC"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analizar PC</span>
          </button>

          <button
            onClick={onTogglePause}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 whitespace-nowrap"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <button
            onClick={handleRamPurge}
            disabled={isPurgingRam}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isPurgingRam ? 'animate-spin' : ''}`} />
            <span>{isPurgingRam ? 'Liberando...' : 'Liberar RAM'}</span>
          </button>

          <button
            onClick={onQuickCleanClick}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimización 1-Clic</span>
          </button>
        </div>
      </div>

      {/* Hardware Audit Summary Strip */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-200 flex items-center gap-2 flex-wrap">
              <span>Especificaciones de Hardware de tu Equipo</span>
              {isHardwareVerified ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                  ✓ Verificadas
                </span>
              ) : (
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800 font-mono">
                  Detección en tiempo real
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-2xl">
              CPU: <span className="text-slate-300 font-medium">{stats.cpu.model}</span> ({stats.cpu.coresCount} núcleos) · GPU: <span className="text-slate-300 font-medium">{stats.gpu.name}</span> · RAM: <span className="text-slate-300 font-medium">{stats.ram.totalGb} GB</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuditModal}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 whitespace-nowrap self-start sm:self-auto"
        >
          <Search className="w-3 h-3 text-cyan-400" />
          <span>{isHardwareVerified ? 'Re-auditar Hardware' : 'Escanear mi PC'}</span>
        </button>
      </div>

      {notification && (
        <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-lg px-4 py-2.5 text-xs text-cyan-300 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                CPU
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {stats.cpu.temp}°C
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {stats.cpu.usage}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                {stats.cpu.frequency.toFixed(2)} GHz
              </div>
            </div>

            {/* Sparkline */}
            <div className="mt-2 h-12 w-full overflow-hidden relative bg-slate-950/60 rounded border border-slate-800/80">
              <svg className="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none">
                <path
                  d={`${cpuPath} L 300,50 L 0,50 Z`}
                  fill="rgba(6, 182, 212, 0.15)"
                />
                <path
                  d={cpuPath}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-2">
            <span className="truncate flex-1 font-medium text-slate-300" title={stats.cpu.model}>
              {stats.cpu.model}
            </span>
            <span className="font-mono shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {stats.cpu.coresCount} núcleos
            </span>
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Memoria
              </span>
              <span className="text-xs font-mono text-slate-400">
                {stats.ram.speedMhz} MHz
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {stats.ram.usagePercent}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                {stats.ram.usedGb} / {stats.ram.totalGb} GB
              </div>
            </div>

            {/* Sparkline */}
            <div className="mt-2 h-12 w-full overflow-hidden relative bg-slate-950/60 rounded border border-slate-800/80">
              <svg className="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none">
                <path
                  d={`${ramPath} L 300,50 L 0,50 Z`}
                  fill="rgba(16, 185, 129, 0.15)"
                />
                <path
                  d={ramPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Caché: {stats.ram.cachedGb} GB</span>
            <span className="font-mono text-emerald-400">Libre: {stats.ram.freeGb} GB</span>
          </div>
        </div>

        {/* Disk Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Disco C:
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Salud {stats.disk.mainPartition.healthPercent}%
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {stats.disk.mainPartition.usagePercent}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                {stats.disk.mainPartition.freeGb} GB libres
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.disk.mainPartition.usagePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>L: {stats.disk.readSpeedMb} MB/s</span>
            <span>E: {stats.disk.writeSpeedMb} MB/s</span>
            <span className="text-slate-500">{stats.disk.mainPartition.temp}°C</span>
          </div>
        </div>

        {/* GPU Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-violet-400" />
                GPU
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {stats.gpu.temp}°C
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {stats.gpu.usage}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                VRAM: {stats.gpu.vramUsedGb} / {stats.gpu.vramTotalGb} GB
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.gpu.vramUsedGb / stats.gpu.vramTotalGb) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-2">
            <span className="truncate flex-1 font-medium text-slate-300" title={stats.gpu.name}>
              {stats.gpu.name}
            </span>
            <span className="font-mono text-slate-400 shrink-0">{stats.gpu.fanRpm} RPM</span>
          </div>
        </div>
      </div>

      {/* Two Column Detailed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Distribution & CPU Detail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Carga por Núcleos ({stats.cpu.coresCount} Hilos)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribución en paralelo entre hilos de procesamiento.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedCoreView('summary')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  selectedCoreView === 'summary'
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setSelectedCoreView('all')}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  selectedCoreView === 'all'
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.cpu.cores.map((core) => (
              <div
                key={core.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Núcleo #{core.id}</span>
                  <span
                    className={`font-mono font-semibold ${
                      core.usage > 70
                        ? 'text-rose-400'
                        : core.usage > 40
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {core.usage}%
                  </span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      core.usage > 70
                        ? 'bg-rose-500'
                        : core.usage > 40
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${core.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span>AVX-512, SSE4.2</span>
              <span aria-hidden="true">·</span>
              <span>Virtualización activa</span>
            </div>
            <span className="text-slate-500">Caché L3: 30 MB</span>
          </div>
        </div>

        {/* Network & Peripheral Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-emerald-400" />
              Adaptador de Red
            </h3>
            <p className="text-xs text-slate-400">
              {stats.network.adapterName}
            </p>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Descarga</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {(stats.network.downloadSpeedKbps / 1024).toFixed(2)} MB/s
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Subida</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {(stats.network.uploadSpeedKbps / 1024).toFixed(2)} MB/s
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Latencia</span>
                <span className="font-mono text-emerald-400 font-semibold">{stats.network.pingMs} ms</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estándar</span>
                <span className="font-mono text-slate-200">Wi-Fi 6 (802.11ax)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>DNS Principal: 1.1.1.1 (Cloudflare)</span>
            <span className="text-emerald-400">Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
