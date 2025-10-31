// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import next from 'eslint-config-next'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'out/**',
      'build/**',
      'coverage/**',
      '*.config.*'
    ]
  },

  // Base TypeScript
  {
    files: ['api/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },

  // Next.js
  {
    files: ['frontend/**/*.{js,jsx,ts,tsx}'],
    ...next['core-web-vitals'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-img-element': 'off'
    }
  }
])
