<script>
import Loading from '@shell/components/Loading';
import { VMI_RESOURCE_NAME } from '../constants';
import SerialConsole from './console/SerialConsole';

export default {
  components: { SerialConsole, Loading },

  data() {
    return { id: `${this.$route.params.namespace}/${this.$route.params.vm}` };
  },

  async fetch() {
    await this.$store.dispatch('cluster/find', {
      type: VMI_RESOURCE_NAME,
      id: this.id,
    });
  },

  head() {
    return { title: this.vmi?.metadata?.name };
  },

  computed: {
    vmi() {
      return this.$store.getters['cluster/byId'](VMI_RESOURCE_NAME, this.id) || [];
    },
  },

  mounted() {
    window.addEventListener('beforeunload', () => {
      this.$refs.serialConsole.close();
    });
  },
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <SerialConsole v-else ref="serialConsole" v-model:value="vmi" />
  </div>
</template>

<style lang="scss" scoped>
body,
#__nuxt,
#__layout,
main {
  height: 100%;
}
</style>
