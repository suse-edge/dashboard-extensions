<script>
import { nextTick } from 'vue';
import { _CREATE } from '@shell/config/query-params';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@rancher/components';

export default {
  name: 'DiscoveryHandlerNameField',
  components: { LabeledSelect, LabeledInput },
  props: {
    value: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: _CREATE,
    },
    discoveryHandlerNames: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: true,
    },
    rules: {
      default: () => [],
      type: Array,
      // we only want functions in the rules array
      validator: (rules) => rules.every((rule) => ['function'].includes(typeof rule)),
    },
  },
  emits: ['update:value'],
  data() {
    return {
      defineCustomDiscoveryHandlerName: true,
      discoveryHandlerName: this.value,
    };
  },
  computed: {
    discoveryHandlerNameOptions() {
      return [
        ...this.discoveryHandlerNames,
        { label: 'divider', disabled: true, kind: 'divider' },
        {
          label: this.t(
            'akri.edit.configuration.fields.discoveryHandlerName.customNameOptionLabel'
          ),
          value: '',
          kind: 'highlighted',
        },
      ];
    },
    showDiscoveryHandlerNameSelect() {
      return this.discoveryHandlerNames.length && !this.defineCustomDiscoveryHandlerName;
    },
  },
  watch: {
    discoveryHandlerName(newValue) {
      this.$emit('update:value', newValue);
    },
    loading(neu) {
      if (!neu) {
        if (
          this.discoveryHandlerNames.length &&
          (!this.value || this.discoveryHandlerNames.includes(this.value))
        ) {
          this.defineCustomDiscoveryHandlerName = false;
          this.discoveryHandlerName = this.value || this.discoveryHandlerNames[0];
        } else {
          this.defineCustomDiscoveryHandlerName = true;
        }
      }
    },
  },
  methods: {
    handleSelectDiscoveryHandlerName(e) {
      if (!e || e.value === '') {
        // The blank value in the dropdown is labeled "Define custom discovery handler name"
        this.defineCustomDiscoveryHandlerName = true;
        nextTick(() => this.$refs.discoveryHandlerName.focus());
      } else {
        this.defineCustomDiscoveryHandlerName = false;
      }
    },
    cancelCustomDiscoveryHandlerName() {
      this.defineCustomDiscoveryHandlerName = false;
      this.discoveryHandlerName = this.discoveryHandlerNames[0];
    },
  },
};
</script>
<template>
  <LabeledSelect
    v-if="showDiscoveryHandlerNameSelect"
    v-model:value="discoveryHandlerName"
    :label="t('akri.edit.configuration.fields.discoveryHandlerName.label')"
    :options="discoveryHandlerNameOptions"
    :mode="mode"
    :clearable="true"
    required
    :loading="loading"
    @selecting="handleSelectDiscoveryHandlerName"
  />
  <div v-else>
    <LabeledInput
      ref="discoveryHandlerName"
      v-model:value="discoveryHandlerName"
      :mode="mode"
      :loading="loading"
      :label="t('akri.edit.configuration.fields.discoveryHandlerName.label')"
      :rules="rules"
    />
    <button
      v-if="discoveryHandlerNames.length"
      aria="Cancel"
      class="cancel-custom-name"
      @click="cancelCustomDiscoveryHandlerName"
    >
      <i v-clean-tooltip="t('generic.cancel')" class="icon icon-close align-value" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
button.cancel-custom-name {
  all: unset;
  height: 0;
  position: relative;
  top: -35px;
  float: right;
  margin-right: 7px;

  cursor: pointer;

  .align-value {
    padding-top: 7px;
  }
}
</style>
