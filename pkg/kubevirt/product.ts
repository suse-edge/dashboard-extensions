import { IPlugin } from '@shell/core/types';
import {
  KUBEVIRT_RESOURCE_NAME,
  PRODUCT_NAME,
  VMI_RESOURCE_NAME,
  VM_RESOURCE_NAME,
} from './constants';

export function init($plugin: IPlugin, store: any) {
  const { basicType, product } = $plugin.DSL(store, PRODUCT_NAME);

  // top level product
  // product({
  //   icon: 'gear',
  //   inStore: 'management',
  //   weight: 100,
  // });

  // cluster level product
  product({
    inStore: 'cluster',
    // icon: 'kubevirt',
    // removeable: false,
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

  // headers(UI_PLUGIN, [
  //   STATE,
  //   NAME_COL,
  //   {
  //     name: 'version',
  //     label: 'Versionooooo',
  //     value: 'version',
  //     getValue: (row) => row.version,
  //   },
  //   {
  //     name: 'cacheState',
  //     label: 'Cache State',
  //     value: 'status.cacheState',
  //     getValue: (row) => row.status?.cacheState,
  //   },
  //   AGE,
  // ]);
}
