import { importTypes } from '@rancher/auto-import';
import { ActionLocation, IPlugin } from '@shell/core/types';
import { VM_RESOURCE_NAME, PRODUCT_NAME } from './constants';
import { startVMAction, stopVMAction } from './actions';
import SerialConsolePage from './components/SerialConsolePage.vue';
import VNCConsolePage from './components/VNCConsolePage.vue';

// Init the package
export default function (plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  plugin.addProduct(require('./product'));
  plugin.addAction(ActionLocation.TABLE, { resource: [VM_RESOURCE_NAME] }, startVMAction);
  plugin.addAction(ActionLocation.TABLE, { resource: [VM_RESOURCE_NAME] }, stopVMAction);
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
