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

export const BROKER_PODS_COUNT: HeaderOptions = {
  name: 'brokerPodsCount',
  labelKey: 'akri.tableHeaders.brokerPodsCount',
  value: 'brokerPodsCount',
  sort: 'brokerPodsCount',
  formatter: 'AkriWorkloadDetailTabLink',
  formatterOpts: {
    fetchedResourceType: POD,
  },
};

export const BROKER_JOBS_COUNT: HeaderOptions = {
  name: 'brokerJobsCount',
  labelKey: 'akri.tableHeaders.brokerJobsCount',
  value: 'brokerJobsCount',
  sort: 'brokerJobsCount',
  formatter: 'AkriWorkloadDetailTabLink',
  formatterOpts: {
    fetchedResourceType: WORKLOAD_TYPES.JOB,
  },
};

export const SHARED: HeaderOptions = {
  name: 'shared',
  labelKey: 'akri.tableHeaders.shared',
  // getValue: (row) => row.spec?.shared,
  value: 'spec.shared',
  formatter: 'Checked',
  sort: 'spec.shared',
};

export const NODES: HeaderOptions = {
  name: 'nodes',
  labelKey: 'akri.tableHeaders.nodes',
  value: 'nodeNames',
  sort: 'nodeNames',
  search: 'nodeNames',
};

export const DISCOVERY_HANDLER_NAME: HeaderOptions = {
  name: 'discoveryHandlerName',
  labelKey: 'akri.tableHeaders.discoveryHandlerName',
  value: 'discoveryHandlerName',
  sort: 'discoveryHandlerName',
  search: 'discoveryHandlerName',
};

export const INSTANCES_COUNT: HeaderOptions = {
  name: 'instancesCount',
  labelKey: 'akri.tableHeaders.instancesCount',
  value: 'instancesCount',
  sort: 'instancesCount',
  formatter: 'InstancesCountLink',
};

export const CAPACITY: HeaderOptions = {
  name: 'capacity',
  labelKey: 'akri.tableHeaders.capacity',
  value: 'capacity',
  sort: 'capacity',
};
