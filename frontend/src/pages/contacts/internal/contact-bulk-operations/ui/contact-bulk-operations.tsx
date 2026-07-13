import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { useContactStoreSelectedKeys } from '@pages/contacts/state/use-selected-contact-keys-store'
import { Button, Dropdown } from 'antd'
import { LuChevronDown, LuTag, LuTrash2 } from 'react-icons/lu'

import useContactBulkOperationsStore from '../state/use-contact-bulk-operations-store'
import DeleteModal from './delete-modal'
import TagsModal from './tags-modal'

export default function ContactBulkOperations() {
  const selectedContactKeys = useContactStoreSelectedKeys()
  const { setAddTagModalOpen, setDeleteModalOpen, setRemoveTagModalOpen } =
    useContactBulkOperationsStore()

  const handleDeleteModal = () => {
    setDeleteModalOpen(true)
  }

  const handleAddTagModal = () => {
    setAddTagModalOpen(true)
  }

  const handleRemoveTagModal = () => {
    setRemoveTagModalOpen(true)
  }

  const items = [
    {
      capability: CAPABILITIES.CONTACT.UPDATE,
      icon: <LuTag size={14} />,
      key: 'add-tags',
      label: __('Add tags'),
      onClick: handleAddTagModal
    },
    {
      capability: CAPABILITIES.CONTACT.UPDATE,
      icon: <LuTag className="text-red-500" size={14} />,
      key: 'remove-tags',
      label: __('Remove tags'),
      onClick: handleRemoveTagModal
    },
    {
      capability: CAPABILITIES.CONTACT.DELETE,
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
          {__('Bulk Actions')} <span>({selectedContactKeys.length})</span>
          <LuChevronDown />
        </Button>
      </Dropdown>
      <TagsModal />
      <DeleteModal />
    </>
  )
}
