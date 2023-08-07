<script>
import Vue from 'vue';
import Loading from '@shell/components/Loading';
import { VMI_RESOURCE_NAME } from '../constants';
import NovncConsoleWrapper from './console/NovncConsoleWrapper.vue';

export default Vue.extend({
  layout: 'blank',

  components: { NovncConsoleWrapper, Loading },

  async fetch() {
    await this.$store.dispatch('cluster/find', {
      type: VMI_RESOURCE_NAME,
      id: this.id,
    });
  },

  data() {
    return { id: `${this.$route.params.namespace}/${this.$route.params.vm}` };
  },

  computed: {
    vmi() {
      return this.$store.getters['cluster/byId'](VMI_RESOURCE_NAME, this.id) || [];
    },
  },

  mounted() {
    window.addEventListener('beforeunload', () => {
      this.$refs.console.close();
    });
  },

  head() {
    return { title: this.vmi?.metadata?.name };
  },
});
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <NovncConsoleWrapper v-else ref="console" v-model="vmi" class="novnc-wrapper" />
</template>

<style>
HTML,
BODY,
MAIN,
#__nuxt,
#__layout,
#app,
.vm-console,
.vm-console > DIV,
.vm-console > DIV > DIV {
  height: 100%;
}
</style>
