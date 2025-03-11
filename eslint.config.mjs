// eslint.config.js
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jestPlugin from 'eslint-plugin-jest'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  {
    ignores: ['**/*.js', 'node_modules/', 'coverage/']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        sourceType: 'module',
        ecmaVersion: 2022
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jest: jestPlugin,
      import: importPlugin
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index'
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ]
    }
  },
  {
    files: ['**/__tests__/**/*.ts'],
    ...jestPlugin.configs.recommended
  }
)
