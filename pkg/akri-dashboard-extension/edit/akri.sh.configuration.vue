<script>
import { _CREATE } from '@shell/config/query-params';
import CruResource from '@shell/components/CruResource';
import CreateEditView from '@shell/mixins/create-edit-view';
// import FormValidation from '@shell/mixins/form-validation';
import NameNsDescription from '@shell/components/form/NameNsDescription';
// import LabeledSelect from '@shell/components/form/LabeledSelect';
import ArrayList from '@shell/components/form/ArrayList';
import Tab from '@shell/components/Tabbed/Tab';
import Tabbed from '@shell/components/Tabbed';
import { WORKLOAD_TYPES, SECRET, CONFIG_MAP } from '@shell/config/types';
import { set } from '@shell/utils/object';
import UdevFields from '../components/UdevFields';
import { LabeledInput } from '@rancher/components';
import YamlEditor from '@shell/components/YamlEditor';
import ResourceManager from '@shell/mixins/resource-manager';

export default {
  name: 'CruConfiguration',
  components: {
    CruResource,
    NameNsDescription,
    Tabbed,
    Tab,
    // LabeledSelect,
    UdevFields,
    LabeledInput,
    YamlEditor,
    ArrayList,
  },
  //   mixins: [CreateEditView, FormValidation],
  mixins: [CreateEditView, ResourceManager],
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

  data() {
    return {
      secondaryResourceData: this.secondaryResourceDataConfig(),
      secrets: [],
      configMaps: [],
      isNamespaceNew: false,
    };
  },

  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: WORKLOAD_TYPES.DAEMON_SET });
    this.resourceManagerFetchSecondaryResources(this.secondaryResourceData);
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
    discoveryDetailsYaml: {
      get() {
        return this.value.spec?.discoveryHandler.discoveryDetails || '';
      },
      set(newValue) {
        set(this.value, 'spec.discoveryHandler.discoveryDetails', newValue);
      },
    },
    discoveryProperties: {
      get() {
        return this.value.spec?.discoveryHandler.discoveryProperties || [];
      },
      set(newValue) {
        set(this.value, 'spec.discoveryHandler.discoveryProperties', newValue);
      },
    },
    isFormValid() {
      return !!this.value.name;
    },
    allDaemonSets() {
      return this.$store.getters['cluster/all'](WORKLOAD_TYPES.DAEMON_SET) || [];
    },
    discoveryHandlerNames() {
      return [
        ...this.allDaemonSets
          .filter((daemonSet) => daemonSet.metadata.annotations['akri.sh.discoveryHandlerName'])
          .map((dh) => dh.metadata.annotations['akri.sh.discoveryHandlerName']),
        'custom',
      ];
    },
    discoveryHandlerTypes() {
      return this.allDaemonSets
        .filter((daemonSet) => daemonSet.metadata.annotations['akri.sh.discoveryHandlerType'])
        .map((dh) => dh.metadata.annotations['akri.sh.discoveryHandlerType']);
    },
  },

  watch: {
    async 'value.metadata.namespace'(neu) {
      if (this.isNamespaceNew) {
        // we don't need to re-fetch namespace specific (or non-namespace specific) resources when the namespace hasn't been created yet
        return;
      }
      this.secondaryResourceData.namespace = neu;
      // Fetch resources that are namespace specific, we don't need to re-fetch non-namespaced resources on namespace change
      this.resourceManagerFetchSecondaryResources(this.secondaryResourceData, true);
    },

    isNamespaceNew(neu, old) {
      if (!old && neu) {
        // As the namespace is new any resource that's been fetched with a namespace is now invalid
        this.resourceManagerClearSecondaryResources(this.secondaryResourceData, true);
      }
    },
  },

  methods: {
    secondaryResourceDataConfig() {
      return {
        namespace: this.value?.metadata?.namespace || null,
        data: {
          [SECRET]: {
            applyTo: [{ var: 'secrets', classify: true }],
          },
          [CONFIG_MAP]: {
            applyTo: [{ var: 'configMaps', classify: false }],
          },
        },
      };
    },
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
    <NameNsDescription
      v-model="value"
      :mode="mode"
      :description-hidden="true"
      @isNamespaceNew="isNamespaceNew = $event"
    />
    <Tabbed :side-tabs="true">
      <Tab
        name="discovery-handler"
        :label="t('akri.edit.configuration.tabs.discoveryHandler.title')"
        :weight="3"
      >
        <!-- <div class="row mb-20">
          <div class="col span-12">
            <LabeledSelect
              v-model="discoveryHandlerName"
              :label="t('akri.edit.configuration.fields.discoveryHandlerName.label')"
              :options="discoveryHandlerNames"
              :mode="mode"
            />
          </div>
        </div> -->
        <div class="row">
          <div class="col span-12">
            <LabeledInput
              v-model="discoveryHandlerName"
              :label="t('akri.edit.configuration.fields.discoveryHandlerName.label')"
            />
          </div>
        </div>
        <div class="spacer" />
        <UdevFields v-if="discoveryHandlerName === 'udev'" :mode="mode" :value="value" />
        <div v-else class="row">
          <div class="col span-12">
            <h3>
              {{ t('akri.edit.configuration.fields.discoveryDetailsYaml.label') }}
              <i
                v-clean-tooltip="t('akri.edit.configuration.fields.discoveryDetailsYaml.tooltip')"
                class="icon icon-info"
              />
            </h3>
            <YamlEditor v-model="discoveryDetailsYaml" :mode="mode" class="yaml-editor" />
          </div>
        </div>
        <div class="spacer" />
        <div class="row mb-20">
          <div class="col span-12">
            {{ configMaps.map((cm) => cm.metadata.name) }}
            {{ secrets.map((s) => s.metadata.name) }}
            <ArrayList
              :value="discoveryProperties"
              :mode="mode"
              :title="t('akri.edit.configuration.fields.discoveryProperties.label')"
              :protip="t('akri.edit.configuration.fields.discoveryProperties.description')"
              :initial-empty-row="true"
              @input="discoveryProperties = $event"
            />
          </div>
        </div>
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
