import { importTypes } from '@rancher/auto-import';
import { Action, ActionLocation, IPlugin } from '@shell/core/types';
import { VM_RESOURCE_NAME } from './constants';

const stopVM: Action['invoke'] = (opts, resources) => {
  console.log('pressed stop action', opts, resources.toString());
};

const isStopVMEnabled: Action['enabled'] = (ctx) => {
  console.log('context', ctx);
  return false;
};

const stopVMAction: Action = {
  label: 'Stop',
  icon: 'icon-close',
  invoke: stopVM,
  enabled: isStopVMEnabled,
};

// Init the package
export default function (plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  const { version, description } = require('./package.json');
  plugin.metadata = {
    name: 'KubeVirt plugin',
    version,
    description,
    icon: require('./assets/images/kubevirt-icon-color.svg'),
  };

  // Load a product
  plugin.addProduct(require('./product'));

  plugin.addAction(ActionLocation.TABLE, { resource: [VM_RESOURCE_NAME] }, stopVMAction);
}
