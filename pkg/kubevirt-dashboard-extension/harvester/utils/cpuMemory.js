// Adapted from harvester-ui-extension pkg/harvester/utils/cpuMemory.js
// The Harvester-only `harvesterhci.io/enableCPUAndMemoryHotplug` annotation is dropped in favour of
// `spec.domain.memory.maxGuest`, which is the generic KubeVirt signal for CPU/memory hotplug.
export function getVmCPUMemoryValues(vm) {
  if (!vm) {
    return {
      cpu:              null,
      memory:           null,
      isHotplugEnabled: false
    };
  }

  const domain = vm.spec?.template?.spec?.domain || {};
  const { sockets = 1, threads = 1, cores = null } = domain.cpu || {};

  return {
    cpu:              cores === null ? null : sockets * threads * cores,
    // `memory.guest` is the guest visible amount and is the only field set by instancetype backed
    // VMs and by `virtctl create vm`, so it wins over the (pod facing) `domain.resources` values.
    memory:           domain.memory?.guest || domain.resources?.limits?.memory || domain.resources?.requests?.memory || null,
    maxCpu:           domain.cpu?.maxSockets || 0,
    maxMemory:        domain.memory?.maxGuest || null,
    isHotplugEnabled: !!domain.memory?.maxGuest
  };
}
