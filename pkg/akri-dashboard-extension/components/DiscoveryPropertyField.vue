<script>
import { get } from '@shell/utils/object';
import { CONFIG_MAP, SECRET, NAMESPACE } from '@shell/config/types';
import { mapGetters } from 'vuex';
import { _VIEW } from '@shell/config/query-params';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';

const getPropertyType = (property) => {
  if (property.value) {
    return 'simple';
  }
  if (property.valueFrom?.secretKeyRef) {
    if (property.valueFrom.secretKeyRef.key) {
      return 'secretKeyRef';
    } else {
      return 'secretRef';
    }
  }
  if (property.valueFrom?.configMapKeyRef) {
    if (property.valueFrom.configMapKeyRef.key) {
      return 'configMapKeyRef';
    } else {
      return 'configMapRef';
    }
  }
  return 'simple';
};

export default {
  name: 'DiscoveryPropertyField',
  components: { LabeledSelect, LabeledInput },
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
    // filter resource options by namespace(s) selected in top nav
    namespaced: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  emits: ['input', 'remove'],
  data() {
    const type = getPropertyType(this.value);
    const keys = [];
    let valStr, referenced, refName, key;
    switch (type) {
      case 'configMapKeyRef':
        key = this.value.valueFrom?.[type].key || '';
        refName = this.value.valueFrom?.[type].name;
        referenced = this.configMaps.find((resource) => {
          return resource.metadata.name === refName;
        });
        if (referenced && referenced.data) {
          keys.push(...Object.keys(referenced.data));
        }
        break;
      case 'secretKeyRef':
        key = this.value.valueFrom?.[type].key || '';
        refName = this.value.valueFrom?.[type].name;
        referenced = this.secrets.find((resource) => {
          return resource.metadata.name === refName;
        });
        if (referenced && referenced.data) {
          keys.push(...Object.keys(referenced.data));
        }
        break;
      case 'secretRef':
      case 'configMapRef':
        refName = this.value.valueFrom?.[type].name;
        break;
      default:
        valStr = this.value.value;
    }

    return {
      name: this.value.name,
      key,
      refName,
      referenced,
      type,
      valStr,
      keys,
    };
  },
  computed: {
    ...mapGetters({ t: 'i18n/t' }),
    isView() {
      return this.mode === _VIEW;
    },
    typeOpts() {
      return [
        {
          value: 'simple',
          label: this.t('akri.edit.configuration.fields.discoveryProperties.types.keyValue'),
        },
        {
          value: 'secretRef',
          label: this.t('akri.edit.configuration.fields.discoveryProperties.types.secretRef'),
        },
        {
          value: 'secretKeyRef',
          label: this.t('akri.edit.configuration.fields.discoveryProperties.types.secretKeyRef'),
        },
        {
          value: 'configMapRef',
          label: this.t('akri.edit.configuration.fields.discoveryProperties.types.configMapRef'),
        },
        {
          value: 'configMapKeyRef',
          label: this.t('akri.edit.configuration.fields.discoveryProperties.types.configMapKeyRef'),
        },
      ];
    },
    namespaces() {
      if (this.namespaced) {
        const map = this.$store.getters.namespaces();
        return Object.keys(map).filter((key) => map[key]);
      } else {
        const inStore = this.$store.getters['currentStore'](NAMESPACE);
        return this.$store.getters[`${inStore}/all`](NAMESPACE);
      }
    },
    sourceOptions() {
      if (this.type === 'configMapKeyRef' || this.type === 'configMapRef') {
        return this.configMaps.filter((map) => this.namespaces.includes(map?.metadata?.namespace));
      } else if (this.type === 'secretRef' || this.type === 'secretKeyRef') {
        return this.secrets.filter((secret) =>
          this.namespaces.includes(secret?.metadata?.namespace)
        );
      } else {
        return [];
      }
    },
    sourceLabel() {
      let out;
      if (!this.type) {
        return;
      }
      switch (this.type) {
        case 'secretKeyRef':
        case 'secretRef':
          out = 'akri.edit.configuration.fields.discoveryProperties.secret';
          break;
        case 'configMapKeyRef':
        case 'configMapRef':
          out = 'akri.edit.configuration.fields.discoveryProperties.configMap';
          break;
        default:
          out = 'akri.edit.configuration.fields.discoveryProperties.source';
      }
      return this.t(out);
    },
  },
  watch: {
    type() {
      this.referenced = null;
      this.key = '';
      this.refName = '';
      this.keys = [];
      this.key = '';
      this.valStr = '';
    },

    referenced(neu, old) {
      if (neu) {
        if ((neu.type === SECRET || neu.type === CONFIG_MAP) && neu.data) {
          this.keys = Object.keys(neu.data);
        }
        this.refName = neu?.metadata?.name;
      }
      this.updateRow();
    },
  },
  methods: {
    updateRow() {
      if (!this.name?.length) {
        this.$emit('input', null);
        return;
      }
      const out = { name: this.name };
      switch (this.type) {
        case 'configMapKeyRef':
        case 'secretKeyRef':
          out.valueFrom = {
            [this.type]: {
              name: this.refName,
              key: this.key,
              optional: false,
            },
          };
          break;
        case 'configMapRef':
          out.valueFrom = {
            configMapKeyRef: {
              name: this.refName,
              optional: false,
            },
          };
          break;
        case 'secretRef':
          out.valueFrom = {
            secretKeyRef: {
              name: this.refName,
              optional: false,
            },
          };
          break;
        default:
          out.value = this.valStr;
      }
      this.$emit('input', out);
    },
    get,
  },
};
</script>
<template>
  <div class="var-row">
    <div class="type">
      <LabeledSelect
        v-model="type"
        :mode="mode"
        :multiple="false"
        :options="typeOpts"
        option-label="label"
        :searchable="false"
        :reduce="(e) => e.value"
        :label="t('akri.edit.configuration.fields.discoveryProperties.type')"
        @input="updateRow"
      />
    </div>

    <div class="name">
      <LabeledInput
        v-model="name"
        :label="t('akri.edit.configuration.fields.discoveryProperties.name.label')"
        :placeholder="t('akri.edit.configuration.fields.discoveryProperties.name.placeholder')"
        :mode="mode"
        @input="updateRow"
      />
    </div>

    <div v-if="type === 'simple'" class="single-value">
      <LabeledInput
        v-model="valStr"
        :label="t('akri.edit.configuration.fields.discoveryProperties.value.label')"
        :placeholder="t('akri.edit.configuration.fields.discoveryProperties.value.placeholder')"
        :mode="mode"
        @input="updateRow"
      />
    </div>

    <template v-else>
      <div :class="{ 'single-value': type === 'configMapRef' || type === 'secretRef' }">
        <LabeledSelect
          v-model="referenced"
          :options="sourceOptions"
          :multiple="false"
          :option-label="'metadata.name'"
          :option-key="'id'"
          :mode="mode"
          :label="sourceLabel"
          :loading="loading"
          :searchable="true"
        />
      </div>
      <div v-if="type !== 'secretRef' && type !== 'configMapRef'">
        <LabeledSelect
          v-model="key"
          :multiple="false"
          :options="keys"
          :mode="mode"
          option-label="label"
          :label="t('akri.edit.configuration.fields.discoveryProperties.key.label')"
          :loading="loading"
          @input="updateRow"
        />
      </div>
    </template>

    <div class="remove">
      <button v-if="!isView" type="button" class="btn role-link" @click.stop="$emit('remove')">
        {{ t('generic.remove') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.var-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 100px;
  grid-column-gap: 20px;
  margin-bottom: 10px;
  align-items: center;

  .single-value {
    grid-column: span 2;
  }

  .remove BUTTON {
    padding: 0px;
  }
}
</style>
