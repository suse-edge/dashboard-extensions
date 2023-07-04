import SteveModel from '@shell/plugins/steve/steve-class';

export default class VirtualMachineInstance extends SteveModel {
  get getVMIApiPath() {
    const clusterId = this.$rootGetters['clusterId'];

    if (this.$rootGetters['isMultiCluster']) {
      const prefix = `/k8s/clusters/${clusterId}`;

      return `${prefix}/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/virtualmachineinstances/${this.name}/vnc`;
    } else {
      return `/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/virtualmachineinstances/${this.name}/vnc`;
    }
  }

  get getSerialConsolePath() {
    const clusterId = this.$rootGetters['clusterId'];

    if (this.$rootGetters['isMultiCluster']) {
      const prefix = `/k8s/clusters/${clusterId}`;

      return `${prefix}/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/virtualmachineinstances/${this.name}/console`;
    } else {
      return `/apis/subresources.kubevirt.io/v1/namespaces/${this.metadata.namespace}/virtualmachineinstances/${this.name}/console`;
    }
  }
}
