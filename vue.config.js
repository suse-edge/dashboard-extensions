// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('@rancher/shell/vue.config');

module.exports = config(__dirname, {
  excludes: [],
  // excludes: ['fleet', 'example']
});
