<script>
import { _CREATE } from '@shell/config/query-params';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import Tab from '@shell/components/Tabbed/Tab';
import ResourceTable from '@shell/components/ResourceTable';
import { ResourceNames } from '../config/constants';

export default {
  name: 'ConfigurationDetail',
  components: { ResourceTabs, Tab, ResourceTable },

  props: {
    mode: {
      type: String,
      default: _CREATE,
    },

    resource: {
      type: String,
      default: null,
    },

    value: {
      type: Object,
      required: true,
    },
  },
  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: ResourceNames.INSTANCE });
  },

  computed: {
    instanceSchema() {
      return this.$store.getters['cluster/schemaFor'](ResourceNames.INSTANCE);
    },
    instanceHeaders() {
      return this.$store.getters['type-map/headersFor'](this.instanceSchema);
    },
  },
};
</script>
<template>
  <ResourceTabs mode="view" class="mt-20" :value="value">
    <Tab label-key="akri.resourceTabs.instances.tab" name="instances" :weight="-1">
      <ResourceTable
        :rows="value.instances"
        :headers="instanceHeaders"
        key-field="id"
        :schema="instanceSchema"
        :groupable="false"
        :search="false"
      />
    </Tab>
  </ResourceTabs>
</template>
