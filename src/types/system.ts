export interface CpuCore {
  id: number;
  usage: number; // 0 - 100
}

export interface HardwareStats {
  cpu: {
    usage: number; // current %
    temp: number; // °C
    frequency: number; // GHz
    coresCount: number;
    cores: CpuCore[];
    history: number[];
    model: string;
  };
  ram: {
    totalGb: number;
    usedGb: number;
    freeGb: number;
    cachedGb: number;
    usagePercent: number;
    history: number[];
    speedMhz: number;
  };
  disk: {
    mainPartition: {
      letter: string;
      label: string;
      totalGb: number;
      usedGb: number;
      freeGb: number;
      usagePercent: number;
      type: string; // NVMe SSD, SATA SSD
      healthPercent: number;
      temp: number;
    };
    readSpeedMb: number;
    writeSpeedMb: number;
  };
  gpu: {
    name: string;
    usage: number; // %
    temp: number; // °C
    vramUsedGb: number;
    vramTotalGb: number;
    fanRpm: number;
  };
  network: {
    downloadSpeedKbps: number;
    uploadSpeedKbps: number;
    pingMs: number;
    adapterName: string;
  };
}

export type JunkCategory =
  | 'temp_files'
  | 'browser_cache'
  | 'recycle_bin'
  | 'crash_dumps'
  | 'thumbnails'
  | 'windows_update'
  | 'dns_cache';

export interface JunkItem {
  id: string;
  category: JunkCategory;
  categoryName: string;
  name: string;
  path: string;
  sizeBytes: number;
  selected: boolean;
  description: string;
  safeToClean: boolean;
}

export interface StartupApp {
  id: string;
  name: string;
  publisher: string;
  executablePath: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  bootDelaySeconds: number;
  enabled: boolean;
  category: string;
  icon: string;
}

export interface SystemProcess {
  pid: number;
  name: string;
  command: string;
  category: 'Sistema' | 'Segundo Plano' | 'Usuario' | 'Juego / Gráficos';
  cpuPercent: number;
  ramMb: number;
  diskMbPerSec: number;
  status: 'Activo' | 'Suspendido';
  priority: 'Baja' | 'Normal' | 'Alta' | 'Tiempo Real';
}

export interface RegistryIssue {
  id: string;
  keyPath: string;
  valueName: string;
  issueType:
    | 'DLL Compartida Faltante'
    | 'Extensión de Archivo Huérfana'
    | 'Ruta de Aplicación Inválida'
    | 'Desinstalador Obsoleto'
    | 'Servicio de Sistema Inactivo'
    | 'Componente ActiveX / COM Obsoleto';
  description: string;
  selected: boolean;
  risk: 'Seguro' | 'Revisar';
}

export interface SystemTweak {
  id: string;
  title: string;
  category: 'Rendimiento' | 'Privacidad y Telemetría' | 'Red y Conexión' | 'Almacenamiento';
  description: string;
  active: boolean;
  recommended: boolean;
  impactNote: string;
}
