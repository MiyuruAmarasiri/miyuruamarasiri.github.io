module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['webpack*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        node: true,
      },
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
