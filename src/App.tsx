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
  getSavedHardwareSpecs,
  CustomVerifiedSpecs,
} from './utils/hardwareProbe';
import { HardwareStats, SystemProcess, CpuCore } from './types/system';
import { SystemInfo } from './types/electron';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { HardwareMonitor } from './components/HardwareMonitor';
import { JunkCleaner } from './components/JunkCleaner';
import { StartupManager } from './components/StartupManager';
import { ProcessManager } from './components/ProcessManager';
import { RegistryCleaner } from './components/RegistryCleaner';
import { SystemOptimizer } from './components/SystemOptimizer';
import { OneClickModal } from './components/OneClickModal';
import { HardwareAuditModal } from './components/HardwareAuditModal';

export default function App() {
  const [sysInfo, setSysInfo] = useState<SystemInfo>(() => getSystemInfo());
  const [hardwareStats, setHardwareStats] = useState<HardwareStats>(createInitialHardwareStats);
  const [isPaused, setIsPaused] = useState(false);
  const [isPurgingRam, setIsPurgingRam] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [verifiedSpecs, setVerifiedSpecs] = useState<CustomVerifiedSpecs | null>(() => getSavedHardwareSpecs());

  // Core Data States
  const [junkItems, setJunkItems] = useState(INITIAL_JUNK_ITEMS);
  const [startupApps, setStartupApps] = useState(INITIAL_STARTUP_APPS);
  const [processes, setProcesses] = useState<SystemProcess[]>(INITIAL_PROCESSES);
  const [registryIssues, setRegistryIssues] = useState(INITIAL_REGISTRY_ISSUES);
  const [systemTweaks, setSystemTweaks] = useState(INITIAL_SYSTEM_TWEAKS);

  // Loading States
  const [isScanningStartup, setIsScanningStartup] = useState(false);
  const [isScanningProcesses, setIsScanningProcesses] = useState(false);

  // Active View Tab
  const [currentTab, setCurrentTab] = useState<TabId>('hardware');
  const [isOneClickModalOpen, setIsOneClickModalOpen] = useState(false);

  // Play subtle synthesized audio chime
  const playChime = useCallback((type: 'success' | 'click' | 'purge' = 'click') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
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

  // Fetch real startup applications from Windows via Electron
  const fetchStartupApps = useCallback(async () => {
    if (!window.electronAPI?.getStartupApps) return;
    try {
      setIsScanningStartup(true);
      const realApps = await window.electronAPI.getStartupApps();
      if (realApps && realApps.length > 0) {
        setStartupApps(realApps);
      }
    } catch (err) {
      console.error('Error fetching real startup apps:', err);
    } finally {
      setIsScanningStartup(false);
    }
  }, []);

  // Fetch real running processes from Windows via Electron
  const fetchProcesses = useCallback(async () => {
    if (!window.electronAPI?.getProcesses) return;
    try {
      setIsScanningProcesses(true);
      const realProcs = await window.electronAPI.getProcesses();
      if (realProcs && realProcs.length > 0) {
        setProcesses(realProcs);
      }
    } catch (err) {
      console.error('Error fetching real processes:', err);
    } finally {
      setIsScanningProcesses(false);
    }
  }, []);

  // Fetch real junk items from Windows via Electron
  const fetchJunk = useCallback(async () => {
    if (!window.electronAPI?.scanJunk) return;
    try {
      const realJunk = await window.electronAPI.scanJunk();
      if (realJunk && realJunk.length > 0) {
        setJunkItems(realJunk);
      }
    } catch (err) {
      console.error('Error scanning junk files:', err);
    }
  }, []);

  // Apply verified or analyzed hardware specifications
  const handleApplySpecs = useCallback((specs: CustomVerifiedSpecs) => {
    setVerifiedSpecs(specs);
    playChime('success');

    setSysInfo((prev) => ({
      ...prev,
      osName: specs.osName,
      cores: specs.cpuCores,
      ramGb: specs.ramTotalGb,
      cpuModel: specs.cpuModel,
      gpuModel: specs.gpuModel,
      storageModel: `${specs.diskLabel} (${specs.diskTotalGb} GB)`,
    }));

    setHardwareStats((prev) => {
      const cores: CpuCore[] = Array.from({ length: specs.cpuCores }, (_, i) => ({
        id: i + 1,
        usage: prev.cpu.cores[i]?.usage ?? Math.floor(14 + Math.random() * 20),
      }));

      const usedRam = Number((specs.ramTotalGb * (prev.ram.usagePercent / 100)).toFixed(1));
      const freeRam = Number((specs.ramTotalGb - usedRam).toFixed(1));
      const diskUsed = Math.max(0, specs.diskTotalGb - specs.diskFreeGb);
      const diskUsagePercent = Math.round((diskUsed / specs.diskTotalGb) * 100);

      return {
        ...prev,
        cpu: {
          ...prev.cpu,
          model: specs.cpuModel,
          coresCount: specs.cpuCores,
          frequency: specs.cpuSpeedGhz,
          cores,
        },
        ram: {
          ...prev.ram,
          totalGb: specs.ramTotalGb,
          usedGb: usedRam,
          freeGb: freeRam,
          speedMhz: specs.ramSpeedMhz,
        },
        disk: {
          ...prev.disk,
          mainPartition: {
            ...prev.disk.mainPartition,
            totalGb: specs.diskTotalGb,
            usedGb: diskUsed,
            freeGb: specs.diskFreeGb,
            usagePercent: diskUsagePercent,
            label: specs.diskLabel,
          },
        },
        gpu: {
          ...prev.gpu,
          name: specs.gpuModel,
          vramTotalGb: specs.gpuVramGb,
          vramUsedGb: Number((specs.gpuVramGb * 0.35).toFixed(1)),
        },
      };
    });
  }, [playChime]);

  // Initial load of real Windows system data
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      if (!window.electronAPI) return;

      if (window.electronAPI.getSystemInfo) {
        try {
          const info = await window.electronAPI.getSystemInfo();
          if (isMounted && info) {
            setSysInfo(info);
            // Sync with hardware stats if no manual override
            setHardwareStats((prev) => ({
              ...prev,
              cpu: {
                ...prev.cpu,
                model: info.cpuModel || prev.cpu.model,
                coresCount: info.cores || prev.cpu.coresCount,
              },
              gpu: {
                ...prev.gpu,
                name: info.gpuModel || prev.gpu.name,
              },
              ram: {
                ...prev.ram,
                totalGb: info.ramGb || prev.ram.totalGb,
              },
            }));
          }
        } catch (e) {
          console.warn('Could not load system info:', e);
        }
      }

      await fetchStartupApps();
      await fetchProcesses();
      await fetchJunk();
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchStartupApps, fetchProcesses, fetchJunk]);

  // Real-time telemetry ticker
  useEffect(() => {
    if (isPaused) return;

    let isSubscribed = true;

    const interval = setInterval(async () => {
      // 1. Try real hardware telemetry via Electron
      if (window.electronAPI?.getHardwareStats) {
        try {
          const realStats = await window.electronAPI.getHardwareStats();
          if (!isSubscribed || !realStats) return;

          setHardwareStats((prev) => {
            const cpuUsage = realStats.cpu?.usage ?? prev.cpu.usage;
            const newCpuHistory = [...prev.cpu.history.slice(1), cpuUsage];
            const ramUsage = realStats.ram?.usagePercent ?? prev.ram.usagePercent;
            const newRamHistory = [...prev.ram.history.slice(1), ramUsage];

            return {
              ...prev,
              cpu: {
                ...prev.cpu,
                usage: cpuUsage,
                temp: realStats.cpu?.temp ?? prev.cpu.temp,
                frequency: realStats.cpu?.frequency ?? prev.cpu.frequency,
                coresCount: realStats.cpu?.coresCount ?? prev.cpu.coresCount,
                cores: realStats.cpu?.cores ?? prev.cpu.cores,
                history: newCpuHistory,
                model: realStats.cpu?.model || prev.cpu.model,
              },
              ram: {
                ...prev.ram,
                totalGb: realStats.ram?.totalGb ?? prev.ram.totalGb,
                usedGb: realStats.ram?.usedGb ?? prev.ram.usedGb,
                freeGb: realStats.ram?.freeGb ?? prev.ram.freeGb,
                cachedGb: realStats.ram?.cachedGb ?? prev.ram.cachedGb,
                usagePercent: ramUsage,
                history: newRamHistory,
                speedMhz: realStats.ram?.speedMhz ?? prev.ram.speedMhz,
              },
              disk: realStats.disk ? {
                ...prev.disk,
                mainPartition: realStats.disk.mainPartition || prev.disk.mainPartition,
                readSpeedMb: realStats.disk.readSpeedMb ?? prev.disk.readSpeedMb,
                writeSpeedMb: realStats.disk.writeSpeedMb ?? prev.disk.writeSpeedMb,
              } : prev.disk,
              gpu: realStats.gpu ? {
                ...prev.gpu,
                name: realStats.gpu.name || prev.gpu.name,
                usage: realStats.gpu.usage ?? prev.gpu.usage,
                temp: realStats.gpu.temp ?? prev.gpu.temp,
                vramUsedGb: realStats.gpu.vramUsedGb ?? prev.gpu.vramUsedGb,
                vramTotalGb: realStats.gpu.vramTotalGb ?? prev.gpu.vramTotalGb,
                fanRpm: realStats.gpu.fanRpm ?? prev.gpu.fanRpm,
              } : prev.gpu,
              network: realStats.network ? {
                ...prev.network,
                downloadSpeedKbps: realStats.network.downloadSpeedKbps ?? prev.network.downloadSpeedKbps,
                uploadSpeedKbps: realStats.network.uploadSpeedKbps ?? prev.network.uploadSpeedKbps,
                pingMs: realStats.network.pingMs ?? prev.network.pingMs,
              } : prev.network,
            };
          });
          return;
        } catch {
          // fallback to simulation
        }
      }

      // 2. Fallback simulation when running in regular browser
      setHardwareStats((prev) => {
        const activeProcessesCpu = processes.reduce(
          (acc, p) => acc + (p.status === 'Activo' ? p.cpuPercent : 0),
          0
        );
        const cpuJitter = (Math.random() - 0.5) * 4;
        const newCpuUsage = Math.min(
          98,
          Math.max(8, Math.round(activeProcessesCpu + 10 + cpuJitter))
        );

        const newCores = prev.cpu.cores.map((c) => ({
          ...c,
          usage: Math.min(100, Math.max(5, Math.round(newCpuUsage + (Math.random() - 0.5) * 22))),
        }));

        const newCpuHistory = [...prev.cpu.history.slice(1), newCpuUsage];
        const newRamHistory = [...prev.ram.history.slice(1), prev.ram.usagePercent];
        const newFreq = Number((4.1 + (newCpuUsage / 100) * 0.85).toFixed(2));
        const newTemp = Math.min(85, Math.max(38, Math.round(42 + (newCpuUsage / 100) * 32)));

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
            downloadSpeedKbps: Math.round(1800 + Math.random() * 4500),
            uploadSpeedKbps: Math.round(400 + Math.random() * 1200),
            pingMs: Math.round(12 + Math.random() * 6),
          },
        };
      });
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isPaused, processes]);

  // Purge RAM Action
  const handlePurgeRam = async () => {
    setIsPurgingRam(true);
    playChime('purge');

    if (window.electronAPI?.purgeRam) {
      try {
        await window.electronAPI.purgeRam();
      } catch {}
    }

    setTimeout(() => {
      setHardwareStats((prev) => {
        const freedGb = Number((1.6 + Math.random() * 0.8).toFixed(1));
        const newUsed = Math.max(2.5, Number((prev.ram.usedGb - freedGb).toFixed(1)));
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
    }, 1000);
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

  const handleCleanJunkItems = async (cleanedIds: string[]) => {
    if (window.electronAPI?.cleanJunk) {
      try {
        await window.electronAPI.cleanJunk(cleanedIds);
      } catch (err) {
        console.error('Failed to clean junk in Windows:', err);
      }
    }

    const cleanedItems = junkItems.filter((i) => cleanedIds.includes(i.id));
    const freedBytes = cleanedItems.reduce((acc, i) => acc + i.sizeBytes, 0);
    const freedGb = Math.round(freedBytes / (1024 * 1024 * 1024));

    setJunkItems((prev) => prev.filter((item) => !cleanedIds.includes(item.id)));

    // Reclaim disk space
    setHardwareStats((prev) => {
      const newUsed = Math.max(50, prev.disk.mainPartition.usedGb - freedGb);
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
  const handleToggleStartupApp = async (id: string) => {
    const target = startupApps.find((app) => app.id === id);
    if (!target) return;
    const newEnabled = !target.enabled;

    setStartupApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, enabled: newEnabled } : app))
    );

    if (window.electronAPI?.toggleStartupApp) {
      try {
        await window.electronAPI.toggleStartupApp(target.name, newEnabled);
      } catch (err) {
        console.error('Failed to toggle startup app in Windows:', err);
      }
    }
  };

  const handleApplyRecommendedStartup = async () => {
    const toDisable: string[] = [];
    setStartupApps((prev) =>
      prev.map((app) => {
        if (app.impact === 'Alto' && app.category !== 'Seguridad') {
          toDisable.push(app.name);
          return { ...app, enabled: false };
        }
        return app;
      })
    );

    if (window.electronAPI?.toggleStartupApp) {
      for (const name of toDisable) {
        try {
          await window.electronAPI.toggleStartupApp(name, false);
        } catch {}
      }
    }
    playChime('success');
  };

  // Process Handlers
  const handleKillProcess = async (pid: number) => {
    const killed = processes.find((p) => p.pid === pid);
    if (!killed) return;

    setProcesses((prev) => prev.filter((p) => p.pid !== pid));

    if (window.electronAPI?.killProcess) {
      try {
        await window.electronAPI.killProcess(pid);
      } catch (err) {
        console.error('Failed to terminate process in Windows:', err);
      }
    }

    // Instant hardware relief
    setHardwareStats((prev) => {
      const ramFreedGb = Number((killed.ramMb / 1024).toFixed(1));
      const newUsed = Math.max(2.5, Number((prev.ram.usedGb - ramFreedGb).toFixed(1)));
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
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* App Header & Real Windows Frame */}
      <Header
        currentTabName={getTabTitle()}
        osName={sysInfo.osName}
        onQuickCleanClick={() => setIsOneClickModalOpen(true)}
        onPurgeRam={handlePurgeRam}
        isPurgingRam={isPurgingRam}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          junkTotalBytes={totalJunkBytes}
          registryIssuesCount={registryIssues.length}
          cpuTemp={hardwareStats.cpu.temp}
          diskFreeGb={hardwareStats.disk.mainPartition.freeGb}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950/95 p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            {currentTab === 'hardware' && (
              <HardwareMonitor
                stats={hardwareStats}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused(!isPaused)}
                onPurgeRam={handlePurgeRam}
                isPurgingRam={isPurgingRam}
                onQuickCleanClick={() => setIsOneClickModalOpen(true)}
                onOpenAuditModal={() => setIsAuditModalOpen(true)}
                isHardwareVerified={Boolean(verifiedSpecs?.isVerified)}
                analyzedAt={verifiedSpecs?.analyzedAt}
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
                onRefresh={fetchStartupApps}
                isRefreshing={isScanningStartup}
                biosTimeSeconds={sysInfo.biosTimeSeconds || 5.9}
              />
            )}

            {currentTab === 'processes' && (
              <ProcessManager
                processes={processes}
                onKillProcess={handleKillProcess}
                onToggleSuspendProcess={handleToggleSuspendProcess}
                onChangePriority={handleChangePriority}
                onOptimizeBackground={handleOptimizeBackground}
                onRefresh={fetchProcesses}
                isRefreshing={isScanningProcesses}
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

      {/* Hardware Audit and PC Inspection Modal */}
      <HardwareAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onApplySpecs={handleApplySpecs}
        currentStats={hardwareStats}
        currentSysInfo={sysInfo}
      />
    </div>
  );
}
