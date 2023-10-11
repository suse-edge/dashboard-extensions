import SteveModel from '@shell/plugins/steve/steve-class';
import { escapeHtml } from '@shell/utils/string';
import { POD, WORKLOAD_TYPES } from '@shell/config/types';
import { AkriLabelKeys, ResourceNames } from '../config/constants';

export default class Instance extends SteveModel {
  // NOTE(jtomasek): autoimport of models using importTypes(plugin) requires the model files to be *.js not *.ts
  // spec!: {
  //   nodes: string[];
  // };

  get brokerPods() {
    return this.$getters['matching'](POD, `${AkriLabelKeys.INSTANCE}=${this.name}`);
  }

  get brokerPodsCount() {
    return this.brokerPods.length;
  }

  get brokerJobs() {
    return this.$getters['matching'](WORKLOAD_TYPES.JOB, `${AkriLabelKeys.INSTANCE}=${this.name}`);
  }

  get brokerJobsCount() {
    return this.brokerJobs.length;
  }

  get nodeNames() {
    return this.spec.nodes.join(', ');
  }

  get configurationDetailLocation() {
    const instanceLocation = this._detailLocation;
    return {
      name: instanceLocation.name,
      params: {
        ...instanceLocation.params,
        resource: ResourceNames.CONFIGURATION,
        id: this.spec.configurationName,
      },
    };
  }

  get groupByConfigurationNameLabel() {
    return this.$rootGetters['i18n/t']('akri.resourceTable.groupLabel.configuration', {
      name: escapeHtml(this.spec.configurationName),
    });
  }
}
