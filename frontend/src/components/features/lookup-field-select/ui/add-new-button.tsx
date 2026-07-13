import { __ } from '@common/helpers/i18nWrap'
import { useEntityQuickCreateActions } from '@features/entity-quick-create/state/use-entity-quick-create-store'
import { Button } from 'antd'
import { useEffect, useRef } from 'react'
import { LuPlus } from 'react-icons/lu'

interface AddNewButtonProps {
  fieldKey: string
  onClose: () => void
  relatedModule: string
}

export default function AddNewButton({ fieldKey, onClose, relatedModule }: AddNewButtonProps) {
  const { handleOpen } = useEntityQuickCreateActions()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleClick = () => {
    onClose()
    timeoutRef.current = setTimeout(() => {
      handleOpen(relatedModule, fieldKey)
    }, 300)
  }

  return (
    <div className="px-3 py-2">
      <Button block icon={<LuPlus />} onClick={handleClick} type="dashed">
        {__('Add New')}
      </Button>
    </div>
  )
}
