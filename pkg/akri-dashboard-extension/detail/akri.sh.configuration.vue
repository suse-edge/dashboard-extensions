<script>
import { _CREATE } from '@shell/config/query-params';
import ResourceTabs from '@shell/components/form/ResourceTabs';

export default {
  name: 'ConfigurationDetail',
  components: { ResourceTabs },

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
};
</script>
<template>
  <ResourceTabs mode="view" class="mt-20" :value="value" />
</template>
