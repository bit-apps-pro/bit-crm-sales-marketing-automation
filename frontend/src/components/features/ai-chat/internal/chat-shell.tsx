import { CloseOutlined, CompressOutlined, ExpandOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Tooltip, Typography } from 'antd'
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import cls from '../ai-chat.module.css'
import AssistantIcon from './assistant-icon'

/** Two states only: docked by the launcher, or the whole screen. */
type PanelSize = 'compact' | 'full'

/** The launcher is 52px tall on a 24px gutter; 12px of air above it. */
const ANCHOR_BOTTOM = 88
const ANCHOR_RIGHT = 24

/*
 * Widths are clamped against the viewport. An unclamped fixed element wider
 * than the window extends the scrollable area, which is the other half of the
 * sideways jolt on open.
 */
const GEOMETRY: Record<PanelSize, CSSProperties> = {
  compact: {
    borderRadius: 16,
    bottom: ANCHOR_BOTTOM,
    height: `min(520px, calc(100vh - ${ANCHOR_BOTTOM + 24}px))`,
    right: ANCHOR_RIGHT,
    width: `min(400px, calc(100vw - ${ANCHOR_RIGHT * 2}px))`
  },
  /*
   * Genuinely the whole screen — over the WordPress admin bar and menu, not
   * inset within the CRM's own frame. Anything less is a bigger panel, not
   * full screen.
   */
  full: {
    borderRadius: 0,
    height: '100vh',
    left: 0,
    top: 0,
    width: '100vw'
  }
}

interface ChatShellProps {
  children: ReactNode
  /** Extra header buttons, placed before the built-in controls. */
  headerActions?: ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  /** Off for panels with nothing worth expanding, such as the setup notice. */
  resizable?: boolean
}

/**
 * The launcher and the panel around whatever the assistant currently has to
 * show — the conversation once it is configured, the setup notice before that.
 *
 * Deliberately free of everything AI: it holds no provider, no transcript and
 * no request. That keeps it usable from the free plugin, where the panel exists
 * but only ever points at settings, without dragging the pro chat code into the
 * free bundle behind it.
 */
export default function ChatShell({
  children,
  headerActions,
  onOpenChange,
  open,
  resizable = true
}: ChatShellProps) {
  const [size, setSize] = useState<PanelSize>('compact')

  const panelRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)

  /*
    Dismiss on a click anywhere else.

    Two things are deliberately not "outside". The launcher already toggles, so
    handling its click here too would close and immediately reopen. And antd
    renders tooltips and dropdowns into document.body rather than inside the
    panel, so a DOM containment test alone would treat the widget's own overlays
    as foreign and shut it mid-interaction.

    Closing loses nothing: the transcript and the draft both live above this
    component, so reopening restores exactly what was there.
  */
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null

      if (!target || panelRef.current?.contains(target) || launcherRef.current?.contains(target)) {
        return
      }

      if (
        typeof target.closest === 'function' &&
        target.closest('.ant-tooltip, .ant-dropdown, .ant-select-dropdown, .ant-message')
      ) {
        return
      }

      onOpenChange(false)
    }

    // mousedown rather than click, so the panel goes away on press instead of
    // lingering until release.
    document.addEventListener('mousedown', onPointerDown)

    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [onOpenChange, open])

  const isFull = resizable && size === 'full'

  /*
    Rendered into document.body rather than in place. A z-index only competes
    within its own stacking context, and the CRM app sits inside one — so from
    within the tree no value, however large, can paint over the WordPress admin
    bar and menu. As a direct child of body the panel is finally a sibling of
    that chrome, which is what "takes over the entire screen" requires.
  */
  return createPortal(
    <>
      {/*
        Tooltip is pinned left: antd portals it to the body, and at the default
        placement it renders past the right edge and widens the document, which
        flicks the horizontal scrollbar in and out.
      */}
      <Tooltip placement="left" title={open ? __('Close assistant') : __('Ask AI')}>
        <button
          aria-label={open ? __('Close assistant') : __('Ask AI')}
          className={cls.launcher}
          onClick={() => onOpenChange(!open)}
          ref={launcherRef}
          type="button"
        >
          {open ? <CloseOutlined style={{ fontSize: 18 }} /> : <AssistantIcon />}
        </button>
      </Tooltip>

      {open && (
        <div
          className={`${cls.panel} ${isFull ? cls.full : ''}`}
          ref={panelRef}
          style={GEOMETRY[isFull ? 'full' : 'compact']}
        >
          <div className={cls.header}>
            <div className="flex items-center gap-2">
              <span className="text-[#6E62E5]">
                <AssistantIcon size={16} />
              </span>
              <Typography.Text strong>{__('AI Assistant')}</Typography.Text>
            </div>

            <div className="flex items-center gap-1">
              {headerActions}

              {resizable && (
                <Tooltip title={isFull ? __('Shrink') : __('Full screen')}>
                  <Button
                    icon={isFull ? <CompressOutlined /> : <ExpandOutlined />}
                    onClick={() => setSize(isFull ? 'compact' : 'full')}
                    size="small"
                    type="text"
                  />
                </Tooltip>
              )}

              <Tooltip title={__('Close')}>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => onOpenChange(false)}
                  size="small"
                  type="text"
                />
              </Tooltip>
            </div>
          </div>

          {children}
        </div>
      )}
    </>,
    document.body
  )
}
