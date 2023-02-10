module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:nuxt/recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  ignorePatterns: ['slim.min.js'],
  rules: {
    'no-console': 'off',
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-redeclare': 'off',
    'no-control-regex': 'off',
    'no-misleading-character-class': 'off',
    camelcase: 'off',
  },
}
