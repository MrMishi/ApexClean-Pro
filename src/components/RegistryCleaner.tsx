import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  Wrench,
  Search,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { RegistryIssue } from '../types/system';

interface RegistryCleanerProps {
  issues: RegistryIssue[];
  onToggleIssue: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onFixIssues: (fixedIds: string[]) => void;
}

export const RegistryCleaner: React.FC<RegistryCleanerProps> = ({
  issues,
  onToggleIssue,
  onSelectAll,
  onFixIssues,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned' | 'fixing' | 'fixed'>('scanned');
  const [scanProgress, setScanProgress] = useState(100);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<RegistryIssue | null>(null);
  const [backupGenerated, setBackupGenerated] = useState(false);
  const [successReport, setSuccessReport] = useState<number | null>(null);

  const selectedIssues = issues.filter((i) => i.selected);
  const allSelected = issues.length > 0 && selectedIssues.length === issues.length;

  const handleStartScan = () => {
    setScanState('scanning');
    setScanProgress(0);
    setSuccessReport(null);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setScanState('scanned');
      }
    }, 120);
  };

  const handleDownloadBackup = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const regContent = `Windows Registry Editor Version 5.00\r\n\r\n; ApexClean Pro - Copia de Seguridad Automática del Registro\r\n; Fecha: ${new Date().toLocaleString()}\r\n\r\n` +
      issues.map((i) => `[${i.keyPath}]\r\n"${i.valueName}"=""\r\n`).join('\r\n');

    const blob = new Blob([regContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ApexClean_Registry_Backup_${timestamp}.reg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupGenerated(true);
  };

  const handleFixIssues = () => {
    if (selectedIssues.length === 0) return;

    setScanState('fixing');
    const count = selectedIssues.length;

    setTimeout(() => {
      const fixedIds = selectedIssues.map((i) => i.id);
      onFixIssues(fixedIds);
      setSuccessReport(count);
      setScanState('fixed');
    }, 1600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400">Respaldo .REG disponible</span>
            <span aria-hidden="true">·</span>
            <span>{issues.length} entradas detectadas</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Registro de Windows
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Corrige asociaciones rotas, referencias a archivos inexistentes y entradas residuales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{backupGenerated ? 'Respaldo Guardado' : 'Crear Respaldo (.reg)'}</span>
          </button>

          <button
            onClick={handleStartScan}
            disabled={scanState === 'scanning' || scanState === 'fixing'}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanState === 'scanning' ? 'animate-spin' : ''}`} />
            <span>{scanState === 'scanning' ? 'Analizando...' : 'Volver a Analizar'}</span>
          </button>

          <button
            onClick={handleFixIssues}
            disabled={selectedIssues.length === 0 || scanState === 'scanning' || scanState === 'fixing'}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>
              {scanState === 'fixing'
                ? 'Reparando...'
                : `Reparar (${selectedIssues.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">
            Protección de Integridad:
          </span>
          <p className="text-slate-400 mt-0.5">
            Solo se analizan claves huérfanas de programas desinstalados. Las claves de sistema permanecen intactas.
          </p>
        </div>
      </div>

      {/* Fixing In Progress */}
      {scanState === 'fixing' && (
        <div className="bg-slate-900 border border-blue-800/60 rounded-xl p-6 text-center space-y-3">
          <Wrench className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-100">
            Reparando claves seleccionadas...
          </h3>
          <p className="text-xs text-slate-400">
            Eliminando valores obsoletos en HKEY_CLASSES_ROOT y HKEY_LOCAL_MACHINE.
          </p>
        </div>
      )}

      {/* Success Notification */}
      {scanState === 'fixed' && successReport !== null && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300">
              Se repararon {successReport} inconsistencias en el registro.
            </span>
          </div>
          <button
            onClick={handleStartScan}
            className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded border border-emerald-700"
          >
            Nuevo Análisis
          </button>
        </div>
      )}

      {/* Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
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
              {selectedIssues.length} de {issues.length} problemas marcados para reparación
            </span>
          </div>
        </div>

        {/* Rows */}
        {issues.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-200">El registro se encuentra limpio y optimizado.</p>
            <p className="text-slate-500 mt-1">No se detectaron entradas huérfanas ni referencias rotas.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleIssue(issue.id)}
                    className="mt-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {issue.selected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 font-mono">
                        {issue.issueType}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                        {issue.risk}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-cyan-300 break-all bg-slate-950/80 p-1.5 rounded border border-slate-800/60">
                      {issue.keyPath}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">Valor: {issue.valueName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{issue.description}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => setSelectedIssueDetail(issue)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Examinar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Detalle de Entrada de Registro
              </h3>
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Tipo de Problema:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedIssueDetail.issueType}</p>
              </div>

              <div>
                <span className="text-slate-400">Ruta de Clave (Hive):</span>
                <p className="font-mono bg-slate-950 p-2 rounded border border-slate-800 text-cyan-300 select-all mt-0.5 break-all">
                  {selectedIssueDetail.keyPath}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Nombre del Valor:</span>
                <p className="font-mono text-slate-200 mt-0.5">{selectedIssueDetail.valueName}</p>
              </div>

              <div>
                <span className="text-slate-400">Acción Recomendada:</span>
                <p className="text-slate-300 mt-0.5">
                  Eliminar la clave huérfana de forma segura. Si alguna vez fuera requerida, se puede restablecer importando el archivo .REG de respaldo generado previamente.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedIssueDetail(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
