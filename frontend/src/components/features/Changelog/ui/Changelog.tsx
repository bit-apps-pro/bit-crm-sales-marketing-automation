import { __ } from '@common/helpers/i18nWrap'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { LuFileLock } from 'react-icons/lu'

import ChangelogContent from './ChangelogContent'

export default function Changelog() {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div>
      <Button icon={<LuFileLock />} onClick={handleOpen}>
        {__("What's new")}
      </Button>

      <Drawer onClose={handleClose} open={isOpen}>
        <ChangelogContent />
      </Drawer>
    </div>
  )
}
