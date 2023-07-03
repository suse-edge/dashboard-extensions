<script>
import Loading from '@shell/components/Loading';
// import SerialConsole from '../../../../../components/SerialConsole';
import { VMI_RESOURCE_NAME } from '../constants';

export default {
  layout: 'blank',

  //   components: { SerialConsole, Loading },
  components: { Loading },

  async fetch() {
    await this.$store.dispatch('cluster/find', {
      type: VMI_RESOURCE_NAME,
      id: this.id,
    });
  },

  data() {
    return { id: this.$route.params.id };
  },

  computed: {
    vmi() {
      return this.$store.getters['cluster/byId'](VMI_RESOURCE_NAME, this.id) || [];
      //   const vmiList = this.$store.getters['cluster/all'](HCI.VMI) || [];
      //   const vmi = vmiList.find((VMI) => {
      //     return VMI?.metadata?.ownerReferences?.[0]?.uid === this.uid;
      //   });

      //   return vmi;
    },
  },

  mounted() {
    window.addEventListener('beforeunload', () => {
      this.$refs.serialConsole.close();
    });
  },

  head() {
    return { title: this.vmi?.metadata?.name };
  },
};
</script>

<template>
  <div>
    <Loading v-if="$fetchState.pending" />
    <!-- <SerialConsole v-else ref="serialConsole" v-model="vmi" /> -->
    <span>hello world, right?</span>
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
