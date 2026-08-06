import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, StrictMode, Suspense } from 'react'
import '@resource/styles/antd-reset.css'
import '@resource/styles/wp-css-reset.css'
import '@resource/styles/global.css'
import '@resource/styles/utilities.sass'
import '@resource/styles/variables.css'
import '@resource/styles/onboarding-fullscreen.css'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
// Emits assets/logo.svg under a stable, unhashed name (see the assetFileNames
// rule in vite.config.ts). Body.php hardcodes that URL for the pre-hydration
// splash, so the file must exist regardless of which chunks a build includes.
import '@resource/logo.svg?no-inline'

import AppRoutes from './AppRoutes'
import Devtools from './components/utilities/devtools'

// Public shareable invoice page (no-login, token in URL). The PHP shell mounts
// the same bundle on a frontend page and sets `publicInvoice`; everything else
// is the normal admin app.
const PublicInvoiceApp = lazy(() => import('./public-invoice/public-invoice-app'))
const isPublicInvoicePage = Boolean(SERVER_VARIABLES.publicInvoice)

const queryClient = new QueryClient()
const router = createHashRouter([{ Component: AppRoutes, path: '*' }])
const elm = document.querySelector(
  isPublicInvoicePage ? '#bit-crm-public-invoice-root' : '#bit-apps-root'
)
if (elm) {
  const root = createRoot(elm)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {isPublicInvoicePage ? (
          <Suspense fallback={undefined}>
            <PublicInvoiceApp />
          </Suspense>
        ) : (
          <RouterProvider router={router} />
        )}
        <Devtools reactQuery />
      </QueryClientProvider>
    </StrictMode>
  )
}
