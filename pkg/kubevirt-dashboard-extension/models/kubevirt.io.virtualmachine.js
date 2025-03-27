import SteveModel from '@shell/plugins/steve/steve-class';
import { get } from '@shell/utils/object';
import { findBy } from '@shell/utils/array';
import { POD, NODE } from '@shell/config/types';
import { VMI_RESOURCE_NAME } from '../constants';

export const OFF = 'Off';

const VMI_WAITING_MESSAGE = 'The virtual machine is waiting for resources to become available.';
const VM_ERROR = 'VM error';
const STOPPING = 'Stopping';
// const WAITING = 'Waiting';
const NOT_READY = 'Not Ready';
// const AGENT_CONNECTED = 'AgentConnected';

const PAUSED = 'Paused';
const PAUSED_VM_MODAL_MESSAGE =
  'This VM has been paused. If you wish to unpause it, please click the Unpause button below. For further details, please check with your system administrator.';

// const POD_STATUS_NOT_SCHEDULABLE = 'POD_NOT_SCHEDULABLE';
// const POD_STATUS_CONTAINER_FAILING = 'POD_CONTAINER_FAILING';
// eslint-disable-next-line no-unused-vars
// const POD_STATUS_NOT_READY = 'POD_NOT_READY';

// const POD_STATUS_FAILED = 'POD_FAILED';
// const POD_STATUS_CRASHLOOP_BACKOFF = 'POD_CRASHLOOP_BACKOFF';
// const POD_STATUS_UNKNOWN = 'POD_STATUS_UNKNOWN';

// const POD_STATUS_ALL_ERROR = [
//   POD_STATUS_NOT_SCHEDULABLE,
//   POD_STATUS_CONTAINER_FAILING,
//   POD_STATUS_FAILED,
//   POD_STATUS_CRASHLOOP_BACKOFF,
//   POD_STATUS_UNKNOWN,
// ];

const POD_STATUS_COMPLETED = 'POD_STATUS_COMPLETED';
const POD_STATUS_SUCCEEDED = 'POD_STATUS_SUCCEEDED';
const POD_STATUS_RUNNING = 'POD_STATUS_RUNNING';

const POD_STATUS_ALL_READY = [POD_STATUS_RUNNING, POD_STATUS_COMPLETED, POD_STATUS_SUCCEEDED];

const RunStrategy = {
  Always: 'Always',
  RerunOnFailure: 'RerunOnFailure',
  Halted: 'Halted',
  Manual: 'Manual',
};

const StateChangeRequest = {
  Start: 'Start',
  Stop: 'Stop',
};

const STARTING_MESSAGE =
  'This virtual machine will start shortly. Preparing storage, networking, and compute resources.';

const VMIPhase = {
  Pending: 'Pending',
  Scheduling: 'Scheduling',
  Scheduled: 'Scheduled',
  Running: 'Running',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  Unknown: 'Unknown',
};

const IgnoreMessages = ['pod has unbound immediate PersistentVolumeClaims'];

export default class VirtualMachine extends SteveModel {
  get canStart() {
    return this.spec.runStrategy === 'Halted' || this.spec.running === false;
  }

  get canStop() {
    return this.spec.runStrategy !== 'Halted' || this.spec.running === true;
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
    const node = this.$getters['byId'](NODE, vmi?.status?.nodeName);
    return node?.id;
  }

  get displayMemory() {
    return (
      this.spec.template.spec.domain.resources?.limits?.memory ||
      this.spec.template.spec.domain.resources?.requests?.memory ||
      this.spec.template.spec.domain.memory?.guest ||
      '0Gi'
    );
  }

  get networksName() {
    const interfaces = this.spec.template.spec.domain.devices?.interfaces || [];
    return interfaces.map((i) => i.name);
  }

  get podResource() {
    const podList = this.$getters['all'](POD);

    return podList.find((pod) => {
      return (
        this.vmi?.metadata?.name &&
        this.vmi?.metadata?.name === pod.metadata?.ownerReferences?.[0].name
      );
    });
  }

