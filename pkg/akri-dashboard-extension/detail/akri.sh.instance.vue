<script>
import { _CREATE } from '@shell/config/query-params';
import ResourceTabs from '@shell/components/form/ResourceTabs';
import ResourceTable from '@shell/components/ResourceTable';
import Tab from '@shell/components/Tabbed/Tab';
import { POD, WORKLOAD_TYPES } from '@shell/config/types';

export default {
  name: 'InstanceDetail',
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
    await this.$store.dispatch(`cluster/findAll`, { type: POD });
    await this.$store.dispatch(`cluster/findAll`, { type: WORKLOAD_TYPES.JOB });
  },

  computed: {
    podSchema() {
      return this.$store.getters['cluster/schemaFor'](POD);
    },
    podHeaders() {
      return this.$store.getters['type-map/headersFor'](this.podSchema);
    },
    jobSchema() {
      return this.$store.getters['cluster/schemaFor'](WORKLOAD_TYPES.JOB);
    },
    jobHeaders() {
      return this.$store.getters['type-map/headersFor'](this.jobSchema);
    },
  },
};
</script>
<template>
  <div>
    <ResourceTabs mode="view" class="mt-20" :value="value">
      <Tab label-key="akri.resourceTabs.details.tab" name="details" :weight="-1">
        <h3>Broker properties</h3>
        <dl v-for="(property, key) in value.spec.brokerProperties" :key="property">
          <dt>{{ key }}</dt>
          <dd>{{ property }}</dd>
        </dl>
      </Tab>
      <Tab label-key="akri.resourceTabs.brokerPods.tab" name="brokerPods" :weight="-2">
        <ResourceTable
          :rows="value.brokerPods"
          :headers="podHeaders"
          key-field="id"
          :schema="podSchema"
          :groupable="false"
          :search="false"
        />
      </Tab>
      <Tab label-key="akri.resourceTabs.brokerJobs.tab" name="brokerJobs" :weight="-2">
        <ResourceTable
          :rows="value.brokerJobs"
          :headers="podHeaders"
          key-field="id"
          :schema="podSchema"
          :groupable="false"
          :search="false"
        />
      </Tab>
    </ResourceTabs>
  </div>
</template>
