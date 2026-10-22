import {
  Sparkles,
  Shield,
  Minus,
  Square,
  X,
  RotateCcw,
  Search,
} from 'lucide-react';

interface HeaderProps {
  currentTabName: string;
  osName: string;
  onQuickCleanClick: () => void;
  onPurgeRam: () => void;
  isPurgingRam: boolean;
  onOpenAuditModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabName,
  osName,
  onQuickCleanClick,
  onPurgeRam,
  isPurgingRam,
  onOpenAuditModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 select-none">
      {/* Top Window Titlebar (Simulated PC Desktop App Window Frame) */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">ApexClean Pro</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono">{osName}</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-2 text-slate-500">
          <button
            onClick={() => {
              const api = (window as unknown as { electronAPI?: { minimize: () => void } }).electronAPI;
              if (api?.minimize) api.minimize();
            }}
            className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-800 transition-colors"
            title="Minimizar"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              const api = (window as unknown as { electronAPI?: { maximize: () => void } }).electronAPI;
              if (api?.maximize) api.maximize();
            }}
            className="hover:text-slate-200 p-0.5 rounded hover:bg-slate-800 transition-colors"
            title="Maximizar"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => {
              const api = (window as unknown as { electronAPI?: { close: () => void } }).electronAPI;
              if (api?.close) api.close();
            }}
            className="hover:text-rose-400 p-0.5 rounded hover:bg-rose-950 transition-colors"
            title="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="text-slate-200 font-semibold">Sistema</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-medium">{currentTabName}</span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-3 shrink-0">
          {onOpenAuditModal && (
            <button
              onClick={onOpenAuditModal}
              className="px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-800/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              title="Escanear y auditar especificaciones reales de hardware"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analizar PC</span>
            </button>
          )}

          <button
            onClick={onPurgeRam}
            disabled={isPurgingRam}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
            title="Recorta el working-set de procesos inactivos"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isPurgingRam ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isPurgingRam ? 'Liberando...' : 'Liberar RAM'}</span>
          </button>

          <button
            onClick={onQuickCleanClick}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimización 1-Clic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
