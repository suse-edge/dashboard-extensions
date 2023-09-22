import { IPlugin } from '@shell/core/types';
import {
  PRODUCT_NAME,
  RESOURCE_NAMES,
} from './constants';

export function init(plugin: IPlugin, store: any) {
  const { basicType, product } = plugin.DSL(store, PRODUCT_NAME);

  product({
    inStore: 'cluster',
    showNamespaceFilter: true,
    ifHaveType: RESOURCE_NAMES.CONFIGURATION,
  });

  basicType(Object.values(RESOURCE_NAMES));
}
