import React, { useEffect } from 'react'

import { StyleProvider } from '@ant-design/cssinjs'
import { Global, ThemeProvider } from '@emotion/react'
import { Button, ConfigProvider, theme } from 'antd'
import { useAtom, useAtomValue } from 'jotai'

import $appConfig from '../frontend/src/common/globalStates/$appConfig'
import { darkThemeConfig, lightThemeConfig } from '../frontend/src/config/theme'
import globalCssInJs from '../frontend/src/resource/globalCssInJs'
import '../frontend/src/resource/styles/utilities.sass'

// DEPRECATED: use globalCssInJs instead
// import '../frontend/src/resource/styles/global.css'
// import '../frontend/src/resource/styles/variables.css'

const { useToken, defaultAlgorithm, darkAlgorithm } = theme

export default function StoriesWrapper({ children }: { children: React.ReactNode }) {
  const { isDarkTheme } = useAtomValue($appConfig)
  const themeAlgorithm = isDarkTheme ? darkAlgorithm : defaultAlgorithm
  const themeTokens = isDarkTheme ? darkThemeConfig : lightThemeConfig

  return (
    <ConfigProvider
      theme={{
        algorithm: themeAlgorithm,
        token: themeTokens
      }}
    >
      <StyleProvider hashPriority="high">
        <ThemeWrapper>{children}</ThemeWrapper>
      </StyleProvider>
    </ConfigProvider>
  )
}

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [appConfig, setAppConfig] = useAtom($appConfig)
  const { isDarkTheme } = appConfig
  const antConfig = useToken()

  useEffect(() => {
    loadFont()
  }, [])

  return (
    <ThemeProvider theme={antConfig}>
      <div
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: antConfig.token.colorBgContainer,
          borderRadius: antConfig.token.borderRadius,
          border: `1px solid ${antConfig.token.controlOutline}`
        }}
        color-scheme={isDarkTheme ? 'dark' : 'light'}
      >
        <Global styles={globalCssInJs(antConfig)} />
        <Button
          shape="circle"
          title="toggle theme"
          icon={isDarkTheme ? '🌙' : '☀️'}
          onClick={() => setAppConfig(prv => ({ ...prv, isDarkTheme: !prv.isDarkTheme }))}
        />
        <div>{children}</div>
      </div>
    </ThemeProvider>
  )
}

function loadFont() {
  const link = document.createElement('link')
  fetch('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap')
    .then(response => response.text())
    .then(data => {
      link.type = 'text/css'
      link.rel = 'stylesheet'
      link.href = `data:text/css;charset=utf-8,${encodeURIComponent(data)}`
      document.head.appendChild(link)
    })
}
