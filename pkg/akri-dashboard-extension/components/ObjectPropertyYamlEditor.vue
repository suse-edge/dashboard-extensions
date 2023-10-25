<script>
import jsyaml from 'js-yaml';
import { _CREATE } from '@shell/config/query-params';
import YamlEditor from '@shell/components/YamlEditor';

export default {
  name: 'ObjectPropertyYamlEditor',
  components: { YamlEditor },
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
  emits: ['input'],
  computed: {
    yaml: {
      get() {
        let yaml;
        try {
          yaml = jsyaml.dump(this.value);
        } catch (e) {
          yaml = '';
        }
        return yaml;
      },
      set(newValue) {
        try {
          this.$emit('input', jsyaml.load(newValue));
        } catch (e) {
          this.$emit('input', {});
        }
      },
    },
  },
};
</script>
<template>
  <div>
    <YamlEditor v-model="yaml" :mode="mode" class="yaml-editor" />
  </div>
</template>
