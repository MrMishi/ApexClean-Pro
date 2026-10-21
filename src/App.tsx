import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_JUNK_ITEMS,
  INITIAL_STARTUP_APPS,
  INITIAL_PROCESSES,
  INITIAL_REGISTRY_ISSUES,
  INITIAL_SYSTEM_TWEAKS,
} from './utils/mockData';
import {
  createInitialHardwareStats,
  getSystemInfo,
} from './utils/hardwareProbe';
import { HardwareStats, SystemProcess } from './types/system';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { HardwareMonitor } from './components/HardwareMonitor';
import { JunkCleaner } from './components/JunkCleaner';
import { StartupManager } from './components/StartupManager';
import { ProcessManager } from './components/ProcessManager';
import { RegistryCleaner } from './components/RegistryCleaner';
import { SystemOptimizer } from './components/SystemOptimizer';
import { OneClickModal } from './components/OneClickModal';

export default function App() {
  const [sysInfo] = useState(getSystemInfo());
  const [hardwareStats, setHardwareStats] = useState<HardwareStats>(createInitialHardwareStats);
  const [isPaused, setIsPaused] = useState(false);
  const [isPurgingRam, setIsPurgingRam] = useState(false);

  // Core Data States
  const [junkItems, setJunkItems] = useState(INITIAL_JUNK_ITEMS);
  const [startupApps, setStartupApps] = useState(INITIAL_STARTUP_APPS);
  const [processes, setProcesses] = useState<SystemProcess[]>(INITIAL_PROCESSES);
  const [registryIssues, setRegistryIssues] = useState(INITIAL_REGISTRY_ISSUES);
  const [systemTweaks, setSystemTweaks] = useState(INITIAL_SYSTEM_TWEAKS);

  // Active View Tab
  const [currentTab, setCurrentTab] = useState<TabId>('hardware');
  const [isOneClickModalOpen, setIsOneClickModalOpen] = useState(false);

  // Play subtle synthesized audio chime
  const playChime = useCallback((type: 'success' | 'click' | 'purge' = 'click') => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'purge') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio not permitted or suspended, ignore safely
    }
  }, []);

  // Real-time telemetry ticker
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setHardwareStats((prev) => {
        // Base CPU from active processes
        const activeProcessesCpu = processes.reduce(
          (acc, p) => acc + (p.status === 'Activo' ? p.cpuPercent : 0),
          0
        );
        const cpuJitter = (Math.random() - 0.5) * 4;
        const newCpuUsage = Math.min(
          98,
          Math.max(8, Math.round(activeProcessesCpu + 10 + cpuJitter))
        );

        // Core usages
        const newCores = prev.cpu.cores.map((c) => ({
          ...c,
          usage: Math.min(100, Math.max(5, Math.round(newCpuUsage + (Math.random() - 0.5) * 22))),
        }));

        // History
        const newCpuHistory = [...prev.cpu.history.slice(1), newCpuUsage];
        const newRamHistory = [...prev.ram.history.slice(1), prev.ram.usagePercent];

        // Freq & Temp
        const newFreq = Number((4.1 + (newCpuUsage / 100) * 0.85).toFixed(2));
        const newTemp = Math.min(85, Math.max(38, Math.round(42 + (newCpuUsage / 100) * 32)));

        // Network jitter
        const newDl = Math.round(1800 + Math.random() * 4500);
        const newUl = Math.round(400 + Math.random() * 1200);

        return {
          ...prev,
          cpu: {
            ...prev.cpu,
            usage: newCpuUsage,
            temp: newTemp,
            frequency: newFreq,
            cores: newCores,
            history: newCpuHistory,
          },
          ram: {
            ...prev.ram,
            history: newRamHistory,
          },
          disk: {
            ...prev.disk,
            readSpeedMb: Number((4 + Math.random() * 22).toFixed(1)),
            writeSpeedMb: Number((1.5 + Math.random() * 12).toFixed(1)),
          },
          gpu: {
            ...prev.gpu,
            usage: Math.min(100, Math.max(5, Math.round(14 + Math.random() * 12))),
            temp: Math.min(75, Math.max(40, Math.round(46 + Math.random() * 4))),
          },
          network: {
            ...prev.network,
            downloadSpeedKbps: newDl,
            uploadSpeedKbps: newUl,
            pingMs: Math.round(12 + Math.random() * 6),
          },
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, processes]);

  // Purge RAM Action
  const handlePurgeRam = () => {
    setIsPurgingRam(true);
    playChime('purge');

    setTimeout(() => {
      setHardwareStats((prev) => {
        const freedGb = Number((1.6 + Math.random() * 0.8).toFixed(1));
        const newUsed = Math.max(3.2, Number((prev.ram.usedGb - freedGb).toFixed(1)));
        const newFree = Number((prev.ram.totalGb - newUsed).toFixed(1));
        const newCached = Number((prev.ram.cachedGb * 0.35).toFixed(1));
        const newPct = Math.round((newUsed / prev.ram.totalGb) * 100);

        return {
          ...prev,
          ram: {
            ...prev.ram,
            usedGb: newUsed,
            freeGb: newFree,
            cachedGb: newCached,
            usagePercent: newPct,
          },
        };
      });
      setIsPurgingRam(false);
      playChime('success');
    }, 1200);
  };

  // Junk Cleaner Handlers
  const handleToggleJunkItem = (id: string) => {
    setJunkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAllJunk = (select: boolean) => {
    setJunkItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleCleanJunkItems = (cleanedIds: string[]) => {
    const cleanedItems = junkItems.filter((i) => cleanedIds.includes(i.id));
    const freedBytes = cleanedItems.reduce((acc, i) => acc + i.sizeBytes, 0);
    const freedGb = Math.round(freedBytes / (1024 * 1024 * 1024));

    setJunkItems((prev) => prev.filter((item) => !cleanedIds.includes(item.id)));

    // Reclaim disk space
    setHardwareStats((prev) => {
      const newUsed = Math.max(100, prev.disk.mainPartition.usedGb - freedGb);
      const newFree = prev.disk.mainPartition.totalGb - newUsed;
      const newPct = Math.round((newUsed / prev.disk.mainPartition.totalGb) * 100);

      return {
        ...prev,
        disk: {
          ...prev.disk,
          mainPartition: {
            ...prev.disk.mainPartition,
            usedGb: newUsed,
            freeGb: newFree,
            usagePercent: newPct,
          },
        },
      };
    });

    playChime('success');
  };

  // Startup App Handlers
  const handleToggleStartupApp = (id: string) => {
    setStartupApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, enabled: !app.enabled } : app))
    );
  };

  const handleApplyRecommendedStartup = () => {
    setStartupApps((prev) =>
      prev.map((app) =>
        app.impact === 'Alto' && app.category !== 'Seguridad'
          ? { ...app, enabled: false }
          : app
      )
    );
    playChime('success');
  };

  // Process Handlers
  const handleKillProcess = (pid: number) => {
    const killed = processes.find((p) => p.pid === pid);
    if (!killed) return;

    setProcesses((prev) => prev.filter((p) => p.pid !== pid));

    // Instant hardware relief
    setHardwareStats((prev) => {
      const ramFreedGb = Number((killed.ramMb / 1024).toFixed(1));
      const newUsed = Math.max(3.0, Number((prev.ram.usedGb - ramFreedGb).toFixed(1)));
      return {
        ...prev,
        ram: {
          ...prev.ram,
          usedGb: newUsed,
          freeGb: Number((prev.ram.totalGb - newUsed).toFixed(1)),
          usagePercent: Math.round((newUsed / prev.ram.totalGb) * 100),
        },
        cpu: {
          ...prev.cpu,
          usage: Math.max(8, prev.cpu.usage - Math.round(killed.cpuPercent)),
        },
      };
    });

    playChime('click');
  };

  const handleToggleSuspendProcess = (pid: number) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.pid === pid
          ? { ...p, status: p.status === 'Activo' ? 'Suspendido' : 'Activo' }
          : p
      )
    );
  };

  const handleChangePriority = (pid: number, priority: SystemProcess['priority']) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, priority } : p))
    );
  };

  const handleOptimizeBackground = () => {
    // Suspend heavy idle background helpers
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.category === 'Segundo Plano' && (p.name.includes('Discord') || p.name.includes('Spotify') || p.name.includes('CreativeCloud'))) {
          return { ...p, priority: 'Baja', ramMb: Math.round(p.ramMb * 0.4) };
        }
        return p;
      })
    );
    handlePurgeRam();
  };

  // Registry Handlers
  const handleToggleRegistryIssue = (id: string) => {
    setRegistryIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const handleSelectAllRegistry = (select: boolean) => {
    setRegistryIssues((prev) => prev.map((i) => ({ ...i, selected: select })));
  };

  const handleFixRegistryIssues = (fixedIds: string[]) => {
    setRegistryIssues((prev) => prev.filter((i) => !fixedIds.includes(i.id)));
    playChime('success');
  };

  // System Tweaks Handlers
  const handleToggleTweak = (id: string) => {
    setSystemTweaks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    playChime('click');
  };

  const handleApplyAllRecommendedTweaks = () => {
    setSystemTweaks((prev) => prev.map((t) => ({ ...t, active: true })));
    playChime('success');
  };

  // Finish One-Click Optimization
  const handleFinishOneClickOptimization = () => {
    const allJunkIds = junkItems.map((j) => j.id);
    handleCleanJunkItems(allJunkIds);
    handleApplyRecommendedStartup();
    handlePurgeRam();
    const allRegIds = registryIssues.map((r) => r.id);
    handleFixRegistryIssues(allRegIds);
    handleApplyAllRecommendedTweaks();
    playChime('success');
  };

  const totalJunkBytes = junkItems.reduce((acc, i) => acc + i.sizeBytes, 0);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'hardware':
        return 'Monitor de Hardware';
      case 'cleaner':
        return 'Limpieza de Disco';
      case 'startup':
        return 'Programas de Inicio';
      case 'processes':
        return 'Procesos y Memoria';
      case 'registry':
        return 'Registro de Windows';
      case 'optimizer':
        return 'Ajustes del Sistema';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          playChime('click');
        }}
        junkTotalBytes={totalJunkBytes}
        registryIssuesCount={registryIssues.length}
        cpuTemp={hardwareStats.cpu.temp}
        diskFreeGb={hardwareStats.disk.mainPartition.freeGb}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTabName={getTabTitle()}
          osName={sysInfo.osName}
          onQuickCleanClick={() => setIsOneClickModalOpen(true)}
          onPurgeRam={handlePurgeRam}
          isPurgingRam={isPurgingRam}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'hardware' && (
              <HardwareMonitor
                stats={hardwareStats}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused(!isPaused)}
                onPurgeRam={handlePurgeRam}
                isPurgingRam={isPurgingRam}
                onQuickCleanClick={() => setIsOneClickModalOpen(true)}
              />
            )}

            {currentTab === 'cleaner' && (
              <JunkCleaner
                items={junkItems}
                onToggleItem={handleToggleJunkItem}
                onSelectAll={handleSelectAllJunk}
                onCleanItems={handleCleanJunkItems}
                onCleanSuccess={() => playChime('success')}
              />
            )}

            {currentTab === 'startup' && (
              <StartupManager
                apps={startupApps}
                onToggleApp={handleToggleStartupApp}
                onApplyRecommended={handleApplyRecommendedStartup}
              />
            )}

            {currentTab === 'processes' && (
              <ProcessManager
                processes={processes}
                onKillProcess={handleKillProcess}
                onToggleSuspendProcess={handleToggleSuspendProcess}
                onChangePriority={handleChangePriority}
                onOptimizeBackground={handleOptimizeBackground}
              />
            )}

            {currentTab === 'registry' && (
              <RegistryCleaner
                issues={registryIssues}
                onToggleIssue={handleToggleRegistryIssue}
                onSelectAll={handleSelectAllRegistry}
                onFixIssues={handleFixRegistryIssues}
              />
            )}

            {currentTab === 'optimizer' && (
              <SystemOptimizer
                tweaks={systemTweaks}
                onToggleTweak={handleToggleTweak}
                onApplyAllRecommended={handleApplyAllRecommendedTweaks}
              />
            )}
          </div>
        </main>
      </div>

      {/* 1-Click Comprehensive Optimization Modal */}
      <OneClickModal
        isOpen={isOneClickModalOpen}
        onClose={() => setIsOneClickModalOpen(false)}
        onFinishOptimization={handleFinishOneClickOptimization}
        totalJunkBytes={totalJunkBytes}
      />
    </div>
  );
}
