import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'

export default [
    {
        ignores: ['dist/**', 'lib/**', 'coverage/**', 'node_modules/**']
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: typescriptEslintParser,
            parserOptions: {
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        }
    }
]
