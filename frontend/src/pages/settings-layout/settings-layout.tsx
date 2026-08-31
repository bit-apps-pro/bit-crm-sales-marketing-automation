import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { Layout as AntLayout, Space } from 'antd'
import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'

import SettingsSidebar from './internal/settings-sidebar'

const { Content } = AntLayout

const SCROLL_RESET_THRESHOLD = 150

const scrollParentOf = (element: HTMLElement | null) => {
  let node = element?.parentElement ?? undefined
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement ?? undefined
  }
}

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
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const scroller = scrollParentOf(contentRef.current)
    if (scroller && scroller.scrollTop > SCROLL_RESET_THRESHOLD) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scroller.scrollTo({ behavior: reduceMotion ? 'auto' : 'smooth', top: 0 })
    }
  }, [pathname])

  return (
    <AntLayout className="bg-transparent px-6 py-4" hasSider>
      <SettingsSidebar />
      <Content
        className="flex min-h-[80vh] flex-col rounded-e-md border border-s-0 border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900"
        ref={contentRef}
      >
        <Suspense fallback={fallbackOf()} key={pathname}>
          <div className="flex grow flex-col [&>*]:flex [&>*]:grow [&>*]:flex-col">
            <Outlet />
          </div>
        </Suspense>
      </Content>
    </AntLayout>
  )
}
