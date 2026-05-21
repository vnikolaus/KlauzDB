import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node18',
    outDir: 'dist',
    outExtension({ format }) {
        return {
            js: format === 'esm' ? '.mjs' : '.cjs'
        }
    }
})
