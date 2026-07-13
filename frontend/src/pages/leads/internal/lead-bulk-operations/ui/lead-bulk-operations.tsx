import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { useLeadStoreSelectedKeys } from '@pages/leads/state/use-selected-lead-keys-store'
import { Button, Dropdown } from 'antd'
import { LuChevronDown, LuRefreshCcw, LuTag, LuTrash2 } from 'react-icons/lu'

import useLeadBulkOperationsStore from '../state/use-lead-bulk-operations-store'
import ConversionModal from './conversion-modal'
import DeleteModal from './delete-modal'
import TagsModal from './tags-modal'

export default function LeadBulkOperations() {
  const selectedLeadKeys = useLeadStoreSelectedKeys()
  const { setAddTagModalOpen, setConversionModalOpen, setDeleteModalOpen, setRemoveTagModalOpen } =
    useLeadBulkOperationsStore()

  const handleDeleteModal = () => {
    setDeleteModalOpen(true)
  }

  const handleAddTagModal = () => {
    setAddTagModalOpen(true)
  }

  const handleRemoveTagModal = () => {
    setRemoveTagModalOpen(true)
  }

  const handleConversionModal = () => {
    setConversionModalOpen(true)
  }

  const items = [
    {
      capability: CAPABILITIES.LEAD.UPDATE,
      icon: <LuTag size={14} />,
      key: 'add-tags',
      label: __('Add tags'),
      onClick: handleAddTagModal
    },
    {
      capability: CAPABILITIES.LEAD.UPDATE,
      icon: <LuTag className="text-red-500" size={14} />,
      key: 'remove-tags',
      label: __('Remove tags'),
      onClick: handleRemoveTagModal
    },
    {
      capability: CAPABILITIES.LEAD.UPDATE,
      icon: <LuRefreshCcw size={14} />,
      key: 'convert',
      label: __('Convert'),
      onClick: handleConversionModal
    },
    {
      capability: CAPABILITIES.LEAD.DELETE,
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: handleDeleteModal
    }
  ]

  const availableItems = items.filter(item => item.capability && checkCapability(item.capability))

  return (
    <>
      <Dropdown menu={{ items: availableItems }} placement="bottom" trigger={['click']}>
        <Button className="flex items-center gap-1 rounded-full text-sm" size="large">
          {__('Bulk Actions')} <span>({selectedLeadKeys.length})</span>
          <LuChevronDown />
        </Button>
      </Dropdown>
      <ConversionModal />
      <TagsModal />
      <DeleteModal />
    </>
  )
}
