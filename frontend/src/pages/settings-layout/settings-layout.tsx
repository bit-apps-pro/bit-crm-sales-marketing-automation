import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import useBreakpoint from '@common/hooks/use-breakpoint'
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
  const isDesktop = useBreakpoint('lg')

  useEffect(() => {
    const scroller = scrollParentOf(contentRef.current)
    if (scroller && scroller.scrollTop > SCROLL_RESET_THRESHOLD) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scroller.scrollTo({ behavior: reduceMotion ? 'auto' : 'smooth', top: 0 })
    }
  }, [pathname])

  /*
    `hasSider` is only correct while there is a real sidebar column.

    It adds `.ant-layout-has-sider`, which forces `flex-direction: row` AND
    `> .ant-layout-content { width: 0 }` -- the content is then sized purely by `flex`.
    Below `lg` the Sider is hidden and replaced by a full-width Select, so with `hasSider`
    still on, that Select and the content would sit side by side and the content would
    collapse to a sliver (a `width: 0` box holding wrapped single letters). A class cannot
    undo it: the rule is antd's own and `flex-col` does not clear the `width: 0`.

    So the prop itself is toggled off below `lg`, which is also what makes the plain
    `flex-col` default apply. The content's rounding and border assume a sidebar butted
    against its leading edge; with none there, it closes back into its own box.
  */
  return (
    <AntLayout className="bg-transparent px-4 py-4 sm:px-6" hasSider={isDesktop}>
      <SettingsSidebar />
      <Content
        className="lg:rounded-s-none flex min-h-[80vh] flex-col rounded-md border border-solid border-[#EBEAFF] bg-white lg:border-s-0 dark:border-neutral-700 dark:bg-neutral-900"
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
