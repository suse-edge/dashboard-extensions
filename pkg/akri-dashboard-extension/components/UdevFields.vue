<script>
import jsyaml from 'js-yaml';
import ArrayList from '@shell/components/form/ArrayList';
import { _CREATE } from '@shell/config/query-params';
import { Checkbox } from '@components/Form/Checkbox';
import { set } from '@shell/utils/object';

export default {
  name: 'UdevFields',
  components: { ArrayList, Checkbox },
  props: {
    mode: {
      type: String,
      default: _CREATE,
    },

    value: {
      type: Object,
      required: true,
    },
  },
  computed: {
    udevRules: {
      get() {
        const discoveryDetails = this.getDiscoveryDetails();
        return discoveryDetails.udevRules || [];
      },
      set(newValue) {
        const discoveryDetails = this.getDiscoveryDetails();
        const updated = { ...discoveryDetails, udevRules: newValue };
        let yaml;
        try {
          yaml = jsyaml.dump(updated);
        } catch (e) {
          yaml = '';
        }
        set(this.value, 'spec.discoveryHandler.discoveryDetails', yaml);
      },
    },
    groupRecursive: {
      get() {
        const discoveryDetails = this.getDiscoveryDetails();
        return discoveryDetails.groupRecursive || false;
      },
      set(newValue) {
        const discoveryDetails = this.getDiscoveryDetails();
        const updated = { ...discoveryDetails, groupRecursive: newValue };
        let yaml;
        try {
          yaml = jsyaml.dump(updated);
        } catch (e) {
          yaml = '';
        }
        set(this.value, 'spec.discoveryHandler.discoveryDetails', yaml);
      },
    },
  },
  methods: {
    getDiscoveryDetails() {
      const discoveryDetailsYaml = this.value.spec?.discoveryHandler?.discoveryDetails || '{}';
      try {
        const discoveryDetails = jsyaml.load(discoveryDetailsYaml);
        console.log('discoveryDetails', discoveryDetails);
        return discoveryDetails;
      } catch (e) {
        // TODO(jtomasek) handle the error as validation error e.g. this.targetAdvancedErrors = exceptionToErrorsArray(e);
        return {};
      }
    },
  },
};
</script>
<template>
  <div>
    <div class="row mb-20">
      <div class="col span-6">
        <Checkbox
          v-model="groupRecursive"
          label-key="akri.edit.configuration.fields.groupRecursive.label"
          :tooltip="t('akri.edit.configuration.fields.groupRecursive.tooltip')"
        />
      </div>
    </div>
    <div class="row mb-20">
      <div class="col span-12">
        <h3>
          {{ t('akri.edit.configuration.fields.udevRules.label') }}
        </h3>
        <p class="padded mb-10">
          {{ t('akri.edit.configuration.fields.udevRules.description') }}
        </p>
        <ArrayList
          :value="udevRules"
          :mode="mode"
          :value-label="t('akri.edit.configuration.fields.udevRules.label')"
          :add-label="t('akri.edit.configuration.fields.udevRules.addLabel')"
          :initial-empty-row="true"
          value-placeholder='e.g. KERNEL=="video[0-9]*"'
          @input="udevRules = $event"
        />
      </div>
    </div>
  </div>
</template>
