import { HCI } from './harvester/types';
import VirtVm from './harvester/kubevirt.io.virtualmachine';
import { calculateVCPU } from './utils';
export default class VirtualMachine extends VirtVm {
  get availableActions() {
    const out = super._availableActions;

    const clone = out.find((action) => action.action === 'goToClone');

    if (clone) {
      clone.action = 'goToCloneVM';
    }

    return [
      {
        action: 'stopVM',
        enabled: !!this.canStop,
        icon: 'icon icon-close',
        label: this.t('kubevirt.action.stop'),
        bulkable: true,
      },
      {
        action: 'startVM',
        enabled: !!this.canStart,
        icon: 'icon icon-play',
        label: this.t('kubevirt.action.start'),
        bulkable: true,
      },
      {
        action: 'softrebootVM',
        enabled: !!this.canSoftReboot,
        icon: 'icon icon-pipeline',
        label: this.t('kubevirt.action.softreboot'),
        bulkable: true,
      },
      {
        action: 'pauseVM',
        enabled: !!this.canPause,
        icon: 'icon icon-pause',
        label: this.t('kubevirt.action.pause'),
        bulkable: true,
      },
      {
        action: 'unpauseVM',
        enabled: !!this.canUnpause,
        icon: 'icon icon-spinner',
        label: this.t('kubevirt.action.unpause'),
        bulkable: true,
      },
      ...out,
    ];
  }
  async doVMSubresourceActionGrowl(subresource, actionName, opt = {}) {
    const clusterId = this.$rootGetters['clusterId'];
    const url = `/k8s/clusters/${clusterId}/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/${subresource}/${this.metadata.name}/${actionName}`;
    try {
      return await this.$dispatch(`request`, {
        headers: { accept: '*/*' },
        method: 'PUT',
        url,
        ...opt,
      });
    } catch (err) {
      this.$dispatch(
        'growl/fromError',
        {
          title: this.$rootGetters['i18n/t']('generic.notification.title.error'),
          err: err.data || err,
        },
        { root: true }
      );
    }
  }

  startVM() {
    this.doVMSubresourceActionGrowl('virtualmachines', 'start');
  }

  stopVM() {
    this.doVMSubresourceActionGrowl('virtualmachines', 'stop');
  }

  softrebootVM() {
    this.doVMSubresourceActionGrowl('virtualmachineinstances', 'softreboot');
  }

  pauseVM() {
    this.doVMSubresourceActionGrowl('virtualmachineinstances', 'pause');
  }

  unpauseVM() {
    this.doVMSubresourceActionGrowl('virtualmachineinstances', 'unpause');
  }

  get canStart() {
    // NOTE: based on Harvester backend formatter: https://github.com/harvester/harvester/blob/master/pkg/api/vm/formatter.go#L192
    // and harvester-ui-extension https://github.com/harvester/harvester-ui-extension/blob/main/pkg/harvester/models/kubevirt.io.virtualmachine.js
    return !this.isStarting && !this.isRunning;
  }

  get canStop() {
    return !this.isBeingStopped && this.isRunning;
  }

  get canSoftReboot() {
    return this.canPause;
  }

  get canPause() {
    return !this.isPaused && this.isRunning;
  }

  get canUnpause() {
    return !this.isRunning && this.isPaused;
  }

  get vCPUs() {
    // https://kubevirt.io/user-guide/compute/dedicated_cpu_resources/#requesting-dedicated-cpu-resources
    const vmi = this.$getters['byId'](HCI.VMI, this.id);
    return (
      calculateVCPU(vmi?.spec?.domain?.cpu) ||
      calculateVCPU(this.spec.template?.spec?.domain?.cpu) ||
      this.spec.template?.spec?.domain?.resources?.requests?.cpu ||
      this.spec.template?.spec?.domain?.resources?.limits?.cpu
    );
  }
}
