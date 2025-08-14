import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.js'],
  },
];