<script>
import ResourceTable from '@shell/components/ResourceTable';
import LinkDetail from '@shell/components/formatter/LinkDetail';
import VMState from '../formatters/VMState';
import { STATE, AGE, NAME, NAMESPACE } from '@shell/config/table-headers';
import { allHash } from '@shell/utils/promise';
import Loading from '@shell/components/Loading';
import { POD, NODE } from '@shell/config/types';
import ConsoleBar from '../components/VMConsoleBar';
import { VMI_RESOURCE_NAME, VM_RESOURCE_NAME } from '../constants';

export default {
  name: 'VirtualMachineList',
  components: {
    Loading,
    VMState,
    LinkDetail,
    ConsoleBar,
    ResourceTable,
  },

  props: {
    schema: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      allVMs: [],
      allVMIs: [],
    };
  },

  async fetch() {
    const resourcesToFetch = [VM_RESOURCE_NAME, VMI_RESOURCE_NAME, NODE, POD];
    const promiseMap = resourcesToFetch.reduce((res, resourceType) => {
      if (this.$store.getters['cluster/schemaFor'](resourceType)) {
        res[resourceType] = this.$store.dispatch('cluster/findAll', {
          type: resourceType,
        });
      }
      return res;
    }, {});
    const resources = await allHash(promiseMap);

    this.allVMs = resources[VM_RESOURCE_NAME] || [];
    this.allVMIs = resources[VMI_RESOURCE_NAME] || [];
  },

  computed: {
    headers() {
      return [
        STATE,
        NAME,
        NAMESPACE,
        {
          name: 'RunStrategy',
          label: 'Run Strategy',
          value: 'spec.runStrategy',
          dashIfEmpty: true,
        },
        {
          name: 'vCPU',
          label: 'vCPU',
          sort: ['vCPUs'],
          value: 'vCPUs',
          align: 'center',
          dashIfEmpty: true,
        },
        {
          name: 'Memory',
          value: 'displayMemory',
          sort: ['memorySort'],
          align: 'center',
          labelKey: 'tableHeaders.memory',
          formatter: 'Si',
          formatterOpts: {
            opts: {
              increment: 1024,
              addSuffix: true,
              maxExponent: 3,
              minExponent: 3,
              suffix: 'i',
            },
            needParseSi: true,
          },
        },
        {
          name: 'ip',
          label: 'IP Address',
          value: 'id',
          formatter: 'IPAddress',
          labelKey: 'tableHeaders.ipAddress',
          dashIfEmpty: true,
        },
        {
          name: 'node',
          labelKey: 'tableHeaders.node',
          value: 'nodeName',
          formatter: 'LinkName',
          formatterOpts: { type: NODE },
          dashIfEmpty: true,
        },
        {
          ...AGE,
          sort: 'metadata.creationTimestamp:desc',
        },
      ];
    },

    rows() {
      const matchVMIs = this.allVMIs.filter((VMI) => !this.allVMs.find((VM) => VM.id === VMI.id));
      return [...this.allVMs, ...matchVMIs];
    },
  },

  //   async created() {
  //     const vmis = await this.$store.dispatch('harvester/findAll', { type: HCI.VMI });

  //     await this.$store.dispatch('harvester/findAll', { type: HCI.VMIM });

  //     this['allVMIs'] = vmis;
  //   },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable
      v-bind="$attrs"
      :headers="headers"
      default-sort-by="age"
      :rows="rows"
      :schema="schema"
      :groupable="true"
      key-field="_key"
    >
      <template #cell:state="scope">
        <div class="state">
          <VMState class="vmstate" :row="scope.row" />
        </div>
      </template>

      <template #cell:name="scope">
        <div class="name-console">
          <LinkDetail
            v-if="scope.row.type !== 'kubevirt.io.virtualmachineinstance'"
            v-model:value="scope.row.metadata.name"
            :row="scope.row"
          />
          <span v-else>
            {{ scope.row.metadata.name }}
          </span>

          <ConsoleBar :resource-type="scope.row" class="console mr-10" />
        </div>
      </template>
    </ResourceTable>
  </div>
</template>

<style lang="scss" scoped>
.state {
  display: flex;

  .vmstate {
    margin-right: 6px;
  }
}

.name-console {
  display: flex;
  align-items: center;
  justify-content: space-around;

  span {
    line-height: 26px;
    width: 160px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }

  display: flex;
  justify-content: space-around;
}
</style>
