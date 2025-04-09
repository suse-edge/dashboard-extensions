<script>
import ButtonDropdown from '@shell/components/ButtonDropdown';
import { mapGetters } from 'vuex';
import { OFF } from '../models/harvester/kubevirt.io.virtualmachine';

export default {
  name: 'VMConsoleBar',

  components: { ButtonDropdown },

  props: {
    resource: {
      type: Object,
      required: true,
      default: () => {
        return {};
      },
    },
  },

  computed: {
    ...mapGetters({ t: 'i18n/t' }),

    isOff() {
      return this.resource.stateDisplay === OFF;
    },

    options() {
      return [
        {
          label: this.t('kubevirt.virtualMachine.console.novnc'),
          value: 'vnc',
        },
        {
          label: this.t('kubevirt.virtualMachine.console.serial'),
          value: 'serial',
        },
      ];
    },
  },

  methods: {
    handleDropdown(option) {
      this.show(option.value);
    },

    show(type) {
      const id = this.resource.id;
      const host = window.location.host;
      const prefix = window.location.pathname.replace(this.$route.path, '');
      const params = this.$route?.params;
      const url = `https://${host}${prefix}/${params.product}/c/${params.cluster}/console/${id}/${type}`;

      window.open(
        url,
        '_blank',
        `toolbars=0,width=${screen.width - 200},height=${
          screen.height - 200
        },left=0,top=0,noreferrer`
      );
    },

    isEmpty(o) {
      return o !== undefined && Object.keys(o).length === 0;
    },
  },
};
</script>

<template>
  <div class="overview-web-console">
    <ButtonDropdown
      :disabled="isOff"
      :no-drop="isOff"
      button-label="Console"
      :dropdown-options="options"
      size="sm"
      @click-action="handleDropdown"
    />
  </div>
</template>

<style lang="scss">
.overview-web-console {
  .btn {
    line-height: 24px;
    min-height: 24px;
  }
}
</style>
