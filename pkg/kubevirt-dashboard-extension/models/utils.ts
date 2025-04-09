type cpuConfig = {
  cores?: number;
  sockets?: number;
  threads?: number;
};

// https://kubevirt.io/user-guide/compute/dedicated_cpu_resources/#requesting-dedicated-cpu-resources
export function calculateVCPU(cpu?: cpuConfig) {
  if (!cpu) return undefined;
  const { cores = 1, sockets = 1, threads = 1 } = cpu;
  return cores * sockets * threads;
}
