import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import { PRODUCT_NAME } from './constants';
import SerialConsolePage from './components/SerialConsolePage.vue';
import VNCConsolePage from './components/VNCConsolePage.vue';

// Init the package
export default function (plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  plugin.addProduct(require('./product'));
  plugin.addRoute({
    name: `${PRODUCT_NAME}-c-cluster-vm-serialconsole`,
    path: `/:product/c/:cluster/console/:namespace/:vm/serial`,
    component: SerialConsolePage,
    meta: {
      product: PRODUCT_NAME,
    },
  });
  plugin.addRoute({
    name: `${PRODUCT_NAME}-c-cluster-vm-vncconsole`,
    path: `/:product/c/:cluster/console/:namespace/:vm/vnc`,
    component: VNCConsolePage,
    meta: {
      product: PRODUCT_NAME,
    },
  });
}
