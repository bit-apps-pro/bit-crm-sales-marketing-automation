import react from '@vitejs/plugin-react'
import { generateBuildCodeNamePlugin } from 'bitapps-dev-utils'
import { humanId } from 'human-id'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const { DEV_SSL, DEV_SSL_CERT_PATH, DEV_SSL_KEY_PATH, PLUGIN_SLUG, SERVER_VARIABLES } = loadEnv(
    mode,
    process.cwd(),
    ''
  )

  const isDevelopment = mode === 'development' || mode === 'test'
  const isTest = mode === 'test'
  const folderName = path.basename(process.cwd())
  const ASSETS_DIR = 'assets'
  const codeName = humanId({ capitalize: false, separator: '-' })

  return {
    assetsDir: 'assets',
    base: isDevelopment ? `/wp-content/plugins/${folderName}/frontend/` : '',
    build: {
      emptyOutDir: true,
      // Two entries (main + portal) make Rollup hoist everything they share --
      // Tailwind's utilities and antd's base styles included -- into a common
      // chunk whose CSS is a separate file. PHP can't guess that hashed name,
      // so the manifest is what lets it enqueue the entry's full CSS set.
      manifest: 'ba-assets-manifest.json',
      outDir: `../${ASSETS_DIR}`,
      rollupOptions: {
        input: path.resolve(import.meta.dirname, 'frontend/src/main.tsx'),
        output: {
          assetFileNames: fInfo => {
            const pathArr = fInfo?.name?.split('/')
            const fileName = pathArr?.at(-1)

            if (fileName === 'main.css') {
              return `main-${PLUGIN_SLUG}-ba-assets-${codeName}.css`
            }

            if (fileName === 'logo.svg') {
              return `logo.svg`
            }

            return `${PLUGIN_SLUG}-ba-assets-[hash].[ext]`
          },
          chunkFileNames: fInfo => {
            if (fInfo?.facadeModuleId?.includes('lucide-react')) {
              return `icons/[name]-[hash].js`
            }
            const name = typeof fInfo.name === 'string' ? fInfo.name.slice(0, 8).toLowerCase() : ''
            return name + '-[hash].js'
          },
          entryFileNames: `main-${codeName}.js`,
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
            preset: 'es2015'
          }
        }
      }
    },
    define: {
      ...(!isTest && { SERVER_VARIABLES: `window.${SERVER_VARIABLES}` })
    },
    plugins: [
      react({
        babel: {
          plugins: ['@emotion/babel-plugin'],
          presets: ['jotai/babel/preset']
        },
        jsxImportSource: '@emotion/react',
        jsxRuntime: 'automatic'
      }),
      tsconfigPaths(),
      generateBuildCodeNamePlugin({ codeName, dir: ASSETS_DIR })
    ],
    root: 'frontend',
    server: {
      ...(DEV_SSL === 'true' && {
        https: {
          cert: DEV_SSL_CERT_PATH,
          key: DEV_SSL_KEY_PATH
        }
      }),
      cors: true, // required to load scripts from custom host
      hmr: { host: 'localhost' },
      port: 3000,
      strictPort: true // strict port to match on PHP side
    },
    ssr: {
      noExternal: isTest ? ['@vitejs/plugin-react'] : []
    },
    test: {
      environment: 'happy-dom',
      // environment: 'jsdom',
      globals: true,
      include: ['frontend/src/**/*.test.{tsx,ts}'],
      root: './',
      setupFiles: ['./frontend/src/config/test.setup.ts'],
      testTimeout: 10_000
    }
  }
})
