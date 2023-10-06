// import { ResourceNames } from './constants';
import Instance from '../models/akri.sh.instance';
import { HeaderOptions } from '@rancher/shell/core/types';

export const CONFIGURATION_NAME: HeaderOptions = {
  name: 'configurationName',
  labelKey: 'tableHeaders.configurationName',
  getValue: (row: Instance) => row.spec?.configurationName || '---',
  value: 'spec.configurationName',
  sort: 'spec.configurationName',
  search: 'spec.configurationName',
  formatter: 'LinkDetail',
  formatterOpts: {
    reference: 'configurationDetailLocation',
  },
};

export const SHARED = {
  name: 'shared',
  labelKey: 'tableHeaders.shared',
  // getValue: (row) => row.spec?.shared,
  value: 'spec.shared',
  formatter: 'Checked',
  sort: 'spec.shared',
};

export const NODES = {
  name: 'nodes',
  labelKey: 'tableHeaders.nodes',
  value: 'nodeNames',
  sort: 'nodeNames',
  search: 'nodeNames',
};
