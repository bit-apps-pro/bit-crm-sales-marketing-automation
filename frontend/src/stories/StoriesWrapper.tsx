/* eslint-disable i18next/no-literal-string */
import { $appConfig } from '@common/globalStates'
import { useAtom } from 'jotai'
import '@resource/styles/global.css'
import '@resource/styles/utilities.sass'
import '@resource/styles/variables.css'
import { useEffect } from 'react'

function Wrapper({ children }: { children: React.ReactNode }) {
  const [appConfig, setAppConfig] = useAtom($appConfig)
  const { isDarkTheme } = appConfig

  useEffect(() => {
    const link = document.createElement('link')
    fetch('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap')
      .then(response => response.text())
      .then(data => {
        link.type = 'text/css'
        link.rel = 'stylesheet'
        link.href = `data:text/css;charset=utf-8,${encodeURIComponent(data)}`
        document.head.append(link)
      })
  }, [])

  return (
    <div>
      <button
        onClick={() => setAppConfig(prv => ({ ...prv, isDarkTheme: !prv.isDarkTheme }))}
        type="button"
      >
        Toggle Dark
      </button>
      <div
        data-color-scheme={isDarkTheme ? 'dark' : 'light'}
        style={{
          alignItems: 'center',
          background: 'var(--bg)',
          display: 'flex',
          justifyContent: 'center',
          margin: 50,
          minHeight: '20vh'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function StoriesWrapper({ children }: { children: React.ReactNode }) {
  return <Wrapper>{children}</Wrapper>
}
