import { LoadingOutlined } from '@ant-design/icons'
import { $appConfig } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import { Global, ThemeProvider } from '@emotion/react'
import globalCssInJs from '@resource/globalCssInJs'
import OfflineBanner from '@utilities/OfflineBanner'
import { Layout as AntLayout, Space, theme } from 'antd'
import { useAtomValue } from 'jotai'
import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

import Header from './header'
import cls from './Layout.module.css'

const { useToken } = theme
const { Content } = AntLayout

const fallbackOf = () => {
  return (
    <Space className="p-6">
      {__('Loading')}
      <LoadingOutlined />
    </Space>
  )
}

export default function Layout() {
  const { isDarkTheme } = useAtomValue($appConfig)
  const antConfig = useToken()
  const { pathname } = useLocation()
  const suspenseKey = pathname.split('/')[1]

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkTheme])

  return (
    <ThemeProvider theme={antConfig}>
      <Global styles={globalCssInJs(antConfig, isDarkTheme)} />
      <OfflineBanner />
      <AntLayout
        className={cls.layoutWrp}
        color-scheme={isDarkTheme ? 'dark' : 'light'}
        style={{
          border: `1px solid ${antConfig.token.controlOutline}`,
          borderRadius: antConfig.token.borderRadius
        }}
      >
        <Header />
        <Content className="scroller thin overflow-auto dark:bg-transparent">
          <Suspense fallback={fallbackOf()} key={suspenseKey}>
            <Outlet />
          </Suspense>
        </Content>
      </AntLayout>
    </ThemeProvider>
  )
}
