import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DevTools as JotaiDevelopmentTools } from 'jotai-devtools'
import { StrictMode } from 'react'
import '@resource/styles/antd-reset.css'
import '@resource/styles/wp-css-reset.css'
import '@resource/styles/global.css'
import '@resource/styles/utilities.sass'
import '@resource/styles/variables.css'
import '@resource/styles/onboarding-fullscreen.css'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import 'jotai-devtools/styles.css'
// Emits assets/logo.svg under a stable, unhashed name (see the assetFileNames
// rule in vite.config.ts). Body.php hardcodes that URL for the pre-hydration
// splash, so the file must exist regardless of which chunks a build includes.
import '@resource/logo.svg?no-inline'

import AppRoutes from './AppRoutes'

const queryClient = new QueryClient()
const router = createHashRouter([{ Component: AppRoutes, path: '*' }])
const elm = document.querySelector('#bit-apps-root')
if (elm) {
  const root = createRoot(elm)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {createPortal(
          <>
            <JotaiDevelopmentTools position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          </>,
          document.body
        )}
      </QueryClientProvider>
    </StrictMode>
  )
}
