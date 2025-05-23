<script>
import KeyTable from '@novnc/novnc/lib/input/keysym';
import { VM_RESOURCE_NAME } from '../../constants';
import NovncConsole from './NovncConsole';
import NovncConsoleItem from './NovncConsoleItem';

const SHORT_KEYS = {
  ControlLeft: {
    label: 'Ctrl',
    value: KeyTable.XK_Control_L,
  },
  AltLeft: {
    label: 'Alt',
    value: KeyTable.XK_Alt_L,
  },
};

const FUNCTION_KEYS = {
  Delete: {
    label: 'Del',
    value: KeyTable.XK_Delete,
  },
  PrintScreen: {
    label: 'Print Screen',
    value: KeyTable.XK_Print,
  },
};

const NORMAL_KEYS = {
  KeyN: {
    label: 'N',
    value: KeyTable.XK_n,
  },
  KeyT: {
    label: 'T',
    value: KeyTable.XK_t,
  },
  KeyW: {
    label: 'W',
    value: KeyTable.XK_w,
  },
  KeyY: {
    label: 'Y',
    value: KeyTable.XK_y,
  },
};

const F_KEYS = {
  F1: {
    label: 'F1',
    value: KeyTable.XK_F1,
  },
  F2: {
    label: 'F2',
    value: KeyTable.XK_F2,
  },
  F3: {
    label: 'F3',
    value: KeyTable.XK_F3,
  },
  F4: {
    label: 'F4',
    value: KeyTable.XK_F4,
  },
  F5: {
    label: 'F5',
    value: KeyTable.XK_F5,
  },
  F6: {
    label: 'F6',
    value: KeyTable.XK_F6,
  },
  F7: {
    label: 'F7',
    value: KeyTable.XK_F7,
  },
  F8: {
    label: 'F8',
    value: KeyTable.XK_F8,
  },
  F9: {
    label: 'F9',
    value: KeyTable.XK_F9,
  },
  F10: {
    label: 'F10',
    value: KeyTable.XK_F10,
  },
  F11: {
    label: 'F11',
    value: KeyTable.XK_F11,
  },
  F12: {
    label: 'F12',
    value: KeyTable.XK_F12,
  },
};

export default {
  components: { NovncConsole, NovncConsoleItem },

  props: {
    value: {
      type: Object,
      required: true,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      keysRecord: [],
      vmResource: {},
    };
  },

  async fetch() {
    this.vmResource = await this.$store.dispatch('cluster/find', {
      type: VM_RESOURCE_NAME,
      id: this.value.id,
    });
  },

  computed: {
    isDown() {
      return this.isEmpty(this.value);
    },

    url() {
      const ip = `${window.location.hostname}:${window.location.port}`;

      return `wss://${ip}${this.value?.getVMIApiPath}`;
    },

    allKeys() {
      return {
        ...SHORT_KEYS,
        ...FUNCTION_KEYS,
        ...NORMAL_KEYS,
        ...F_KEYS,
      };
    },

    keymap() {
      const out = {
        ...SHORT_KEYS,
        PrintScreen: FUNCTION_KEYS.PrintScreen,
        ...F_KEYS,
      };

      out.AltLeft.keys = { PrintScreen: FUNCTION_KEYS.PrintScreen, ...F_KEYS };
      out.ControlLeft.keys = {
        AltLeft: {
          ...Object.assign(SHORT_KEYS.AltLeft, {}),
          keys: { Delete: FUNCTION_KEYS.Delete },
        },
        ...NORMAL_KEYS,
      };

      return out;
    },

    hasSoftRebootAction() {
      return this.vmResource?.canSoftReboot;
    },
  },

  methods: {
    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    },

    close() {
      this.$refs.novncConsole.disconnect();
    },

    update({ key, pos }) {
      this.keysRecord.splice(pos, this.keysRecord.length - pos, key);
    },

    // Send function key, e.g. ALT + F
    sendKeys() {
      this.keysRecord.forEach((key) => {
        this.$refs.novncConsole.sendKey(this.allKeys[key].value, key, true);
      });

      this.keysRecord.reverse().forEach((key) => {
        this.$refs.novncConsole.sendKey(this.allKeys[key].value, key, false);
      });

      this.$refs.popover.isOpen = false;
      this.keysRecord = [];
    },

    softReboot() {
      this.vmResource.softrebootVM();
    },
  },
};
</script>

<template>
  <div id="app">
    <div class="vm-console">
      <div class="combination-keys">
        <VDropdown
          ref="popover"
          placement="top"
          trigger="click"
          :container="false"
          @auto-hide="keysRecord = []"
        >
          <button class="btn btn-sm bg-primary">
            {{ t('kubevirt.virtualMachine.detail.console.shortKeys') }}
          </button>

          <template #popper>
            <novnc-console-item
              :items="keymap"
              :path="keysRecord"
              :pos="0"
              @update="update"
              @sendKeys="sendKeys"
            />
          </template>
        </VDropdown>

        <button v-if="hasSoftRebootAction" class="btn btn-sm bg-primary" @click="softReboot">
          {{ t('kubevirt.action.softreboot') }}
        </button>
      </div>
      <NovncConsole v-if="url && !isDown" ref="novncConsole" :url="url" />
      <p v-if="isDown">
        {{ t('kubevirt.virtualMachine.detail.console.down') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vm-console {
  height: 100%;
  display: grid;
  grid-template-rows: 30px auto;
}

.combination-keys {
  background: rgb(40, 40, 40);
}
</style>
