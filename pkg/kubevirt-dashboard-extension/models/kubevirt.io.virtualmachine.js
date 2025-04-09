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
      ...out,
    ];
  }
  async doVMSubresourceActionGrowl(actionName, opt = {}) {
    const clusterId = this.$rootGetters['clusterId'];
    const url = `/k8s/clusters/${clusterId}/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/virtualmachines/${this.metadata.name}/${actionName}`;
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
    this.doVMSubresourceActionGrowl('start');
  }

  stopVM() {
    this.doVMSubresourceActionGrowl('stop');
  }

  get canStart() {
    // NOTE: based on Harvester backend formatter: https://github.com/harvester/harvester/blob/master/pkg/api/vm/formatter.go#L192
    // and harvester-ui-extension https://github.com/harvester/harvester-ui-extension/blob/main/pkg/harvester/models/kubevirt.io.virtualmachine.js
    return !(this.isStarting || this.isRunning);
  }

  get canStop() {
    return !(this.isBeingStopped || !this.isRunning);
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
