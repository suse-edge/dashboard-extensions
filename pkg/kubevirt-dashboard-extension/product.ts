import { IPlugin } from '@shell/core/types';
import {
  KUBEVIRT_RESOURCE_NAME,
  PRODUCT_NAME,
  VMI_RESOURCE_NAME,
  VM_RESOURCE_NAME,
} from './constants';

export function init(plugin: IPlugin, store: any) {
  const { basicType, product } = plugin.DSL(store, PRODUCT_NAME);

  product({
    inStore: 'cluster',
    showNamespaceFilter: true,
    ifHaveType: KUBEVIRT_RESOURCE_NAME,
  });

  basicType([KUBEVIRT_RESOURCE_NAME, VM_RESOURCE_NAME, VMI_RESOURCE_NAME]);
}
