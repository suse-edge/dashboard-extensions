import SteveModel from '@shell/plugins/steve/steve-class';
import { get } from '@shell/utils/object';
import { findBy } from '@shell/utils/array';
import { VMI_RESOURCE_NAME, NODE_TYPE } from '../constants';

export const OFF = 'Off';
const PAUSED = 'Paused';
const PAUSED_VM_MODAL_MESSAGE =
  'This VM has been paused. If you wish to unpause it, please click the Unpause button below. For further details, please check with your system administrator.';
const VM_ERROR = 'VM error';

export default class VirtualMachine extends SteveModel {
  get canStart() {
    return !this.spec.runStrategy && !this.spec.running;
  }

  get canStop() {
    return !this.spec.runStrategy && this.spec.running;
  }

  get runStrategyLabel() {
    return this.spec.runStrategy || '-';
  }

  get cpuCores() {
    const vmi = this.$getters['byId'](VMI_RESOURCE_NAME, this.id);
    return vmi?.spec?.domain?.cpu?.cores || this.spec.template?.spec?.domain?.cpu?.cores;
  }

  get nodeName() {
    const vmi = this.$getters['byId'](VMI_RESOURCE_NAME, this.id);
    const node = this.$getters['byId'](NODE_TYPE, vmi?.status?.nodeName);
    return node?.id;
  }

  // -----------------------

  get displayMemory() {
    return (
      this.spec.template.spec.domain.resources?.limits?.memory ||
      this.spec.template.spec.domain.resources?.requests?.memory
    );
  }

  get networksName() {
    const interfaces = this.spec.template.spec.domain.devices?.interfaces || [];
    return interfaces.map((i) => i.name);
  }

  get isPaused() {
    const conditions = this.vmi?.status?.conditions || [];
    const isPause = conditions.filter((cond) => cond.type === PAUSED).length > 0;

    return isPause ? { status: PAUSED, message: PAUSED_VM_MODAL_MESSAGE } : null;
  }

  get isVMError() {
    const conditions = get(this, 'status.conditions');
    const vmFailureCond = findBy(conditions, 'type', 'Failure');

    if (vmFailureCond) {
      return {
        status: VM_ERROR,
        detailedMessage: vmFailureCond.message,
      };
    }

    return null;
  }

  get actualState() {
    // if (!this.restoreState()) {
    //   return 'Restoring';
    // }

    if (this?.metadata?.deletionTimestamp) {
      return 'Terminating';
    }

    if (!!this?.vmi?.migrationState && this.vmi.migrationState.status !== 'Failed') {
      return this.vmi.migrationState.status;
    }

    const state =
      this.isPaused?.status ||
      this.isVMError?.status ||
      this.isBeingStopped?.status ||
      this.isOff?.status ||
      this.isError?.status ||
      this.isRunning?.status ||
      this.isNotReady?.status ||
      this.isStarting?.status ||
      this.isWaitingForVMI?.state ||
      this.otherState?.status;

    return state;
  }

  get stateDisplay() {
    // TODO use actualState
    // return this.actualState;
    if (this.status?.printableStatus === 'Stopped') {
      return OFF;
    }
    return this.status?.printableStatus;
  }
}
