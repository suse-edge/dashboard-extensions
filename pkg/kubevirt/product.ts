import { IPlugin } from '@shell/core/types';
// import { STATE, NAME, NAMESPACE, AGE, STATUS } from '@shell/config/table-headers';
import {
  KUBEVIRT_RESOURCE_NAME,
  PRODUCT_NAME,
  VMI_RESOURCE_NAME,
  VM_RESOURCE_NAME,
} from './constants';

export function init(plugin: IPlugin, store: any) {
  const { basicType, product, mapGroup } = plugin.DSL(store, PRODUCT_NAME);

  // top level product
  // product({
  //   icon: 'gear',
  //   inStore: 'management',
  //   weight: 100,
  // });

  // cluster level product
  product({
    inStore: 'cluster',
    showNamespaceFilter: true,
    ifHaveType: KUBEVIRT_RESOURCE_NAME,
  });

  // basicType([KUBEVIRT_RESOURCE_NAME, VM_RESOURCE_NAME, VMI_RESOURCE_NAME], 'workload');
  basicType([KUBEVIRT_RESOURCE_NAME, VM_RESOURCE_NAME, VMI_RESOURCE_NAME]);

  // configureType(KUBEVIRT_RESOURCE_NAME, {
  //   displayName: 'Virtual Machines',
  //   isCreatable: true,
  //   isRemovable: true,
  //   showAge: true,
  //   showState: true,
  //   canYaml: true,
  //   customRoute: {
  //     name: `${YOUR_PRODUCT_NAME}-c-cluster-resource`,
  //     params: {
  //       product: YOUR_PRODUCT_NAME,
  //       cluster: BLANK_CLUSTER,
  //       resource: YOUR_K8S_RESOURCE_NAME,
  //     },
  //   },
  // });

  // const UI_PLUGIN = 'catalog.cattle.io.uiplugin';

  // mapGroup('workload', 'Workloads'); // the label should be translated
  mapGroup('kubevirt', 'Virtual Machines');

  // headers(VM_RESOURCE_NAME, [
  //   STATE,
  //   {
  //     ...NAME,
  //     width: 300,
  //   },
  //   NAMESPACE,
  //   {
  //     name: 'CPU',
  //     label: 'CPU',
  //     sort: ['spec.template.spec.domain.cpu.cores'],
  //     value: 'spec.template.spec.domain.cpu.cores',
  //     align: 'center',
  //     dashIfEmpty: true,
  //   },
  //   {
  //     name: 'Memory',
  //     value: 'displayMemory',
  //     sort: ['memorySort'],
  //     align: 'center',
  //     labelKey: 'tableHeaders.memory',
  //     formatter: 'Si',
  //     formatterOpts: {
  //       opts: {
  //         increment: 1024,
  //         addSuffix: true,
  //         maxExponent: 3,
  //         minExponent: 3,
  //         suffix: 'i',
  //       },
  //       needParseSi: true,
  //     },
  //   },
  //   {
  //     name: 'ip',
  //     label: 'IP Address',
  //     value: 'id',
  //     formatter: 'HarvesterIpAddress',
  //     labelKey: 'tableHeaders.ipAddress',
  //   },
  //   {
  //     name: 'node',
  //     label: 'Node',
  //     value: 'id',
  //     sort: ['realAttachNodeName'],
  //     formatter: 'NodeName',
  //     labelKey: 'tableHeaders.node',
  //   },
  //   {
  //     ...AGE,
  //     sort: 'metadata.creationTimestamp:desc',
  //   },
  // STATE,
  // NAME,
  // NAMESPACE,
  // STATUS,
  // // READY,
  // {
  //   name: 'run-strategy',
  //   label: 'Run strategy',
  //   value: 'runStrategyLabel',
  //   sort: ['runStrategyLabel'],
  //   getValue: (row: VirtualMachine) => {
  //     console.log('row', row);
  //     // return row.runStrategyLabel;
  //     return row.isPaused;
  //   },
  // },
  // AGE,
  // ]);
}