  get isVMExpectedRunning() {
    if (!this?.spec) {
      return false;
    }
    const { running = null, runStrategy = null } = this.spec;
    const conditions = this?.status?.conditions || [];

    if (running) {
      return true;
    }

    if (runStrategy !== null) {
      let changeRequests;

      switch (runStrategy) {
        case RunStrategy.Halted:
          return false;
        case RunStrategy.Always:
          return true;
        case RunStrategy.RerunOnFailure:
          if (
            this.status?.printableStatus === 'ErrorUnschedulable' &&
            conditions.find((C) => C.message && C.message.includes(IgnoreMessages))
          ) {
            return true;
          }

          return ['Starting', 'Running'].includes(this.status?.printableStatus);
        case RunStrategy.Manual:
        default:
          changeRequests = new Set(
            (this.status?.stateChangeRequests || []).map((chRequest) => chRequest?.action)
          );

          if (changeRequests.has(StateChangeRequest.Stop)) {
            return false;
          }
          if (changeRequests.has(StateChangeRequest.Start)) {
            return true;
          }

          if (changeRequests.size === 0) {
            return ['Starting', 'Running'].includes(this.status?.printableStatus);
          }

          return this.isVMCreated; // if there is no change request we can assume created is representing running (current and expected)
      }
    }

    return false;
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

  get isError() {
    const conditions = get(this.vmi, 'status.conditions');
    const vmiFailureCond = findBy(conditions, 'type', 'Failure');

    if (vmiFailureCond) {
      return { status: 'VMI error', detailedMessage: vmiFailureCond.message };
    }

    if ((this.vmi || this.isVMCreated) && this.podResource) {
      // const podStatus = this.podResource.getPodStatus;
      // if (POD_STATUS_ALL_ERROR.includes(podStatus?.status)) {
      //   return {
      //     ...podStatus,
      //     status: 'LAUNCHER_POD_ERROR',
      //     pod:    this.podResource,
      //   };
      // }
    }

    return this?.vmi?.status?.phase;
  }

  get isRunning() {
    const conditions = get(this.vmi, 'status.conditions');
    const isVMIReady = findBy(conditions, 'type', 'Ready')?.status === 'True';

    if (this.vmi?.status?.phase === VMIPhase.Running && isVMIReady) {
      return { status: VMIPhase.Running };
    }

    return null;
  }

  get isNotReady() {
    const conditions = get(this.vmi, 'status.conditions');
    const VMIReadyCondition = findBy(conditions, 'type', 'Ready');

    if (VMIReadyCondition?.status === 'False' && this.vmi?.status?.phase === VMIPhase.Running) {
      return { status: NOT_READY };
    }

    return null;
  }

  get isBeingStopped() {
    if (
      this &&
      !this.isVMExpectedRunning &&
      this.isVMCreated &&
      this.vmi?.status?.phase !== VMIPhase.Succeeded
    ) {
      return { status: STOPPING };
    }

    return null;
  }

  get isStarting() {
    if (this.isVMExpectedRunning && this.isVMCreated) {
      // created but not yet ready
      if (this.podResource) {
        const podStatus = this.podResource.getPodStatus;

        if (!POD_STATUS_ALL_READY.includes(podStatus?.status)) {
          return {
            ...podStatus,
            status: 'Starting',
            message: STARTING_MESSAGE,
            detailedMessage: podStatus?.message,
            pod: this.podResource,
          };
        }
      }

      return {
        status: 'Starting',
        message: STARTING_MESSAGE,
        pod: this.podResource,
      };
    }

    return null;
  }

  get isOff() {
    return !this.isVMExpectedRunning ? { status: OFF } : null;
  }

  get otherState() {
    const state = (this.vmi &&
      [VMIPhase.Scheduling, VMIPhase.Scheduled].includes(this.vmi?.status?.phase) && {
        status: 'Starting',
        message: STARTING_MESSAGE,
      }) ||
      (this.vmi &&
        this.vmi.status?.phase === VMIPhase.Pending && {
          status: 'VMI_WAITING',
          message: VMI_WAITING_MESSAGE,
        }) ||
      (this.vmi && this.vmi?.status?.phase === VMIPhase.Failed && { status: 'VMI_ERROR' }) ||
      (this.isVMExpectedRunning && !this.isVMCreated && { status: 'Pending' }) || {
        status: 'UNKNOWN',
      };

    return state;
  }

  get isVMCreated() {
    return !!this?.status?.created;
  }

  get getDataVolumeTemplates() {
    return get(this, 'spec.volumeClaimTemplates') === null ? [] : this.spec.volumeClaimTemplates;
  }

  get vmi() {
    return this.$getters['byId'](VMI_RESOURCE_NAME, this.id);
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
    return this.actualState;
  }
}
