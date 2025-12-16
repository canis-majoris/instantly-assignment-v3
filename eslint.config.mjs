import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  // Use single quotes instead of double quotes
  {
    rules: {
      'quotes': [ 'error', 'single', { 'avoidEscape': true } ],
      'semi': [ 'error', 'always' ],
      'comma-dangle': [ 'error', 'always-multiline' ],
      'no-trailing-spaces': 'error',
      'eol-last': [ 'error', 'always' ],
      'indent': [ 'error', 2 ],
      'object-curly-spacing': [ 'error', 'always' ],
    },
  },
];

export default eslintConfig;
