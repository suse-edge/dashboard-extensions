import SteveModel from '@shell/plugins/steve/steve-class';
import { escapeHtml } from '@shell/utils/string';
import { ResourceNames } from '../config/constants';

export default class Instance extends SteveModel {
  // NOTE(jtomasek): autoimport of models using importTypes(plugin) requires the model files to be *.js not *.ts
  // spec!: {
  //   nodes: string[];
  // };

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

  get groupByConfigurationName() {
    return this.$rootGetters['i18n/t']('resourceTable.groupLabel.configuration', {
      name: escapeHtml(this.spec.configurationName),
    });
  }
}
