<script>
import { _CREATE, _VIEW } from '@shell/config/query-params';
import CruResource from '@shell/components/CruResource';
import CreateEditView from '@shell/mixins/create-edit-view';
import FormValidation from '@shell/mixins/form-validation';
import NameNsDescription from '@shell/components/form/NameNsDescription';
import Tab from '@shell/components/Tabbed/Tab';
import Tabbed from '@shell/components/Tabbed';
import { WORKLOAD_TYPES, SECRET, CONFIG_MAP } from '@shell/config/types';
import { set } from '@shell/utils/object';
import { LabeledInput } from '@rancher/components';
import YamlEditor, { EDITOR_MODES } from '@shell/components/YamlEditor';
import ResourceManager from '@shell/mixins/resource-manager';
import Loading from '@shell/components/Loading';
import DiscoveryProperties from '../components/DiscoveryProperties';
import { DISCOVERY_HANDLER_NAME_ANNOTATION } from '../config/constants';
import UdevFields from '../components/UdevFields';
import DiscoveryHandlerNameField from '../components/DiscoveryHandlerNameField';

export default {
  name: 'CruConfiguration',
  components: {
    CruResource,
    NameNsDescription,
    Tabbed,
    Tab,
    UdevFields,
    LabeledInput,
    YamlEditor,
    DiscoveryProperties,
    Loading,
    DiscoveryHandlerNameField,
  },
  //   mixins: [CreateEditView, FormValidation],
  mixins: [CreateEditView, ResourceManager, FormValidation],
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
      allDaemonSets: [],
      isNamespaceNew: false,
      defineCustomDiscoveryHandlerName: false,
      fvFormRuleSets: [
        { path: 'discoveryHandlerName', rules: ['required'] },
        { path: 'capacity', rules: ['required'] },
      ],
    };
  },

  async fetch() {
    this.resourceManagerFetchSecondaryResources(this.secondaryResourceData);
  },

  computed: {
    tabErrors() {
      return {
        discoveryHandler: this.fvGetPathErrors(['discoveryHandlerName'])?.length > 0,
        capacity: this.fvGetPathErrors(['capacity'])?.length > 0,
      };
    },
    editorMode() {
      return this.isView || this.viewCode ? EDITOR_MODES.VIEW_CODE : EDITOR_MODES.EDIT_CODE;
    },

    isView() {
      return this.mode === _VIEW;
    },
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
        return this.value.spec?.discoveryHandler?.discoveryDetails || '';
      },
      set(newValue) {
        set(this.value, 'spec.discoveryHandler.discoveryDetails', newValue);
      },
    },
    discoveryProperties: {
      get() {
        return this.value.spec?.discoveryHandler?.discoveryProperties || [];
      },
      set(newValue) {
        set(this.value, 'spec.discoveryHandler.discoveryProperties', newValue);
      },
    },
    instanceServiceSpec: {
      get() {
        return (
          this.value.spec?.instanceServiceSpec || {
            type: 'ClusterIP',
            ports: [{ name: '', port: '', protocol: '', targetPort: '' }],
          }
        );
      },
      set(newValue) {
        set(this.value, 'spec.instanceServiceSpec', newValue);
      },
    },
    configurationServiceSpec: {
      get() {
        return (
          this.value.spec?.configurationServiceSpec || {
            type: 'ClusterIP',
            ports: [{ name: '', port: '', protocol: '', targetPort: '' }],
          }
        );
      },
      set(newValue) {
        set(this.value, 'spec.configurationServiceSpec', newValue);
      },
    },
    capacity: {
      get() {
        return this.value.spec?.capacity;
      },
      set(newValue) {
        set(this.value, 'spec.capacity', parseInt(newValue));
      },
    },
    brokerPodSpec: {
      get() {
        return this.value.spec?.brokerSpec?.brokerPodSpec || {};
      },
      set(newValue) {
        set(this.value, 'spec.brokerSpec.brokerPodSpec', newValue);
      },
    },
    brokerJobSpec: {
      get() {
        return this.value.spec?.brokerSpec?.brokerJobSpec || {};
      },
      set(newValue) {
        set(this.value, 'spec.brokerSpec.brokerJobSpec', newValue);
      },
    },
    discoveryHandlerNames() {
      return [
        ...this.allDaemonSets
          .filter((daemonSet) => daemonSet.metadata.annotations[DISCOVERY_HANDLER_NAME_ANNOTATION])
          .map((dh) => dh.metadata.annotations[DISCOVERY_HANDLER_NAME_ANNOTATION])
          .sort(),
      ];
    },
  },

  methods: {
    secondaryResourceDataConfig() {
      return {
        data: {
          [SECRET]: {
            applyTo: [{ var: 'secrets', classify: false }],
          },
          [CONFIG_MAP]: {
            applyTo: [{ var: 'configMaps', classify: false }],
          },
          [WORKLOAD_TYPES.DAEMON_SET]: {
            applyTo: [{ var: 'allDaemonSets', classify: false }],
          },
        },
      };
    },
    onTabChanged({ tab }) {
      this.$refs[`${tab.name}EditorRef`]?.refresh();
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
    :errors="fvUnreportedValidationErrors"
    :validation-passed="fvFormIsValid"
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
    <Tabbed :side-tabs="true" @changed="onTabChanged">
      <Tab
        name="discoveryHandler"
        :label="t('akri.edit.configuration.tabs.discoveryHandler.title')"
        :weight="5"
        :error="tabErrors.discoveryHandler"
      >
        <div class="row">
          <div class="col span-6">
            <DiscoveryHandlerNameField
              v-model="discoveryHandlerName"
              :mode="mode"
              :discovery-handler-names="discoveryHandlerNames"
              :loading="isLoadingSecondaryResources"
              :rules="fvGetAndReportPathRules('discoveryHandlerName')"
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
            <YamlEditor
              ref="discoveryHandlerEditorRef"
              v-model="discoveryDetailsYaml"
              :editor-mode="editorMode"
              class="yaml-editor"
            />
          </div>
        </div>
        <div class="spacer" />
        <div class="row mb-20">
          <div class="col span-12">
            <h3>
              {{ t('akri.edit.configuration.fields.discoveryProperties.label') }}
              <i
                v-clean-tooltip="t('akri.edit.configuration.fields.discoveryProperties.tooltip')"
                class="icon icon-info"
              />
            </h3>
            <DiscoveryProperties
              :mode="mode"
              :config-maps="configMaps"
              :secrets="secrets"
              :value="discoveryProperties"
              :loading="isLoadingSecondaryResources"
              @input="discoveryProperties = $event"
            />
          </div>
        </div>
      </Tab>
      <Tab name="brokerPod" :label="t('akri.edit.configuration.tabs.brokerPod.title')" :weight="4">
        <p class="mb-10">
          {{ t('akri.edit.configuration.fields.brokerPodSpec.label') }}
          <i
            v-clean-tooltip="t('akri.edit.configuration.fields.brokerPodSpec.tooltip')"
            class="icon icon-info"
          />
        </p>
        <YamlEditor
          ref="brokerPodEditorRef"
          v-model="brokerPodSpec"
          :as-object="true"
          :editor-mode="editorMode"
          class="yaml-editor"
        />
      </Tab>
      <Tab name="brokerJob" :label="t('akri.edit.configuration.tabs.brokerJob.title')" :weight="3">
        <p class="mb-10">
          {{ t('akri.edit.configuration.fields.brokerJobSpec.label') }}
          <i
            v-clean-tooltip="t('akri.edit.configuration.fields.brokerJobSpec.tooltip')"
            class="icon icon-info"
          />
        </p>
        <YamlEditor
          ref="brokerJobEditorRef"
          v-model="brokerJobSpec"
          :as-object="true"
          :editor-mode="editorMode"
          class="yaml-editor"
        />
      </Tab>
      <Tab
        name="instanceService"
        :label="t('akri.edit.configuration.tabs.instanceService.title')"
        :weight="2"
      >
        <p class="mb-10">
          {{ t('akri.edit.configuration.fields.instanceServiceSpec.label') }}
          <i
            v-clean-tooltip="t('akri.edit.configuration.fields.instanceServiceSpec.tooltip')"
            class="icon icon-info"
          />
        </p>
        <YamlEditor
          ref="instanceServiceEditorRef"
          v-model="instanceServiceSpec"
          :as-object="true"
          :editor-mode="editorMode"
          class="yaml-editor"
        />
      </Tab>
      <Tab
        name="configurationService"
        :label="t('akri.edit.configuration.tabs.configurationService.title')"
        :weight="1"
      >
        <p class="mb-10">
          {{ t('akri.edit.configuration.fields.configurationServiceSpec.label') }}
          <i
            v-clean-tooltip="t('akri.edit.configuration.fields.configurationServiceSpec.tooltip')"
            class="icon icon-info"
          />
        </p>
        <YamlEditor
          ref="configurationServiceEditorRef"
          v-model="configurationServiceSpec"
          :as-object="true"
          :editor-mode="editorMode"
          class="yaml-editor"
        />
      </Tab>
      <Tab
        name="capacity"
        :label="t('akri.edit.configuration.tabs.capacity.title')"
        :weight="0"
        :error="tabErrors.capacity"
      >
        <div class="row">
          <div class="col span-6">
            <LabeledInput
              v-model="capacity"
              type="number"
              :label="t('akri.edit.configuration.fields.capacity.label')"
              :tooltip="t('akri.edit.configuration.fields.capacity.tooltip')"
              min="1"
              :rules="fvGetAndReportPathRules('capacity')"
            />
          </div>
        </div>
      </Tab>
    </Tabbed>
  </CruResource>
</template>
