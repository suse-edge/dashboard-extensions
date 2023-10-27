import SteveModel from '@shell/plugins/steve/steve-class';
import { ResourceNames } from '../config/constants';

export default class Configuration extends SteveModel {
  get discoveryHandlerName() {
    return this.spec?.discoveryHandler?.name;
  }

  get instances() {
    const instances = this.$getters['all'](ResourceNames.INSTANCE);
    return instances.filter((instance) => instance.spec?.configurationName === this.name);
  }

  get instancesCount() {
    return this.instances.length;
  }

  get capacity() {
    return this.spec?.capacity;
  }
}
