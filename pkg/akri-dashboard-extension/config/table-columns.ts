// import { ResourceNames } from './constants';
import Instance from '../models/akri.sh.instance';
import { HeaderOptions } from '@rancher/shell/core/types';
import { POD, WORKLOAD_TYPES } from '@shell/config/types';

export const CONFIGURATION_NAME: HeaderOptions = {
  name: 'configurationName',
  labelKey: 'akri.tableHeaders.configurationName',
  getValue: (row: Instance) => row.spec?.configurationName || '---',
  value: 'spec.configurationName',
  sort: 'spec.configurationName',
  search: 'spec.configurationName',
  formatter: 'LinkDetail',
  formatterOpts: {
    reference: 'configurationDetailLocation',
  },
};

export const BROKER_PODS_COUNT = {
  name: 'brokerPodsCount',
  labelKey: 'akri.tableHeaders.brokerPodsCount',
  value: 'brokerPodsCount',
  sort: 'brokerPodsCount',
  formatter: 'AkriWorkloadDetailTabLink',
  formatterOpts: {
    fetchedResourceType: POD,
  },
};

export const BROKER_JOBS_COUNT = {
  name: 'brokerJobsCount',
  labelKey: 'akri.tableHeaders.brokerJobsCount',
  value: 'brokerJobsCount',
  sort: 'brokerJobsCount',
  formatter: 'AkriWorkloadDetailTabLink',
  formatterOpts: {
    fetchedResourceType: WORKLOAD_TYPES.JOB,
  },
};

export const SHARED = {
  name: 'shared',
  labelKey: 'akri.tableHeaders.shared',
  // getValue: (row) => row.spec?.shared,
  value: 'spec.shared',
  formatter: 'Checked',
  sort: 'spec.shared',
};

export const NODES = {
  name: 'nodes',
  labelKey: 'akri.tableHeaders.nodes',
  value: 'nodeNames',
  sort: 'nodeNames',
  search: 'nodeNames',
};
