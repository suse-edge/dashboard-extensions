import { ConfigureTypeOptions, HeaderOptions, IPlugin } from '@shell/core/types';
import { PRODUCT_NAME, ResourceNames } from './constants';
import { AGE, NAME, NAMESPACE, STATE } from '@shell/config/table-headers';
import {
  BROKER_JOBS_COUNT,
  BROKER_PODS_COUNT,
  CONFIGURATION_NAME,
  NODES,
  SHARED,
  INSTANCES_COUNT,
  CAPACITY,
  DISCOVERY_HANDLER_NAME,
} from './table-columns';

// This allows expanding ConfigureTypeFunction because isEditable and listGroups is not included
type ConfigureTypeFunction = (
  type: string,
  options: ConfigureTypeOptions & {
    isEditable?: boolean;
    listGroups?: any[]; // TODO(jtomasek): Add type for listGroups
  }
) => void;

export function init(plugin: IPlugin, store: any) {
  const { basicType, product, configureType, headers } = plugin.DSL(store, PRODUCT_NAME);

  product({
    inStore: 'cluster',
    showNamespaceFilter: true,
    ifHaveType: ResourceNames.CONFIGURATION,
  });

  basicType(Object.values(ResourceNames));

  (configureType as ConfigureTypeFunction)(ResourceNames.INSTANCE, {
    isCreatable: false,
    isRemovable: false,
    isEditable: false,
    listGroups: [
      {
        icon: 'icon-gear',
        value: 'configurationName',
        field: 'groupByConfigurationNameLabel',
        hideColumn: 'configurationName',
        tooltipKey: 'akri.resourceTable.groupBy.configurationName',
      },
    ],
  });

  const instanceTableHeaders: HeaderOptions[] = [
    STATE,
    NAME,
    NAMESPACE,
    CONFIGURATION_NAME,
    BROKER_PODS_COUNT,
    BROKER_JOBS_COUNT,
    SHARED,
    NODES,
    AGE,
  ];

  headers(ResourceNames.INSTANCE, instanceTableHeaders);

  const configurationTableHeaders: HeaderOptions[] = [
    STATE,
    NAME,
    NAMESPACE,
    DISCOVERY_HANDLER_NAME,
    INSTANCES_COUNT,
    CAPACITY,
  ];

  headers(ResourceNames.CONFIGURATION, configurationTableHeaders);
}
