import { HardwareStats, JunkItem, StartupApp, SystemProcess } from './system';

export interface SystemInfo {
  osName: string;
  cores: number;
  ramGb: number;
  architecture: string;
  cpuModel: string;
  gpuModel: string;
  storageModel: string;
  biosTimeSeconds?: number;
}

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isElectron?: boolean;

  getSystemInfo: () => Promise<SystemInfo>;
  getHardwareStats: () => Promise<Partial<HardwareStats>>;
  getStartupApps: () => Promise<StartupApp[]>;
  toggleStartupApp: (name: string, enabled: boolean) => Promise<boolean>;
  getProcesses: () => Promise<SystemProcess[]>;
  killProcess: (pid: number) => Promise<boolean>;
  scanJunk: () => Promise<JunkItem[]>;
  cleanJunk: (itemIds: string[]) => Promise<{ cleanedBytes: number }>;
  purgeRam: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
