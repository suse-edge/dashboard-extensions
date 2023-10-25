<script>
import debounce from 'lodash/debounce';
import { _VIEW } from '@shell/config/query-params';
import { randomStr } from '@shell/utils/string';
import DiscoveryPropertyField from './DiscoveryPropertyField';

export default {
  name: 'DiscoveryProperties',
  components: { DiscoveryPropertyField },
  props: {
    mode: {
      type: String,
      required: true,
    },
    configMaps: {
      type: Array,
      required: true,
    },
    secrets: {
      type: Array,
      required: true,
    },
    loading: {
      default: false,
      type: Boolean,
    },
    /**
     * Akri Configuration Instance discoveryProperties property
     */
    value: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  emits: ['input'],
  data() {
    const properties = (this.value || []).map(({ name, value, valueFrom }) => {
      return {
        id: randomStr(4),
        value: { name, value, valueFrom },
      };
    });
    return {
      properties,
    };
  },
  computed: {
    isView() {
      return this.mode === _VIEW;
    },
  },

  created() {
    this.queueUpdate = debounce(this.update, 500);
  },

  methods: {
    update() {
      this.$emit(
        'input',
        this.properties.map((p) => p.value)
      );
    },
    updateRow() {
      this.queueUpdate();
    },
    removeRow(idx) {
      this.properties.splice(idx, 1);
      this.queueUpdate();
    },
    addProperty() {
      this.properties.push({
        id: randomStr(4),
        value: { name: '', value: '', valueFrom: undefined },
      });
    },
  },
};
</script>
<template>
  <div>
    <div v-for="(row, i) in properties" :key="row.id">
      <DiscoveryPropertyField
        v-model="row.value"
        :secrets="secrets"
        :config-maps="configMaps"
        :mode="mode"
        :loading="loading"
        @remove="removeRow(i)"
        @input="updateRow"
      />
    </div>
    <button
      v-if="!isView"
      v-t="'akri.edit.configuration.fields.discoveryProperties.addLabel'"
      type="button"
      class="btn role-tertiary add"
      data-testid="add-discovery-property"
      @click="addProperty"
    />
  </div>
</template>
