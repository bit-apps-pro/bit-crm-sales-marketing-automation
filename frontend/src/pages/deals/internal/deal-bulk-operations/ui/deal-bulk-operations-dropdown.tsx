import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { useSelectedKeysStore } from '@pages/deals/state/use-selected-deal-keys-store'
import { Button, Dropdown } from 'antd'
import { LuChevronDown, LuTag, LuTrash2 } from 'react-icons/lu'

import { useBulkOperationActionsStore } from '../state/use-bulk-operations-store'
import TrashModal from './delete-modal'
import TagsModal from './tags-modal'

export default function DealBulkOperations() {
  const selectedKeys = useSelectedKeysStore()
  const { setAttachTagsModalOpen, setDeleteModalOpen, setDetachTagsModalOpen } =
    useBulkOperationActionsStore()

  const handleAttachTagsModalOpen = () => {
    setAttachTagsModalOpen(true)
  }

  const handleDetachTagsModalOpen = () => {
    setDetachTagsModalOpen(true)
  }

  const handleDeleteModalOpen = () => {
    setDeleteModalOpen(true)
  }

  const items = [
    {
      capability: CAPABILITIES.DEAL.UPDATE,
      icon: <LuTag size={14} />,
      key: 'add-tags',
      label: __('Add tags'),
      onClick: handleAttachTagsModalOpen
    },
    {
      capability: CAPABILITIES.DEAL.UPDATE,
      icon: <LuTag color="red" size={14} />,
      key: 'remove-tags',
      label: __('Remove tags'),
      onClick: handleDetachTagsModalOpen
    },
    {
      capability: CAPABILITIES.DEAL.DELETE,
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: handleDeleteModalOpen
    }
  ]

  const availableItems = items.filter(item => item.capability && checkCapability(item.capability))

  return (
    <>
      <Dropdown menu={{ items: availableItems }} placement="bottom" trigger={['click']}>
        <Button className="flex items-center gap-1 rounded-full text-sm" size="large">
          {__('Bulk Actions')} <span>({selectedKeys.length})</span>
          <LuChevronDown />
        </Button>
      </Dropdown>

      <TagsModal />
      <TrashModal />
    </>
  )
}
