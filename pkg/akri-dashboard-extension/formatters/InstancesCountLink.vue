<script>
import { POD } from '@shell/config/types';
import TableCellLoading from '../components/TableCellLoading.vue';
import { ResourceNames } from '../config/constants';

export default {
  name: 'InstancesCountLink',
  components: {
    TableCellLoading,
  },

  props: {
    value: {
      type: Number,
      default: 0,
    },
    row: {
      type: Object,
      required: true,
    },
    col: {
      type: Object,
      default(props) {
        return {};
      },
    },
    fetchedResourceType: {
      type: String,
      default: POD,
    },
  },

  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: ResourceNames.INSTANCE });
  },

  computed: {
    to() {
      return { ...this.row?.detailLocation, hash: '#instances' };
    },
  },
};
</script>

<template>
  <TableCellLoading v-if="$fetchState.pending" />
  <span v-else>
    <router-link v-if="to" :to="to">
      {{ value }}
    </router-link>
  </span>
</template>
