<script>
import { POD } from '@shell/config/types';
import TableCellLoading from '../components/TableCellLoading.vue';
import { BadgeState } from '@rancher/components';

export default {
  components: {
    TableCellLoading,
    BadgeState,
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
      default() {
        return {};
      },
    },
    fetchedResourceType: {
      type: String,
      default: POD,
    },
    locationHash: {
      type: String,
      default: '',
    },
  },

  async fetch() {
    await this.$store.dispatch(`cluster/findAll`, { type: this.fetchedResourceType });
  },
  computed: {
    pods() {
      return this.row.brokerPods;
    },
    brokerPodsStatus() {
      return this.pods.reduce((acc, pod) => {
        const color = pod.stateBackground;
        if (acc[color]) {
          acc[color] += 1;
        } else {
          acc[color] = 1;
        }
        return acc;
      }, {});
    },
    isPod() {
      return this.fetchedResourceType === POD;
    },
    to() {
      return { ...this.row?.detailLocation, hash: this.locationHash };
    },
  },
};
</script>

<template>
  <TableCellLoading v-if="$fetchState.pending" />
  <span v-else class="inline-flex">
    <!-- {{ brokerPodsStatus }} -->
    <n-link v-if="to && isPod" :to="to">
      <BadgeState
        v-for="color in Object.keys(brokerPodsStatus)"
        :key="color"
        :color="color"
        :label="brokerPodsStatus[color].toString()"
      />
    </n-link>
    <n-link v-else-if="to" :to="to">
      {{ value }}
    </n-link>
  </span>
</template>
