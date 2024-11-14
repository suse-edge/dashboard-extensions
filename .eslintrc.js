module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "node": true
  },
  "globals": {
    "NodeJS": true,
    "Timer": true
  },
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser"
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:cypress/recommended",
    "@vue/eslint-config-prettier",
    "prettier"
  ],
  "plugins": [
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "vue/one-component-per-file": "off",
    "vue/no-deprecated-slot-attribute": "off",
    "vue/require-explicit-emits": "off",
    "vue/v-on-event-hyphenation": "off"
  }
}