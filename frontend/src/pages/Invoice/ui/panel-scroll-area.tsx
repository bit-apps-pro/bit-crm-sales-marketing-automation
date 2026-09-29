import { cn } from '@common/helpers/globalHelpers'
import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * The scroll box every list panel of the invoice sidebar shares with the
 * timeline: it stops growing at the same height and scrolls internally once
 * the list gets long, so no single panel can stretch the sidebar past the
 * invoice preview. The negative inline margin keeps item borders and shadows
 * from being clipped by the scroll container.
 */
export default function PanelScrollArea({ children, className }: Props) {
  return (
    <div
      className={cn('scroller thin max-h-72 overflow-y-auto p-2', className)}
      style={{ marginInline: '-10px', paddingInline: '10px' }}
    >
      {children}
    </div>
  )
}
