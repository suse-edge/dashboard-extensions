<script>
import { POD } from '@shell/config/types';
import TableCellLoading from '../components/TableCellLoading.vue';

export default {
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
      default: () => {},
    },
    fetchedResourceType: {
      type: String,
      default: POD,
    },
  },

  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: this.fetchedResourceType });
  },

  computed: {
    to() {
      return this.row?.detailLocation;
    },
  },
};
</script>

<template>
  <TableCellLoading v-if="$fetchState.pending" />
  <span v-else>
    <n-link v-if="to" :to="to">
      {{ value }}
    </n-link>
  </span>
</template>
