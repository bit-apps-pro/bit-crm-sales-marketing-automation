import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { Layout as AntLayout, Space } from 'antd'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router'

import SettingsSidebar from './internal/settings-sidebar'

const { Content } = AntLayout

const fallbackOf = () => {
  return (
    <Space className="p-6">
      {__('Loading')}
      <LoadingOutlined />
    </Space>
  )
}

export default function SettingsLayout() {
  const { pathname } = useLocation()

  return (
    <AntLayout className="bg-transparent px-6 py-4" hasSider>
      <SettingsSidebar />
      <Content className="min-h-[80vh] rounded-r-md border border-l-0 border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <Suspense fallback={fallbackOf()} key={pathname}>
          <Outlet />
        </Suspense>
      </Content>
    </AntLayout>
  )
}
