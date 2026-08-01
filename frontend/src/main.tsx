import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DevTools as JotaiDevelopmentTools } from 'jotai-devtools'
import { lazy, StrictMode, Suspense } from 'react'
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

import AppRoutes from './AppRoutes'

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
