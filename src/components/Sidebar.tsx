import React from 'react';
import {
  Activity,
  Trash2,
  Rocket,
  Cpu,
  ShieldCheck,
  Sliders,
  Shield,
  HardDrive,
} from 'lucide-react';
import { formatBytes } from '../utils/hardwareProbe';

export type TabId =
  | 'hardware'
  | 'cleaner'
  | 'startup'
  | 'processes'
  | 'registry'
  | 'optimizer';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  junkTotalBytes: number;
  registryIssuesCount: number;
  cpuTemp: number;
  diskFreeGb: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  junkTotalBytes,
  registryIssuesCount,
  cpuTemp,
  diskFreeGb,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ElementType; badge?: string }[] = [
    {
      id: 'hardware',
      label: 'Monitor de Hardware',
      icon: Activity,
    },
    {
      id: 'cleaner',
      label: 'Limpieza de Disco',
      icon: Trash2,
      badge: junkTotalBytes > 0 ? formatBytes(junkTotalBytes) : undefined,
    },
    {
      id: 'startup',
      label: 'Programas de Inicio',
      icon: Rocket,
    },
    {
      id: 'processes',
      label: 'Procesos y Memoria',
      icon: Cpu,
    },
    {
      id: 'registry',
      label: 'Registro de Windows',
      icon: ShieldCheck,
      badge: registryIssuesCount > 0 ? `${registryIssuesCount}` : undefined,
    },
    {
      id: 'optimizer',
      label: 'Ajustes del Sistema',
      icon: Sliders,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-100">
              ApexClean <span className="text-cyan-400">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              System Suite v4.2
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-cyan-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Health Box */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Estado</span>
            <span className="font-semibold text-emerald-400 font-mono">Óptimo</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Temp. CPU</span>
            <span className="font-mono text-slate-300">{cpuTemp}°C</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Disco C:</span>
            <span className="font-mono text-cyan-400 font-semibold">{diskFreeGb} GB libres</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
