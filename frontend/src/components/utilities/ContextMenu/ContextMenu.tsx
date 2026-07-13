import useOnClickOutside from '@common/hooks/useOnClickOutside'
import { type ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import FocusBounder from 'react-focus-bounder'

import cls from './ContextMenu.module.css'

interface ContextMenuType {
  children: ReactNode
  clientX: number
  clientY: number
  closeContextMenu: () => void
}

export default function ContextMenu({ children, clientX, clientY, closeContextMenu }: ContextMenuType) {
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, closeContextMenu)

  const onPressEscCloseContextMenu = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeContextMenu()
  }

  useEffect(() => {
    document.addEventListener('keyup', onPressEscCloseContextMenu)
    return () => {
      document.removeEventListener('keyup', onPressEscCloseContextMenu)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={cls.contextMenu}
      onContextMenuCapture={e => {
        e.preventDefault()
        return false
      }}
      ref={ref}
      style={{ left: `${clientX}px`, top: `${clientY}px` }}
    >
      <FocusBounder>{children}</FocusBounder>
    </div>
  )
}
