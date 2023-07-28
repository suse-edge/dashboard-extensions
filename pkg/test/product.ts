import { IPlugin } from '@shell/core/types';

export function init($plugin: IPlugin, store: any) {
  const YOUR_PRODUCT_NAME = 'myProductName';

  const { product } = $plugin.DSL(store, YOUR_PRODUCT_NAME);

  product({
    icon:    'gear',
    inStore: 'management',
    weight:  100
  });
}