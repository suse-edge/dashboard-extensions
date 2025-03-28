import { Action } from '@rancher/shell/core/types';
import VirtualMachineModel from './models/kubevirt.io.virtualmachine';

// NOTE: a workaround for properties not defined on VirtualMachine's parent classes
type VirtualMachine = VirtualMachineModel & {
  spec: any;
  save: any;
};

const startVMs: Action['invoke'] = function (opts, resources: VirtualMachine[]) {
  resources.map((resource) => {
    delete resource.spec.running;
    resource.spec.runStrategy = 'Always';
    resource.save();
  });
};

const stopVMs: Action['invoke'] = function (opts, resources: VirtualMachine[]) {
  resources.map((resource) => {
    delete resource.spec.running;
    resource.spec.runStrategy = 'Halted';
    resource.save();
  });
};

const canStopVM: Action['enabled'] = (resource: VirtualMachine) => resource.canStop;
const canStartVM: Action['enabled'] = (resource: VirtualMachine) => resource.canStart;

export const startVMAction: Action = {
  label: 'Start',
  icon: 'icon icon-play',
  invoke: startVMs,
  enabled: canStartVM,
  multiple: true,
};

export const stopVMAction: Action = {
  label: 'Stop',
  icon: 'icon icon-close',
  invoke: stopVMs,
  enabled: canStopVM,
  multiple: true,
  // disabled: true,
};
