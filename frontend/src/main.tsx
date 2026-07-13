// import '@resource/styles/global.css'
// import '@resource/styles/utilities.sass'
// import '@resource/styles/wp-css-reset.css'
// import 'antd/dist/reset.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DevTools as JotaiDevelopmentTools } from 'jotai-devtools'
import { StrictMode } from 'react'
import '@plugin-commons/resources/css/antd-reset.css'
import '@plugin-commons/resources/css/wp-css-reset.css'
import '@resource/styles/global.css'
import '@resource/styles/utilities.sass'
import '@resource/styles/variables.css'
import '@resource/styles/onboarding-fullscreen.css'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import 'jotai-devtools/styles.css'

import AppRoutes from './AppRoutes'

const queryClient = new QueryClient()
const elm = document.querySelector('#bit-apps-root')
if (elm) {
  const root = createRoot(elm)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
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
