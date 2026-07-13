import { $paneContextMenu } from '@common/globalStates'
import { __ } from '@common/helpers/i18nWrap'
import DeleteIcon from '@icons/DeleteIcon'
import css from '@utilities/ContextMenu/ContextMenu.module.css'
import DropDown from '@utilities/DropDown'
import { Button, Space } from 'antd'
import { useAtom } from 'jotai'
import { type MouseEvent } from 'react'
import FocusBounder from 'react-focus-bounder'
import { hideAll } from 'tippy.js'
import { vi } from 'vitest'

import ContextMenu from './ContextMenu'

export default function ContextMenuStory() {
  const [contextMenuOpen, setContextMenuOpen] = useAtom($paneContextMenu)

  const onRightClickHandle = (e: MouseEvent) => {
    e.preventDefault()
    setContextMenuOpen({
      clientX: e.pageX,
      clientY: e.pageY,
      isOpen: true
    })
  }

  const closeContextMenu = () =>
    setContextMenuOpen({
      clientX: 0,
      clientY: 0,
      isOpen: false
    })

  return (
    <>
      {contextMenuOpen.isOpen && (
        <ContextMenu
          clientX={contextMenuOpen.clientX}
          clientY={contextMenuOpen.clientY}
          closeContextMenu={closeContextMenu}
        >
          <div className={css.nodeEdgeContextMenu}>
            <DropDown btnClassName={`${css.contextMenuItem} ${css.contextMenuDeleteBtn}`}>
              <>
                <DeleteIcon size={15} />
                {__('Delete')}
              </>
              <FocusBounder>
                <div className={css.deleteConfirmationCard}>
                  <span className={css.deleteConfirmationHeaderIcon}>
                    <DeleteIcon size={18} stroke={1.5} />
                  </span>
                  <h2 className={css.deleteConfirmationTitle}>{__('Are you sure delete this item?')}</h2>
                  <Space>
                    <Button onClick={() => hideAll()}>{__('Cancel')}</Button>
                    <Button onClick={vi.fn()} type="primary">
                      {__('Delete')}
                    </Button>
                  </Space>
                </div>
              </FocusBounder>
            </DropDown>
          </div>
        </ContextMenu>
      )}
      <div
        className="flx jc-cen ai-cen"
        onContextMenu={onRightClickHandle}
        style={{ backgroundColor: '#e5e5e5', height: 200, width: 400 }}
      >
        {__('Right Mouse Click Here')}
      </div>
    </>
  )
}
