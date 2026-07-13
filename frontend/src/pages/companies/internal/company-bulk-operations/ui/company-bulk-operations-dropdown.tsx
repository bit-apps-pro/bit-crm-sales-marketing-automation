import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Button, Dropdown } from 'antd'
import { LuChevronDown, LuTag, LuTrash2 } from 'react-icons/lu'

import { useSelectedKeys } from '../../../state/use-selected-company-keys-store'
import useBulkOperationsStore from '../state/use-bulk-operations-store'
import DeleteModal from './delete-modal'
import TagsModal from './tags-modal'

const CompanyBulkOperations = () => {
  const selectedKeys = useSelectedKeys()
  const { setAttachTagsModalOpen, setDeleteModalOpen, setDetachTagsModalOpen } = useBulkOperationsStore()

  const handleAttachTagsModalOpen = () => {
    setAttachTagsModalOpen(true)
  }

  const handleDetachTagsModalOpen = () => {
    setDetachTagsModalOpen(true)
  }

  const handleTrashModalOpen = () => {
    setDeleteModalOpen(true)
  }

  const items = [
    {
      capability: CAPABILITIES.COMPANY.UPDATE,
      icon: <LuTag size={14} />,
      key: 'add-tags',
      label: __('Add tags'),
      onClick: handleAttachTagsModalOpen
    },
    {
      capability: CAPABILITIES.COMPANY.UPDATE,
      icon: <LuTag color="red" size={14} />,
      key: 'remove-tags',
      label: __('Remove tags'),
      onClick: handleDetachTagsModalOpen
    },
    {
      capability: CAPABILITIES.LEAD.DELETE,
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: handleTrashModalOpen
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
      <DeleteModal />
    </>
  )
}

export default CompanyBulkOperations
