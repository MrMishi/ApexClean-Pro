import React, { useState, useEffect } from 'react';
import {
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Search,
} from 'lucide-react';
import { JunkItem } from '../types/system';
import { formatBytes } from '../utils/hardwareProbe';

interface JunkCleanerProps {
  items: JunkItem[];
  onToggleItem: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onCleanItems: (cleanedIds: string[]) => void;
  onCleanSuccess?: (freedBytes: number) => void;
}

export const JunkCleaner: React.FC<JunkCleanerProps> = ({
  items,
  onToggleItem,
  onSelectAll,
  onCleanItems,
  onCleanSuccess,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned' | 'cleaning' | 'completed'>('scanned');
  const [scanProgress, setScanProgress] = useState(100);
  const [currentlyScanningPath, setCurrentlyScanningPath] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [inspectItem, setInspectItem] = useState<JunkItem | null>(null);
  const [cleanedSummary, setCleanedSummary] = useState<{ count: number; bytes: number } | null>(null);

  const selectedItems = items.filter((item) => item.selected);
  const totalSelectedBytes = selectedItems.reduce((acc, item) => acc + item.sizeBytes, 0);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // Handle Scanning Simulation
  const handleStartScan = (deep = false) => {
    setScanState('scanning');
    setScanProgress(0);
    setCleanedSummary(null);

    const pathsToScan = [
      'C:\\Users\\AppData\\Local\\Temp\\~tmp91823.tmp',
      'C:\\Windows\\SoftwareDistribution\\Download\\Cumulative-KB5039211',
      'C:\\Users\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache\\data_1',
      'C:\\$Recycle.Bin\\S-1-5-21-391820-1001\\$R1920BA.zip',
      'C:\\Windows\\Minidump\\MEMORY.DMP (Crash Log)',
      'C:\\Users\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_256.db',
      'C:\\Windows\\Prefetch\\FIREFOX.EXE-91A29D.pf',
      'Windows Sockets DNS Resolver Cache Tables',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const pct = Math.min(Math.round((step / pathsToScan.length) * 100), 100);
      setScanProgress(pct);
      setCurrentlyScanningPath(pathsToScan[step % pathsToScan.length]);

      if (step >= pathsToScan.length) {
        clearInterval(interval);
        setScanState('scanned');
      }
    }, deep ? 280 : 160);
  };

  // Handle Clean Execution
  const handleExecuteClean = () => {
    if (selectedItems.length === 0) return;

    setScanState('cleaning');
    const bytesFreed = totalSelectedBytes;
    const countFreed = selectedItems.length;

    setTimeout(() => {
      // Execute cleanup
      const idsToClean = selectedItems.map((i) => i.id);
      onCleanItems(idsToClean);
      setCleanedSummary({ count: countFreed, bytes: bytesFreed });
      setScanState('completed');
      if (onCleanSuccess) {
        onCleanSuccess(bytesFreed);
      }
    }, 1800);
  };

  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-cyan-400 font-mono">
              {formatBytes(totalSelectedBytes)} para liberar
            </span>
            <span aria-hidden="true">·</span>
            <span>{selectedItems.length} seleccionados</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Limpieza de Archivos Residuales
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Elimina temporales de usuario, cachés de navegación y descargas obsoletas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleStartScan(false)}
            disabled={scanState === 'scanning' || scanState === 'cleaning'}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanState === 'scanning' ? 'animate-spin' : ''}`} />
            <span>{scanState === 'scanning' ? 'Analizando...' : 'Volver a Analizar'}</span>
          </button>

          <button
            onClick={handleExecuteClean}
            disabled={selectedItems.length === 0 || scanState === 'scanning' || scanState === 'cleaning'}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {scanState === 'cleaning'
                ? 'Limpiando...'
                : `Limpiar ${formatBytes(totalSelectedBytes)}`}
            </span>
          </button>
        </div>
      </div>

      {/* Scanning Indicator */}
      {scanState === 'scanning' && (
        <div className="bg-slate-900 border border-cyan-800/60 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-medium flex items-center gap-2">
              <Search className="w-4 h-4 animate-spin text-cyan-400" />
              Analizando unidades del sistema...
            </span>
            <span className="font-mono text-cyan-400 font-bold">{scanProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-500 transition-all duration-150"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="text-xs font-mono text-slate-400 truncate">
            {currentlyScanningPath}
          </div>
        </div>
      )}

      {/* Cleaning in Progress Indicator */}
      {scanState === 'cleaning' && (
        <div className="bg-slate-900 border border-blue-800/60 rounded-xl p-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-100">
            Eliminando archivos seleccionados...
          </h3>
          <p className="text-xs text-slate-400">
            Purgando temporales y vaciando papelera.
          </p>
        </div>
      )}

      {/* Cleaned Completed Success Box */}
      {scanState === 'completed' && cleanedSummary && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-200">
                Limpieza completada
              </h4>
              <p className="text-xs text-emerald-400/80">
                Se liberaron{' '}
                <strong className="text-emerald-300 font-mono">
                  {formatBytes(cleanedSummary.bytes)}
                </strong>{' '}
                de almacenamiento en disco.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStartScan(false)}
            className="px-3 py-1.5 text-xs bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 rounded-lg transition-colors"
          >
            Nuevo Análisis
          </button>
        </div>
      )}

      {/* Main Cleaner Grid & Item Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectAll(!allSelected)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}</span>
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <span className="text-xs text-slate-400">
              {selectedItems.length} de {items.length} seleccionados
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveCategoryFilter('temp_files')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeCategoryFilter === 'temp_files'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Temporales
            </button>
            <button
              onClick={() => setActiveCategoryFilter('browser_cache')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeCategoryFilter === 'browser_cache'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Navegadores
            </button>
            <button
              onClick={() => setActiveCategoryFilter('recycle_bin')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                activeCategoryFilter === 'recycle_bin'
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Papelera
            </button>
          </div>
        </div>

        {/* Item Rows */}
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay elementos en esta categoría o ya han sido limpiados.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className="mt-0.5 sm:mt-0 text-slate-400 hover:text-white transition-colors"
                  >
                    {item.selected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">
                        {item.name}
                      </span>
                      {item.safeToClean && (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                          Seguro
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="truncate max-w-sm sm:max-w-md font-mono text-[11px]">
                        {item.path}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{item.categoryName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold font-mono text-slate-100">
                    {formatBytes(item.sizeBytes)}
                  </span>
                  <button
                    onClick={() => setInspectItem(item)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Detalles"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                Información del Elemento
              </h3>
              <button
                onClick={() => setInspectItem(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Elemento:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{inspectItem.name}</p>
              </div>

              <div>
                <span className="text-slate-400">Ruta:</span>
                <p className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-cyan-300 select-all mt-0.5 break-all">
                  {inspectItem.path}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Tamaño:</span>
                <p className="font-mono font-bold text-slate-100 mt-0.5">
                  {formatBytes(inspectItem.sizeBytes)}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Descripción:</span>
                <p className="text-slate-300 mt-0.5">{inspectItem.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
