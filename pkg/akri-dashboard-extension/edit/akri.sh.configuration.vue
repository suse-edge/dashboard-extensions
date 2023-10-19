<script>
import { _CREATE } from '@shell/config/query-params';
import CruResource from '@shell/components/CruResource';
import CreateEditView from '@shell/mixins/create-edit-view';
// import FormValidation from '@shell/mixins/form-validation';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import Tab from '@shell/components/Tabbed/Tab';
import Tabbed from '@shell/components/Tabbed';
import { WORKLOAD_TYPES } from '@shell/config/types';
import { set } from '@shell/utils/object';
import UdevFields from '../components/UdevFields';

// const initialDiscoveryHandlerSpec = {
//   name: undefined,
//   discoveryHandlerDetails: {},
//   discoveryHandlerProperties: {},
// };
// const initialConfigurationSpec = {
//   discoveryHandler: initialDiscoveryHandlerSpec,
// };

export default {
  name: 'CruConfiguration',
  components: { CruResource, NameNsDescription, Tabbed, Tab, LabeledSelect, UdevFields },
  //   mixins: [CreateEditView, FormValidation],
  mixins: [CreateEditView],
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

  //   data() {
  // this.$set(this.value, 'spec', this.value.spec || initialConfigurationSpec);
  // return {
  //   // v: this.value,
  //   spec: this.value.spec || initialConfigurationSpec,
  // };
  // return {
  //   discoveryHandlerName: 'hello',
  // };
  // this.$set(this.value, 'spec', this.value?.spec || {});
  // this.$set(this.value, 'spec.discoveryHandler', this.value?.spec?.discoveryHandler || {});
  // this.$set(
  //   this.value,
  //   'spec.discoveryHandler.name',
  //   this.value?.spec?.discoveryHandler?.name || ''
  // );
  //   },
  data() {
    return {};
  },

  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: WORKLOAD_TYPES.DAEMON_SET });
  },

  computed: {
    discoveryHandlerName: {
      get() {
        return this.value?.spec?.discoveryHandler?.name || '';
      },
      set(newValue) {
        set(this.value, 'spec.discoveryHandler.name', newValue);
      },
    },
    isFormValid() {
      return !!this.value.name;
    },
    allDaemonSets() {
      return this.$store.getters['cluster/all'](WORKLOAD_TYPES.DAEMON_SET) || [];
    },
    discoveryHandlers() {
      return this.allDaemonSets.filter(
        (daemonSet) => daemonSet.metadata.annotations['akri.sh.discoveryHandlerName']
      );
    },
    discoveryHandlerNames() {
      return this.discoveryHandlers.map(
        (dh) => dh.metadata.annotations['akri.sh.discoveryHandlerName']
      );
    },
  },

  mounted() {
    console.log('mounted');
    // console.log('errors', this.errors);
    console.log('value', this.value);
    console.log('DHs', this.discoveryHandlerNames);
  },
  updated() {
    console.log('updated');
    // console.log('errors', this.errors);
    console.log('value', this.value);
    console.log('DHs', this.discoveryHandlerNames);
    console.log('value.spec', this.value.spec);
  },
};
</script>

<template>
  <Loading v-if="!value" />
  <CruResource
    v-else
    :done-route="doneRoute"
    :can-yaml="true"
    :mode="mode"
    :resource="value"
    :errors="errors"
    :validation-passed="isFormValid"
    @error="(e) => (errors = e)"
    @finish="save"
    @cancel="done"
  >
    <NameNsDescription v-model="value" :mode="mode" :description-hidden="true" />
    <Tabbed :side-tabs="true">
      <Tab
        name="discovery-handler"
        :label="t('akri.edit.configuration.tabs.discoveryHandler.title')"
        :weight="3"
      >
        <div class="row mb-20">
          <div class="col span-12">
            <LabeledSelect
              v-model="discoveryHandlerName"
              :label="t('akri.edit.configuration.fields.discoveryHandlerType.label')"
              :options="discoveryHandlerNames"
              :mode="mode"
            />
          </div>
        </div>
        <UdevFields v-if="discoveryHandlerName === 'udev'" :mode="mode" :value="value" />
      </Tab>
      <Tab name="brokers" :label="t('akri.edit.configuration.tabs.brokers.title')" :weight="2">
        fields for broker pods and broker jobs go here
      </Tab>
      <Tab name="services" :label="t('akri.edit.configuration.tabs.services.title')" :weight="1">
        fields for instance and configuration service specs go here
      </Tab>
      <Tab name="other" :label="t('akri.edit.configuration.tabs.other.title')" :weight="0">
        a field for capacity goes here
      </Tab>
    </Tabbed>
  </CruResource>
</template>
