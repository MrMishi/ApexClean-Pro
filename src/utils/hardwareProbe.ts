import { HardwareStats, CpuCore } from '../types/system';

export function getSystemInfo() {
  const userAgent = navigator.userAgent;
  let osName = 'Windows 11 Pro 64-bit (Build 26100)';
  if (userAgent.includes('Windows NT 10.0')) {
    osName = 'Windows 11 / 10 Pro 64-bit';
  } else if (userAgent.includes('Mac OS')) {
    osName = 'PC Emulation Mode (Host: macOS)';
  } else if (userAgent.includes('Linux')) {
    osName = 'Windows 11 Kernel Subsystem (Linux Core)';
  }

  const cores = navigator.hardwareConcurrency || 8;
  const devMem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 16;
  const ramGb = Math.max(devMem, 16);

  return {
    osName,
    cores,
    ramGb,
    architecture: 'x64 (Intel64 / AMD64)',
    cpuModel: cores >= 16 ? 'AMD Ryzen 9 7900X 12-Core / 24-Threads' : cores >= 8 ? 'Intel Core i7-13700K @ 3.40 GHz' : 'Intel Core i5-12400 @ 2.50 GHz',
    gpuModel: 'NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X',
    storageModel: 'Samsung 990 PRO NVMe M.2 SSD 1TB',
  };
}

export function createInitialHardwareStats(): HardwareStats {
  const sysInfo = getSystemInfo();
  const coresCount = sysInfo.cores;
  const cores: CpuCore[] = Array.from({ length: coresCount }, (_, i) => ({
    id: i + 1,
    usage: Math.floor(18 + Math.random() * 25),
  }));

  const initialCpuHistory = Array.from({ length: 30 }, () => Math.floor(20 + Math.random() * 20));
  const initialRamHistory = Array.from({ length: 30 }, () => Math.floor(48 + Math.random() * 6));

  const totalRam = sysInfo.ramGb;
  const usedRam = Number((totalRam * 0.54).toFixed(1));
  const freeRam = Number((totalRam - usedRam).toFixed(1));
  const cachedRam = Number((totalRam * 0.18).toFixed(1));

  return {
    cpu: {
      usage: 28,
      temp: 46,
      frequency: 4.25,
      coresCount,
      cores,
      history: initialCpuHistory,
      model: sysInfo.cpuModel,
    },
    ram: {
      totalGb: totalRam,
      usedGb: usedRam,
      freeGb: freeRam,
      cachedGb: cachedRam,
      usagePercent: Math.round((usedRam / totalRam) * 100),
      history: initialRamHistory,
      speedMhz: 5600,
    },
    disk: {
      mainPartition: {
        letter: 'C:',
        label: 'Sistema (NVMe)',
        totalGb: 931,
        usedGb: 684,
        freeGb: 247,
        usagePercent: 73,
        type: 'PCIe 4.0 NVMe SSD',
        healthPercent: 99,
        temp: 39,
      },
      readSpeedMb: 12.4,
      writeSpeedMb: 5.8,
    },
    gpu: {
      name: sysInfo.gpuModel,
      usage: 18,
      temp: 48,
      vramUsedGb: 3.2,
      vramTotalGb: 12.0,
      fanRpm: 1150,
    },
    network: {
      downloadSpeedKbps: 3420,
      uploadSpeedKbps: 840,
      pingMs: 14,
      adapterName: 'Intel Wi-Fi 6E AX211 160MHz',
    },
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
